/**
 * Deterministic extraction for Taskforce PDF invoices (fixed vendor layout).
 * Tuned on typical AU invoice text: labelled lines + totals + street/postcode blocks.
 */

export type TaskforceParsedInvoice = {
  invoice_number: string;
  /** Decimal string without currency symbol, e.g. "1234.56" */
  amount: string;
  address: string;
};

function clip(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars);
}

function normalizeAmountDigits(s: string): string {
  const cleaned = s.replace(/,/g, "").replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned || "";
  const intPart = parts[0] ?? "";
  const dec = parts.slice(1).join("");
  return dec ? `${intPart}.${dec}` : intPart;
}

/** Collapse whitespace for cross-line regex. */
function singleLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractInvoiceNumber(lines: string[], flat: string): string {
  for (const line of lines) {
    const m =
      line.match(
        /(?:tax\s*)?invoice\s*(?:no|number|#)?\s*[:\s]\s*([A-Za-z0-9][A-Za-z0-9\-_/]*)/i
      ) ||
      line.match(/(?:inv\.?|invoice)\s*[:\s#]\s*([A-Za-z0-9][A-Za-z0-9\-_/]*)/i) ||
      line.match(/\b(?:ref|reference)\s*[:\s]\s*([A-Za-z0-9][A-Za-z0-9\-_/]+)/i);
    if (m?.[1]) return m[1].trim();
  }
  const flatM =
    flat.match(
      /\b(?:tax\s*)?invoice\s*(?:no|number|#)?\s*[:\s]\s*([A-Za-z0-9][A-Za-z0-9\-_/]*)/i
    ) || flat.match(/\b(?:INV|TF)[- ]?([A-Z0-9]{4,})\b/i);
  return flatM?.[1]?.trim() ?? "";
}

function moneyOnLine(line: string): string | null {
  const matches = [...line.matchAll(/\$?\s*([\d,]+\.\d{2})\b/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1];
  const raw = last?.[1];
  if (!raw) return null;
  const n = normalizeAmountDigits(raw);
  return n || null;
}

function extractAmount(lines: string[]): string {
  const totalKeywords =
    /(^|\b)(total|amount\s*due|balance\s*due|balance|gst\s*inclusive|inc\.?\s*gst\s*total|total\s*payable)\b/i;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i] ?? "";
    if (!totalKeywords.test(line)) continue;
    const fromLine = moneyOnLine(line);
    if (fromLine) return fromLine;
  }

  for (const line of lines) {
    if (!totalKeywords.test(line)) continue;
    const fromLine = moneyOnLine(line);
    if (fromLine) return fromLine;
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    const fromLine = moneyOnLine(lines[i] ?? "");
    if (fromLine) return fromLine;
  }

  return "";
}

function isSectionBreak(line: string): boolean {
  return /^(invoice|total|abn|acn|phone|email|www\.|bank|payment|due\s*date|tax)/i.test(line);
}

function extractAddressBlock(lines: string[]): string {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const label = /^(property|site|service|job)?\s*address\s*[:\s]?\s*(.*)$/i.exec(line);
    if (label) {
      const rest = (label[2] ?? "").trim();
      const parts: string[] = [];
      if (rest) parts.push(rest);
      for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
        const next = lines[j] ?? "";
        if (!next.trim()) break;
        if (isSectionBreak(next) && parts.length > 0) break;
        if (/^(invoice|inv\.?|total|subtotal|abn)/i.test(next) && parts.length > 0) break;
        parts.push(next.trim());
      }
      const joined = parts.join(", ").trim();
      if (joined.length >= 8) return joined;
    }
  }

  const statePost = /\b(NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+\d{4}\b/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!statePost.test(line)) continue;
    const block: string[] = [];
    for (let k = Math.max(0, i - 3); k <= i; k++) {
      const L = lines[k] ?? "";
      if (L.length > 3 && !/^(invoice|tax|total|abn|phone)/i.test(L)) block.push(L.trim());
    }
    if (block.length) return block.join(", ");
    return line.trim();
  }

  const streetish =
    /\d+\s+.+\b(?:st|street|rd|road|ave|avenue|dr|drive|ct|court|pl|place|way|cres|parade|hwy|highway|blvd|unit|lvl|level)\b/i;
  for (const line of lines) {
    if (streetish.test(line) && line.length >= 12 && line.length < 200) {
      return line.trim();
    }
  }

  return "";
}

/**
 * Parse Taskforce invoice text. Fails with a stable error message if required fields are missing.
 */
export function parseTaskforceInvoiceFromPdfText(
  pdfText: string,
  maxChars: number
): { ok: true; data: TaskforceParsedInvoice } | { ok: false; error: string } {
  const text = clip(pdfText, maxChars);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00a0/g, " ").trim())
    .filter((l) => l.length > 0);
  const flat = singleLine(text);

  const invoice_number = extractInvoiceNumber(lines, flat);
  const amountRaw = extractAmount(lines);
  const address = extractAddressBlock(lines).trim();

  if (!invoice_number) {
    return { ok: false, error: "Could not find an invoice number in the PDF text." };
  }
  if (!amountRaw || !Number.isFinite(Number(amountRaw))) {
    return { ok: false, error: "Could not find a valid total amount in the PDF text." };
  }
  if (!address || address.length < 8) {
    return { ok: false, error: "Could not extract a usable property address from the PDF text." };
  }

  return {
    ok: true,
    data: {
      invoice_number,
      amount: amountRaw,
      address
    }
  };
}
