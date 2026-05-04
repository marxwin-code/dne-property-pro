import invoiceDefaults from "../config/invoice-extract.json";

type Defaults = typeof invoiceDefaults;

function numEnv(key: string, fallback: number): number {
  const n = parseInt(String(process.env[key] ?? ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function numEnvPositive(key: string, fallback: number): number {
  const n = parseInt(String(process.env[key] ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export type InvoiceFinancialConfig = {
  padLength: number;
  middleSuffix: string;
  rtaPrefix: string;
  ledger: string;
  gstCode: string;
};

export type InvoiceLimitsConfig = {
  maxUploadBytes: number;
  maxPdfChars: number;
};

export type InvoiceExtractRuntimeConfig = {
  /** `AIRTABLE_TABLE_NAME` or `AIRTABLE_TABLE_NAME_FALLBACK`; defaults to `properties` for Taskforce. */
  tableName: string;
  financial: InvoiceFinancialConfig;
  limits: InvoiceLimitsConfig;
};

/**
 * Taskforce invoice pipeline config: env overrides, `config/invoice-extract.json` for financial defaults.
 * Airtable property rows always use fields `address` and `property_id` only.
 */
export function loadInvoiceExtractRuntimeConfig(): InvoiceExtractRuntimeConfig {
  const d = invoiceDefaults as Defaults;
  const tableName =
    String(process.env.AIRTABLE_TABLE_NAME ?? "").trim() ||
    String(process.env.AIRTABLE_TABLE_NAME_FALLBACK ?? "").trim() ||
    "properties";

  const f = d.financial;
  const financial: InvoiceFinancialConfig = {
    padLength: numEnv("INVOICE_ACCOUNT_PAD_LENGTH", f.padLength),
    middleSuffix: String(process.env.INVOICE_ACCOUNT_MIDDLE_SUFFIX ?? f.middleSuffix),
    rtaPrefix: String(process.env.INVOICE_ACCOUNT_RTA_PREFIX ?? f.rtaPrefix),
    ledger: String(process.env.INVOICE_LEDGER_CODE ?? f.ledger),
    gstCode: String(process.env.INVOICE_GST_CODE ?? f.gstCode)
  };

  const lim = d.limits as {
    maxUploadBytes?: number;
    maxPdfChars?: number;
    maxPdfCharsForExtraction?: number;
  };
  const defaultPdfChars = lim.maxPdfChars ?? lim.maxPdfCharsForExtraction ?? 28000;

  const limits: InvoiceLimitsConfig = {
    maxUploadBytes: numEnvPositive("INVOICE_MAX_UPLOAD_BYTES", lim?.maxUploadBytes ?? 10 * 1024 * 1024),
    maxPdfChars: numEnvPositive("INVOICE_MAX_PDF_CHARS", defaultPdfChars)
  };

  return {
    tableName,
    financial,
    limits
  };
}
