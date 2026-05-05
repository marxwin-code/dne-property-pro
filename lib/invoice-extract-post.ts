import pdfParse from "@/lib/pdf-parse-server";
import { NextResponse } from "next/server";
import {
  invoiceExtractEnvSnapshot,
  jsonError,
  type InvoiceExtractInvoiceRow,
  type InvoiceExtractSuccessBody
} from "@/lib/api-json";
import { INVOICE_NOT_FOUND_TOKEN, INVOICE_NO_MATCH_MESSAGE } from "@/lib/invoice-extract-constants";
import { loadInvoiceExtractRuntimeConfig } from "@/lib/invoice-extract-config";
import { invoiceExtractLog } from "@/lib/invoice-extract-log";
import { fetchInvoicePropertyRows } from "@/lib/invoice-extract";
import type { InvoicePropertyRow } from "@/lib/invoice-extract";
import { matchTaskforceAddressToProperty, normalizeAddress } from "@/lib/taskforce-address-match";
import { parseTaskforceInvoiceFromPdfText } from "@/lib/taskforce-invoice-parse";
import type { TaskforceParsedInvoice } from "@/lib/taskforce-invoice-parse";
import {
  buildTaskforceWeeklyExcelBuffer,
  getTaskforceWeeklyTemplatePath,
  type TaskforceWeeklyExcelRow
} from "@/lib/taskforce-weekly-excel";

function mapAirtableStatus(status: number): number {
  if (status >= 500) return 502;
  return status;
}

function isPdfMagic(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

async function pdfBufferToText(buffer: Buffer): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const result = await pdfParse(buffer);
    return { ok: true, text: result.text ?? "" };
  } catch (e) {
    invoiceExtractLog("error", "pdf_parse_failure", { errorReason: String(e) });
    return { ok: false, error: "PDF parse failed." };
  }
}

/** Small JSON payload for client UI when Excel is returned as binary body (avoids huge base64 + JSON limits). */
export const INVOICE_EXTRACT_META_HEADER = "X-Invoice-Extract-Meta";

function handlerErrorResponse(message: string): NextResponse<{ success: false; error: string }> {
  return NextResponse.json({ success: false, error: message }, { status: 422 });
}

type ParsedInvoiceRow = {
  fileName: string;
  invoice: TaskforceParsedInvoice;
  matchedPropertyId: string;
};

function topAttemptedMatches(pdfAddress: string, rows: InvoicePropertyRow[], limit = 3): string[] {
  const normalizedPdf = normalizeAddress(pdfAddress);
  const pdfTokens = new Set(normalizedPdf.split(" ").filter(Boolean));
  const scored: Array<{ address: string; score: number }> = [];

  for (const row of rows) {
    const raw = String(row.address ?? "").trim();
    if (!raw) continue;
    const normalized = normalizeAddress(raw);
    if (!normalized) continue;
    const score = normalized
      .split(" ")
      .filter(Boolean)
      .reduce((n, tok) => n + (pdfTokens.has(tok) ? 1 : 0), 0);
    scored.push({ address: raw, score });
  }

  scored.sort((a, b) => b.score - a.score || a.address.length - b.address.length);
  return scored.slice(0, limit).map((x) => x.address);
}

function toExcelRow(inv: TaskforceParsedInvoice, pid: string): TaskforceWeeklyExcelRow {
  const accountNumber = `${pid}-110-60721`;
  const accountRtaList = `PR# ${pid}-110-60721`;
  const numAmt = parseFloat(inv.amount);
  const amountCell = Number.isFinite(numAmt) ? numAmt : inv.amount;
  return {
    ledger: "PR",
    accountNumber,
    gstCode: "C",
    amount: amountCell,
    service: inv.description_combined,
    address: inv.address,
    invoiceNumber: inv.invoice_number,
    hcaReference: pid,
    accountRtaList,
    notes: ""
  };
}

/**
 * POST /api/invoice-extract — batch Taskforce PDFs → one deduped Excel (no AI).
 */
