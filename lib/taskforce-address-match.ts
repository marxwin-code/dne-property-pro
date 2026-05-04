import { INVOICE_NOT_FOUND_TOKEN } from "@/lib/invoice-extract-constants";
import type { InvoicePropertyRow } from "@/lib/invoice-extract";

function rowUsable(r: InvoicePropertyRow): boolean {
  return Boolean(String(r.property_id ?? "").trim());
}

/** Single normalization rule for comparison (lowercase, single spaces). */
function normAddr(s: string): string {
  return s
    .replace(/\u00a0/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export type TaskforceAddressMatchResult =
  | { ok: true; property_id: string; matched_address: string }
  | { ok: false; error: string };

/**
 * Exact match only: normalized extracted address must equal normalized Airtable `address`.
 */
export function matchTaskforceAddressToProperty(
  extractedAddress: string,
  propertyRows: InvoicePropertyRow[]
): TaskforceAddressMatchResult {
  const e = normAddr(extractedAddress);
  if (!e) {
    return { ok: false, error: "Extracted address was empty." };
  }

  for (const row of propertyRows) {
    if (!rowUsable(row)) continue;
    const raw = String(row.address ?? "").trim();
    if (!raw) continue;
    if (normAddr(raw) === e) {
      return {
        ok: true,
        property_id: String(row.property_id).trim(),
        matched_address: raw
      };
    }
  }

  return {
    ok: true,
    property_id: INVOICE_NOT_FOUND_TOKEN,
    matched_address: INVOICE_NOT_FOUND_TOKEN
  };
}
