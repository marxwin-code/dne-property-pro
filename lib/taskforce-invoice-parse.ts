/**
 * Taskforce invoice PDF text → strict deterministic fields (no heuristics beyond fixed anchors).
 */

export type TaskforceParsedInvoice = {
  /** From "Reference" line; leading `\d+ -` prefix removed. */
  address: string;
  /** e.g. TF-00143127 */
  invoice_number: string;
  /** Decimal string from "TOTAL AUD" line (no currency symbol). */
  amount: string;
  /** Description rows joined with "; " */
  description_combined: string;
};

function clip(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

function normalizeLines(pdfText: string): string[] {
  return clip(pdfText, pdfText.length)
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00a0/g, " ").trim())
    .filter((l) => l.length > 0);
}

/** Strip optional Taskforce reference id prefix: "208168 - " */
function stripReferenceIdPrefix(value: string): string {
  return value.replace(/^\s*\d+\s*-\s*/, "").trim();
}

const ADDRESS_LABELS = [/^Service\s+Address\b/i, /^Property\b/i, /^Job\s+Address\b/i, /^Address\b/i];
const ADDRESS_STOP_LINES = [
  /^Invoice\b/i,
  /^Date\b/i,
  /^Description\b/i,
  /^Amount\b/i,
  /^TOTAL\s+AUD\b/i,
  /^SUBTOTAL\b/i,
  /^GST\b/i,
  /^Balance\b/i,
  /^ABN\b/i,
  /^Phone\b/i,
  /^Email\b/i
];

function isAddressStopLine(line: string): boolean {
  return ADDRESS_STOP_LINES.some((re) => re.test(line));
}

/**
 * Taskforce address extraction from labeled fields only.
 * - Look for Service Address / Property / Job Address / Address
 * - Capture value on same line and subsequent lines until section boundary
 * - Return raw joined text (no strict postcode/street validation)
 */
function extractAddressFromTaskforceLabels(lines: string[]): string {
  const candidates: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const label of ADDRESS_LABELS) {
      if (!label.test(line)) continue;

      const parts: string[] = [];
      const sameLine = line.replace(label, "").replace(/^\s*[:\-]?\s*/, "").trim();
      if (sameLine) {
        parts.push(stripReferenceIdPrefix(sameLine));
      }

      for (let j = i + 1; j < lines.length; j++) {
        const next = (lines[j] ?? "").trim();
        if (!next) break;
        if (isAddressStopLine(next)) break;
        if (ADDRESS_LABELS.some((re) => re.test(next))) break;
        parts.push(stripReferenceIdPrefix(next));
      }

      const combined = parts.join(" ").replace(/\s+/g, " ").trim();
      if (combined) candidates.push(combined);
      break;
    }
  }

  if (candidates.length === 0) return "";
  candidates.sort((a, b) => b.length - a.length);
  return candidates[0] ?? "";
}

function extractFallbackAddressFromFirstNumberLine(lines: string[]): string {
  for (const line of lines) {
    const raw = line.trim();
    if (!raw) continue;
    if (/\d/.test(raw)) {
      return stripReferenceIdPrefix(raw);
    }
  }
  return "";
}

/** Invoice number: TF-######## */
function extractInvoiceNumber(flat: string): string {
  const m = flat.replace(/\s+/g, " ").match(/\b(TF-\d+)\b/i);
  return m?.[1] ? m[1].toUpperCase() : "";
}

function normalizeAmountDigits(s: string): string {
  const cleaned = s.replace(/,/g, "").replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned || "";
  const intPart = parts[0] ?? "";
  const dec = parts.slice(1).join("");
  return dec ? `${intPart}.${dec}` : intPart;
}

/** Amount from line containing TOTAL AUD */
function extractTotalAud(lines: string[]): string {
  for (const line of lines) {
    if (!/TOTAL\s+AUD/i.test(line)) continue;
    const m =
      line.match(/\$?\s*([\d,]+\.\d{2})\b/) ||
      line.match(/\$?\s*([\d,]+\.\d{1,2})\b/) ||
      line.match(/\$?\s*([\d,]+)\b/);
    if (!m?.[1]) continue;
    const n = normalizeAmountDigits(m[1]);
    if (n && Number.isFinite(Number(n))) return n;
  }
  return "";
}

const AMOUNT_ONLY_LINE = /^\$?\s*[\d,]+\.\d{2}\s*$/;

/**
 * Rows after a line starting with "Description" until TOTAL AUD / SUBTOTAL / GST (exclusive).
 */
function extractDescriptionCombined(lines: string[]): string {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^Description\b/i.test(lines[i] ?? "")) {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return "";

  const parts: string[] = [];
  for (let j = start; j < lines.length; j++) {
    const L = (lines[j] ?? "").trim();
    if (!L) continue;
    if (/^TOTAL\s+AUD\b/i.test(L)) break;
    if (/^SUBTOTAL\b/i.test(L)) break;
    if (/^GST\b/i.test(L)) break;
    if (/^Balance\b/i.test(L)) break;
    if (AMOUNT_ONLY_LINE.test(L)) continue;
    if (/^Amount\b/i.test(L) && /\$/.test(L)) continue;
    parts.push(L);
  }
  return parts.join("; ");
}

export function parseTaskforceInvoiceFromPdfText(
  pdfText: string,
  maxChars: number
): { ok: true; data: TaskforceParsedInvoice } | { ok: false; error: string } {
  const text = clip(pdfText, maxChars);
  const lines = normalizeLines(text);
  const flat = text.replace(/\s+/g, " ");

  const address = (extractAddressFromTaskforceLabels(lines) || extractFallbackAddressFromFirstNumberLine(lines)).trim();
  const invoice_number = extractInvoiceNumber(flat);
  const amountRaw = extractTotalAud(lines);
  const description_combined = extractDescriptionCombined(lines);

  if (!invoice_number) {
    return { ok: false, error: 'Missing invoice number in format "TF-########".' };
  }
  if (!amountRaw) {
    return { ok: false, error: 'Missing amount on line containing "TOTAL AUD".' };
  }

  return {
    ok: true,
    data: {
      address,
      invoice_number,
      amount: amountRaw,
      description_combined
    }
  };
}
