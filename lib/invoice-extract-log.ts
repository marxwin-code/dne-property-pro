/**
 * Namespaced logging for the invoice-extract pipeline (Claude / module rules: structured, no secrets).
 */
export type InvoiceExtractLogLevel = "info" | "error";

export function invoiceExtractLog(
  level: InvoiceExtractLogLevel,
  event: string,
  payload?: Record<string, unknown>
): void {
  const line = { scope: "invoice-extract", event, ...payload };
  if (level === "error") {
    console.error("[invoice-extract]", line);
  } else {
    console.log("[invoice-extract]", line);
  }
}