export async function handleInvoiceExtractPost(request: Request): Promise<Response> {
  const snapshot = invoiceExtractEnvSnapshot();
  const requestInfo = { method: request.method, url: request.url };

  try {
    console.log("[invoice-extract] request received", requestInfo);
    invoiceExtractLog("info", "request_received", { ...requestInfo, ...snapshot });

    const cfg = loadInvoiceExtractRuntimeConfig();
    const { limits } = cfg;

    if (contentLengthExceeds(request, limits.maxBatchTotalBytes)) {
      invoiceExtractLog("error", "payload_too_large", { ...snapshot, ...requestInfo });
      return jsonError(
        413,
        `Request body exceeds maximum batch size of ${Math.round(limits.maxBatchTotalBytes / (1024 * 1024))} MB.`
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      invoiceExtractLog("error", "multipart_parse_failed", { ...snapshot, ...requestInfo });
      return jsonError(400, "Invalid form data.");
    }

    const files = formData.getAll("files").filter((v): v is File => v instanceof File);
    const filesReceived = files.length;

    if (filesReceived < 1) {
      invoiceExtractLog("error", "invalid_file_count", { count: filesReceived, ...requestInfo });
      return jsonError(400, "Upload at least one PDF file.");
    }

    if (filesReceived > limits.maxFilesPerBatch) {
      invoiceExtractLog("error", "too_many_files", { count: filesReceived, max: limits.maxFilesPerBatch });
      return jsonError(400, `You can upload at most ${limits.maxFilesPerBatch} PDF files per request.`);
    }

    let totalBytes = 0;
    for (const f of files) {
      totalBytes += f.size;
    }
    if (totalBytes > limits.maxBatchTotalBytes) {
      invoiceExtractLog("error", "batch_total_too_large", { totalBytes, max: limits.maxBatchTotalBytes });
      return jsonError(
        413,
        `Total upload size exceeds ${Math.round(limits.maxBatchTotalBytes / (1024 * 1024))} MB.`
      );
    }

    for (const file of files) {
      const fileName = file.name || "upload.pdf";
      if (file.size > limits.maxBatchTotalBytes) {
        return jsonError(413, `File "${fileName}" exceeds maximum batch size per file.`);
      }
      const mime = (file.type || "").toLowerCase();
      const nameOk = fileName.toLowerCase().endsWith(".pdf");
      if (mime !== "application/pdf" && !nameOk) {
        invoiceExtractLog("error", "invalid_mime", { fileName, mime, ...requestInfo });
        return jsonError(400, `Not a PDF: "${fileName}".`);
      }
    }

    console.log("[invoice-extract] loading Airtable properties once", {
      table: cfg.tableName
    });
    invoiceExtractLog("info", "airtable_fetch_start", {
      table: cfg.tableName,
      fields: ["address", "property_id"]
    });

    const propertyLoad = await fetchInvoicePropertyRows({
      tableName: cfg.tableName
    });
    if (!propertyLoad.ok) {
      invoiceExtractLog("error", "airtable_load_failed", {
        ...snapshot,
        ...requestInfo,
        errorReason: propertyLoad.error,
        httpStatus: propertyLoad.status
      });
      return jsonError(mapAirtableStatus(propertyLoad.status), propertyLoad.error);
    }

    const records = propertyLoad.rows;
    console.log("[invoice-extract] Airtable rows:", records.length);
    invoiceExtractLog("info", "airtable_fetch_done", { rowCount: records.length });

    const parsed: ParsedInvoiceRow[] = [];

    for (const file of files) {
      const fileName = file.name || "upload.pdf";
      console.log("[invoice-extract] reading PDF", { fileName, bytes: file.size });
      invoiceExtractLog("info", "pdf_read_start", { fileName, bytes: file.size });

      const buf = Buffer.from(await file.arrayBuffer());
      if (!isPdfMagic(buf)) {
        invoiceExtractLog("error", "pdf_magic_invalid", { fileName, ...requestInfo });
        return jsonError(400, `File is not a valid PDF: "${fileName}".`);
      }

      const pdf = await pdfBufferToText(buf);
      if (!pdf.ok) {
        invoiceExtractLog("error", "pdf_text_pipeline_failed", { fileName, errorReason: pdf.error });
        return jsonError(422, `${fileName}: ${pdf.error}`);
      }

      console.log("[invoice-extract] parsing", fileName);
      const extracted = parseTaskforceInvoiceFromPdfText(pdf.text, limits.maxPdfChars);
      if (!extracted.ok) {
        invoiceExtractLog("error", "taskforce_parse_failed", { fileName, errorReason: extracted.error });
        return jsonError(422, `${fileName}: ${extracted.error}`);
      }

      const inv = extracted.data;
      const extractedAddress = inv.address.trim();
      const match = matchTaskforceAddressToProperty(extractedAddress, records);
      if (!match.ok) {
        invoiceExtractLog("error", "taskforce_match_internal_error", { fileName, errorReason: match.error });
        return jsonError(422, `${fileName}: ${match.error}`);
      }

      const matchedPropertyId = String(match.property_id);
      if (matchedPropertyId === INVOICE_NOT_FOUND_TOKEN) {
        const normalizedPdf = normalizeAddress(extractedAddress);
        const dbSample = records
          .map((r) => normalizeAddress(String(r.address ?? "")))
          .filter(Boolean)
          .slice(0, 5);
        console.log({
          pdfAddress: extractedAddress,
          normalizedPdf,
          dbSample
        });
        invoiceExtractLog("error", "no_property_match", { fileName, extractedAddress });
        return NextResponse.json(
          {
            success: false,
            error: `${fileName}: ${INVOICE_NO_MATCH_MESSAGE}`,
            extracted_address: extractedAddress,
            normalized_address: normalizedPdf,
            attempted_matches: topAttemptedMatches(extractedAddress, records, 3)
          },
          { status: 404 }
        );
      }

      parsed.push({ fileName, invoice: inv, matchedPropertyId });
      invoiceExtractLog("info", "invoice_parsed_ok", {
        fileName,
        invoice_number: inv.invoice_number,
        matchedPropertyId
      });
    }

    const invoicesParsed = parsed.length;

    const dedupeKey = (n: string) => n.trim().toUpperCase();
    const byNumber = new Map<string, ParsedInvoiceRow>();
    for (const row of parsed) {
      const k = dedupeKey(row.invoice.invoice_number);
      if (!byNumber.has(k)) {
        byNumber.set(k, row);
      }
    }
    const unique = [...byNumber.values()];
    const duplicatesRemoved = invoicesParsed - unique.length;

    const excelRows = unique.map((p) => toExcelRow(p.invoice, p.matchedPropertyId));

    const templatePath = getTaskforceWeeklyTemplatePath();
    console.log("[invoice-extract] loading template", { templatePath, dataRows: excelRows.length });
    invoiceExtractLog("info", "excel_template_load", { templatePath, dataRows: excelRows.length });

    const xlsx = await buildTaskforceWeeklyExcelBuffer(excelRows);
    if (!xlsx.ok) {
      invoiceExtractLog("error", "excel_generation_failed", { errorReason: xlsx.error });
      return jsonError(422, xlsx.error);
    }

    const invoices: InvoiceExtractInvoiceRow[] = unique.map((p) => ({
      invoice_number: p.invoice.invoice_number,
      amount: p.invoice.amount,
      address: p.invoice.address.trim(),
      matched_property_id: p.matchedPropertyId,
      description: p.invoice.description_combined,
      source_file: p.fileName
    }));

    const filename = `taskforce-weekly-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const data: InvoiceExtractSuccessBody["data"] = {
      files_received: filesReceived,
      invoices_parsed: invoicesParsed,
      duplicates_removed: duplicatesRemoved,
      invoice_count: invoices.length,
      invoices
    };

    /**
     * Header must stay small — proxies often cap ~8KB; full `invoices` JSON can exceed that.
     * Client gets counts only in meta; line items live in the downloaded .xlsx.
     */
    const metaForClient = {
      success: true as const,
      data: {
        files_received: data.files_received,
        invoices_parsed: data.invoices_parsed,
        duplicates_removed: data.duplicates_removed,
        invoice_count: data.invoice_count,
        invoices: [] as InvoiceExtractInvoiceRow[]
      },
      excel: { filename }
    };
    const metaB64 = Buffer.from(JSON.stringify(metaForClient), "utf8").toString("base64");

    console.log("[invoice-extract] success", {
      filename,
      rows: excelRows.length,
      duplicatesRemoved,
      metaHeaderChars: metaB64.length
    });

    return new NextResponse(new Uint8Array(xlsx.buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        [INVOICE_EXTRACT_META_HEADER]: metaB64,
        "Cache-Control": "no-store"
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    invoiceExtractLog("error", "handler_unexpected_error", {
      ...snapshot,
      ...requestInfo,
      errorReason: message,
      stackPreview: stack?.slice(0, 500)
    });
    console.error("[invoice-extract] unexpected error:", message, stack ?? error);
    return handlerErrorResponse(message);
  }
}

function contentLengthExceeds(request: Request, maxBytes: number): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;
  const n = Number(contentLength);
  if (!Number.isFinite(n)) return false;
  return n > maxBytes + 65536;
}
