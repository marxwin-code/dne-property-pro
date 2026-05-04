import { INVOICE_NOT_FOUND_TOKEN } from "@/lib/invoice-extract-constants";
import type { InvoicePropertyRow } from "@/lib/invoice-extract";

function rowUsable(r: InvoicePropertyRow): boolean {
  return Boolean(String(r.property_id ?? "").trim());
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[,#.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripUnitPrefix(s: string): string {
  return s.replace(/^(unit|apt|apartment|suite|lvl|level)\s+\w+\s+/i, "").replace(/^\d+\/\d+\s+/, "");
}

function tokens(s: string): Set<string> {
  const out = new Set<string>();
  for (const w of normalize(s).split(" ")) {
    if (w.length >= 2) out.add(w);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) {
    if (b.has(x)) inter++;
  }
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Score 0–1 for invoice address vs Airtable address (deterministic).
 */
export function scoreAddressMatch(extracted: string, candidate: string): number {
  const e0 = normalize(extracted);
  const c0 = normalize(candidate);
  if (!e0 || !c0) return 0;

  const e = stripUnitPrefix(e0);
  const c = stripUnitPrefix(c0);

  if (e === c) return 1;
  if (e.includes(c) || c.includes(e)) {
    const ratio = Math.min(e.length, c.length) / Math.max(e.length, c.length);
    return 0.85 + 0.14 * ratio;
  }

  const te = tokens(e);
  const tc = tokens(c);
  const jac = jaccard(te, tc);
  if (jac >= 0.55) return jac;

  const e2 = stripUnitPrefix(e0.replace(/^(the\s+)/, ""));
  const c2 = stripUnitPrefix(c0.replace(/^(the\s+)/, ""));
  if (e2 === c2) return 1;
  if (e2.includes(c2) || c2.includes(e2)) {
    const ratio = Math.min(e2.length, c2.length) / Math.max(e2.length, c2.length);
    return 0.82 + 0.14 * ratio;
  }
  return jaccard(tokens(e2), tokens(c2));
}

const MATCH_MIN_SCORE = 0.72;

export type TaskforceAddressMatchResult =
  | { ok: true; property_id: string; matched_address: string }
  | { ok: false; error: string };

/**
 * Pick the single best Airtable row by deterministic scoring (no AI).
 */
export function matchTaskforceAddressToProperty(
  extractedAddress: string,
  propertyRows: InvoicePropertyRow[]
): TaskforceAddressMatchResult {
  const trimmed = extractedAddress.trim();
  if (!trimmed) {
    return { ok: false, error: "Extracted address was empty." };
  }

  let best: { score: number; row: InvoicePropertyRow } | null = null;
  for (const row of propertyRows) {
    if (!rowUsable(row)) continue;
    const addr = String(row.address ?? "").trim();
    if (!addr) continue;
    const score = scoreAddressMatch(trimmed, addr);
    if (!best || score > best.score) best = { score, row };
  }

  if (!best || best.score < MATCH_MIN_SCORE) {
    return {
      ok: true,
      property_id: INVOICE_NOT_FOUND_TOKEN,
      matched_address: INVOICE_NOT_FOUND_TOKEN
    };
  }

  return {
    ok: true,
    property_id: String(best.row.property_id).trim(),
    matched_address: String(best.row.address ?? "").trim() || trimmed
  };
}
