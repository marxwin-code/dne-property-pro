import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import {
  buildFinancialFromPropertyId,
  buildInvoiceExcelBuffer,
  extractInvoiceFromPdfText,
  fetchInvoicePropertyRows,
  matchAddressWithOpenAI,
  type InvoiceExcelRow
} from "@/lib/invoice-extract";

export const runtime = "nodejs";
export const maxDuration = 120;

const NOT_FOUND = "NOT FOUND";

async function pdfBufferToText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const textResult = await parser.getText();
    return textResult.text ?? "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

export async function POST(request: Request) {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const files = formData.getAll("files").filter((v): v is File => v instanceof File);
  const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
  if (pdfs.length === 0) {
    return NextResponse.json({ error: "Upload at least one PDF file." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: openAiKey });
  let propertyRows: Awaited<ReturnType<typeof fetchInvoicePropertyRows>>;
  try {
    propertyRows = await fetchInvoicePropertyRows();
  } catch (e) {
    console.error("[invoice-extract] airtable", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load properties from Airtable" },
      { status: 500 }
    );
  }

  const excelRows: InvoiceExcelRow[] = [];

  for (const file of pdfs) {
    const buf = Buffer.from(await file.arrayBuffer());
    let pdfText = "";
    try {
      pdfText = await pdfBufferToText(buf);
    } catch (e) {
      console.error("[invoice-extract] pdf", file.name, e);
      excelRows.push({
        ledger: "PR",
        accountNumber: NOT_FOUND,
        gstCode: "C",
        amountIncGst: "",
        service: `PDF parse failed: ${file.name}`,
        address: "",
        invoiceNumber: "",
        hcaReference: NOT_FOUND,
        accountRtaList: NOT_FOUND
      });
      continue;
    }

    let extracted;
    try {
      extracted = await extractInvoiceFromPdfText(openai, pdfText);
    } catch (e) {
      console.error("[invoice-extract] openai extract", file.name, e);
      excelRows.push({
        ledger: "PR",
        accountNumber: NOT_FOUND,
        gstCode: "C",
        amountIncGst: "",
        service: `OpenAI extract failed: ${file.name}`,
        address: "",
        invoiceNumber: "",
        hcaReference: NOT_FOUND,
        accountRtaList: NOT_FOUND
      });
      continue;
    }

    const inputAddress = extracted.address.trim() || NOT_FOUND;
    let property_id = NOT_FOUND;
    let displayAddress = extracted.address;

    try {
      const match = await matchAddressWithOpenAI(openai, inputAddress, propertyRows);
      property_id = String(match.property_id);
      if (match.matched_address && match.matched_address !== NOT_FOUND) {
        displayAddress = match.matched_address;
      }
    } catch (e) {
      console.error("[invoice-extract] openai match", file.name, e);
      property_id = NOT_FOUND;
    }

    let accountNumber = NOT_FOUND;
    let accountRtaList = NOT_FOUND;
    if (property_id !== NOT_FOUND) {
      const fin = buildFinancialFromPropertyId(property_id);
      accountNumber = fin.account_number;
      accountRtaList = fin.account_rta;
    }

    const digits = extracted.total_amount.replace(/[^\d.-]/g, "");
    const numAmt = parseFloat(digits);
    const amountIncGst = Number.isFinite(numAmt) ? numAmt : extracted.total_amount;

    excelRows.push({
      ledger: "PR",
      accountNumber,
      gstCode: "C",
      amountIncGst,
      service: extracted.description || extracted.invoice_number || file.name,
      address: displayAddress || NOT_FOUND,
      invoiceNumber: extracted.invoice_number || "",
      hcaReference: property_id,
      accountRtaList
    });
  }

  const buffer = await buildInvoiceExcelBuffer(excelRows);
  const filename = `invoice-extract-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
