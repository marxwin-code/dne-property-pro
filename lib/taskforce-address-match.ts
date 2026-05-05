import { INVOICE_NOT_FOUND_TOKEN } from "@/lib/invoice-extract-constants";
import type { InvoicePropertyRow } from "@/lib/invoice-extract";

function rowUsable(r: InvoicePropertyRow): boolean {
  return Boolean(String(r.property_id ?? "").trim());
}

/**
 * Normalize to Street + Suburb style:
 * - lowercase
 * - drop `VIC 3000` / `VIC`
 * - commas -> spaces
 * - collapse spaces
 */
export function normalizeAddress(s: string): string {
  return s
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/vic\s*\d{4}\b/g, "")
    .replace(/\bvic\b/g, "")
    .replace(/,\s*/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export type TaskforceAddressMatchResult =
  | { ok: true; property_id: string; matched_address: string }
  | { ok: false; error: string };

export function matchTaskforceAddressToProperty(
  extractedAddress: string,
  propertyRows: InvoicePropertyRow[]
): TaskforceAddressMatchResult {
  const pdfAddr = normalizeAddress(extractedAddress);
  if (!pdfAddr) {
    return { ok: false, error: "Extracted address was empty." };
  }

  for (const row of propertyRows) {
    if (!rowUsable(row)) continue;
    const raw = String(row.address ?? "").trim();
    if (!raw) continue;
    const dbAddr = normalizeAddress(raw);
    if (!dbAddr) continue;

    // PRD rule: PDF full address should include DB Street + Suburb fragment.
    if (pdfAddr.includes(dbAddr)) {
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
