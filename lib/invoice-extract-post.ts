import { PDFParse } from "pdf-parse";
import { NextResponse } from "next/server";
import {
  invoiceExtractEnvSnapshot,
  jsonError,
  jsonInvoiceExtractSuccess,
  type InvoiceExtractSuccessBody
} from "@/lib/api-json";
import {
  INVOICE_EXTRACT_AIRTABLE_TABLE,
  INVOICE_NOT_FOUND_TOKEN,
  INVOICE_NO_MATCH_MESSAGE
} from "@/lib/invoice-extract-constants";
import { loadInvoiceExtractRuntimeConfig } from "@/lib/invoice-extract-config";
import { invoiceExtractLog } from "@/lib/invoice-extract-log";
import { fetchInvoicePropertyRows } from "@/lib/invoice-extract";
import { matchTaskforceAddressToProperty } from "@/lib/taskforce-address-match";
import { parseTaskforceInvoiceFromPdfText } from "@/lib/taskforce-invoice-parse";
import {
  buildTaskforceWeeklyExcelBuffer,
  getTaskforceWeeklyTemplatePath
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
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const textResult = await parser.getText();
    return { ok: true, text: textResult.text ?? "" };
  } catch (e) {
    invoiceExtractLog("error", "pdf_parse_failure", { errorReason: String(e) });
    return { ok: false, error: "PDF parse failed." };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

function handlerErrorResponse(message: string): NextResponse<{ success: false; error: string }> {
  return NextResponse.json({ success: false, error: message }, { status: 422 });
}

/**
 * POST /api/invoice-extract — deterministic Taskforce pipeline (no AI). JSON-only responses.
 */
export async function handleInvoiceExtractPost(request: Request): Promise<Response> {
  const snapshot = invoiceExtractEnvSnapshot();
  const requestInfo = { method: request.method, url: request.url };

  try {
    console.log("[invoice-extract] request received", requestInfo);
    invoiceExtractLog("info", "request_received", { ...requestInfo, ...snapshot });

    const cfg = loadInvoiceExtractRuntimeConfig();
    const { limits } = cfg;

    if (contentLengthExceeds(request, limits.maxUploadBytes)) {
      invoiceExtractLog("error", "payload_too_large", { ...snapshot, ...requestInfo });
      return jsonError(413, "Request body exceeds maximum allowed size.");
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      invoiceExtractLog("error", "multipart_parse_failed", { ...snapshot, ...requestInfo });
      return jsonError(400, "Invalid form data.");
    }

    const files = formData.getAll("files").filter((v): v is File => v instanceof File);
    if (files.length !== 1) {
      invoiceExtractLog("error", "invalid_file_count", { count: files.length, ...requestInfo });
      return jsonError(400, "Upload exactly one PDF file.");
    }

    const file = files[0];
    const fileName = file.name || "upload.pdf";

    if (file.size > limits.maxUploadBytes) {
      invoiceExtractLog("error", "file_too_large", {
        fileName,
        size: file.size,
        maxUploadBytes: limits.maxUploadBytes
      });
      return jsonError(
        413,
        `PDF exceeds maximum size of ${Math.round(limits.maxUploadBytes / (1024 * 1024))} MB.`
      );
    }

    const mime = (file.type || "").toLowerCase();
    const nameOk = fileName.toLowerCase().endsWith(".pdf");
    if (mime !== "application/pdf" && !nameOk) {
      invoiceExtractLog("error", "invalid_mime", { fileName, mime, ...requestInfo });
      return jsonError(400, "Only PDF files are accepted.");
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (!isPdfMagic(buf)) {
      invoiceExtractLog("error", "pdf_magic_invalid", { fileName, ...requestInfo });
      return jsonError(400, "File is not a valid PDF.");
    }

    console.log("[invoice-extract] reading PDF", { fileName, bytes: buf.length });
    invoiceExtractLog("info", "pdf_read_start", { fileName, bytes: buf.length });

    const pdf = await pdfBufferToText(buf);
    if (!pdf.ok) {
      invoiceExtractLog("error", "pdf_text_pipeline_failed", { fileName, errorReason: pdf.error });
      return jsonError(422, pdf.error);
    }

    console.log("[invoice-extract] PDF text length", pdf.text.length);
    invoiceExtractLog("info", "pdf_text_extracted", { fileName, textLength: pdf.text.length });

    console.log("[invoice-extract] parsing fields (Reference, TF-, TOTAL AUD, Description)");
    const extracted = parseTaskforceInvoiceFromPdfText(pdf.text, limits.maxPdfChars);
    if (!extracted.ok) {
      invoiceExtractLog("error", "taskforce_parse_failed", { fileName, errorReason: extracted.error });
      return jsonError(422, extracted.error);
    }

    const inv = extracted.data;
    const extractedAddress = inv.address.trim();
    console.log("[invoice-extract] parsed invoice_number", inv.invoice_number);
    console.log("[invoice-extract] parsed amount", inv.amount);
    console.log("[invoice-extract] extracted address (Reference)", extractedAddress);
    console.log("[invoice-extract] description_combined length", inv.description_combined.length);
    invoiceExtractLog("info", "taskforce_parse_ok", {
      fileName,
      invoice_number: inv.invoice_number,
      amount: inv.amount,
      addressLen: extractedAddress.length
    });

    console.log("[invoice-extract] calling Airtable", {
      table: INVOICE_EXTRACT_AIRTABLE_TABLE,
      fields: ["address", "property_id"]
    });
    invoiceExtractLog("info", "airtable_fetch_start", {
      table: INVOICE_EXTRACT_AIRTABLE_TABLE,
      fields: ["address", "property_id"]
    });

    const propertyLoad = await fetchInvoicePropertyRows({
      tableName: INVOICE_EXTRACT_AIRTABLE_TABLE
    });
    if (!propertyLoad.ok) {
      invoiceExtractLog("error", "airtable_load_failed", {
        fileName,
        ...snapshot,
        ...requestInfo,
        errorReason: propertyLoad.error,
        httpStatus: propertyLoad.status
      });
      return jsonError(mapAirtableStatus(propertyLoad.status), propertyLoad.error);
    }

    const records = propertyLoad.rows;
    console.log("[invoice-extract] Airtable loaded row count:", records.length);
    invoiceExtractLog("info", "airtable_fetch_done", { rowCount: records.length });

    console.log("[invoice-extract] matching address (exact normalized equality)");
    const match = matchTaskforceAddressToProperty(extractedAddress, records);
    if (!match.ok) {
      invoiceExtractLog("error", "taskforce_match_internal_error", { fileName, errorReason: match.error });
      return jsonError(422, match.error);
    }

    const matchedPropertyId = String(match.property_id);
    if (matchedPropertyId === INVOICE_NOT_FOUND_TOKEN) {
      invoiceExtractLog("error", "no_property_match", { fileName, extractedAddress });
      console.log("[invoice-extract] no Airtable row matched address");
      return NextResponse.json({ success: false, error: INVOICE_NO_MATCH_MESSAGE }, { status: 404 });
    }

    invoiceExtractLog("info", "address_match_ok", {
      fileName,
      matchedPropertyId,
      matchedAddress: match.matched_address
    });
    console.log("[invoice-extract] matched property_id", matchedPropertyId);

    const pid = matchedPropertyId;
    const accountNumber = `${pid}-110-60721`;
    const accountRtaList = `PR# ${pid}-110-60721`;
    const numAmt = parseFloat(inv.amount);
    const amountCell = Number.isFinite(numAmt) ? numAmt : inv.amount;

    const templatePath = getTaskforceWeeklyTemplatePath();
    console.log("[invoice-extract] loading template", { templatePath });
    invoiceExtractLog("info", "excel_template_load", { templatePath });

    console.log("[invoice-extract] writing Excel row 2 (columns A–J)");
    invoiceExtractLog("info", "excel_generate_start", { row: 2 });

    const xlsx = await buildTaskforceWeeklyExcelBuffer({
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
    });
    if (!xlsx.ok) {
      invoiceExtractLog("error", "excel_generation_failed", { fileName, errorReason: xlsx.error });
      return jsonError(422, xlsx.error);
    }

    const filename = `taskforce-weekly-${new Date().toISOString().slice(0, 10)}.xlsx`;
    const body: InvoiceExtractSuccessBody = {
      success: true,
      data: {
        invoice_number: inv.invoice_number,
        amount: inv.amount,
        address: extractedAddress,
        matched_property_id: matchedPropertyId,
        description: inv.description_combined
      },
      excel: {
        content_base64: xlsx.buffer.toString("base64"),
        filename
      }
    };

    console.log("[invoice-extract] success", { filename });
    return jsonInvoiceExtractSuccess(body);
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
