import { NextResponse } from "next/server";

export type ApiErrorBody = { success: false; error: string };

export type InvoiceExtractInvoiceRow = {
  invoice_number: string;
  amount: string;
  address: string;
  matched_property_id: string;
  description: string;
  source_file: string;
};

export type InvoiceExtractSuccessBody = {
  success: true;
  data: {
    files_received: number;
    invoices_parsed: number;
    duplicates_removed: number;
    invoice_count: number;
    invoices: InvoiceExtractInvoiceRow[];
  };
  excel: { content_base64: string; filename: string };
};

export function jsonError(status: number, error: string, init?: ResponseInit): NextResponse<ApiErrorBody> {
  return NextResponse.json<ApiErrorBody>({ success: false, error }, { status, ...init });
}

export function jsonInvoiceExtractSuccess(
  body: InvoiceExtractSuccessBody,
  init?: ResponseInit
): NextResponse<InvoiceExtractSuccessBody> {
  return NextResponse.json(body, { status: 200, ...init });
}

/**
 * Masked env snapshot for invoice-extract diagnostics (no secret values).
 * Use on every error path in that module.
 */
export function invoiceExtractEnvSnapshot(): Record<string, string> {
  return {
    AIRTABLE_API_KEY: mask(process.env.AIRTABLE_API_KEY),
    AIRTABLE_BASE_ID: mask(process.env.AIRTABLE_BASE_ID),
    AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME?.trim() ? "set" : "unset",
    AIRTABLE_TABLE_NAME_FALLBACK: process.env.AIRTABLE_TABLE_NAME_FALLBACK?.trim() ? "set" : "unset",
    INVOICE_MAX_UPLOAD_BYTES: process.env.INVOICE_MAX_UPLOAD_BYTES?.trim() ? "set" : "unset",
    INVOICE_MAX_PDF_CHARS: process.env.INVOICE_MAX_PDF_CHARS?.trim() ? "set" : "unset",
    INVOICE_MAX_FILES: process.env.INVOICE_MAX_FILES?.trim() ? "set" : "unset",
    INVOICE_MAX_BATCH_BYTES: process.env.INVOICE_MAX_BATCH_BYTES?.trim() ? "set" : "unset"
  };
}

function mask(v: string | undefined): "unset" | "set" {
  const t = String(v ?? "").trim();
  if (!t) return "unset";
  return "set";
}
