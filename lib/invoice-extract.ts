import OpenAI from "openai";
import ExcelJS from "exceljs";

export type InvoiceExtractFields = {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: string;
  description: string;
  address: string;
};

export type InvoicePropertyRow = { address: string; property_id: string };

const NOT_FOUND = "NOT FOUND";

function readFieldAddress(fields: Record<string, unknown>): string {
  const v =
    fields.address ??
    fields.Address ??
    fields.location ??
    fields.Location ??
    fields.suburb ??
    "";
  return String(v ?? "").trim();
}

function readFieldPropertyId(fields: Record<string, unknown>): string {
  const v = fields.property_id ?? fields.Property_ID ?? fields.propertyId ?? "";
  return String(v ?? "").trim();
}

function rowUsableForMatch(r: InvoicePropertyRow): boolean {
  return Boolean(String(r.property_id).trim());
}

/** Airtable table default `properties`; override with AIRTABLE_INVOICE_TABLE_NAME. */
export async function fetchInvoicePropertyRows(): Promise<InvoicePropertyRow[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_INVOICE_TABLE_NAME?.trim() || "properties";
  if (!apiKey || !baseId) {
    throw new Error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID");
  }

  const rows: InvoicePropertyRow[] = [];
  let offset = "";
  const base = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;

  for (;;) {
    const q = new URLSearchParams();
    q.set("pageSize", "100");
    if (offset) q.set("offset", offset);
    const res = await fetch(`${base}?${q}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store"
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Airtable ${res.status}: ${t.slice(0, 400)}`);
    }
    const data = (await res.json()) as { records?: Array<{ fields: Record<string, unknown> }>; offset?: string };
    for (const rec of data.records ?? []) {
      const address = readFieldAddress(rec.fields);
      const property_id = readFieldPropertyId(rec.fields);
      if (!rowUsableForMatch({ address, property_id })) continue;
      rows.push({
        address: address || "",
        property_id: String(property_id)
      });
    }
    if (!data.offset) break;
    offset = data.offset;
  }

  return rows;
}

function parseJsonObject<T>(raw: string): T | null {
  const m = raw.trim().match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as T;
  } catch {
    return null;
  }
}

const INVOICE_JSON_INSTRUCTION = `Return ONLY one JSON object with keys:
invoice_number, invoice_date, due_date, total_amount, description, address
Use strings for all values. If unknown use "".
total_amount should be numeric as string (no currency symbol) when possible.`;

export async function extractInvoiceFromPdfText(
  openai: OpenAI,
  pdfText: string
): Promise<InvoiceExtractFields> {
  const empty: InvoiceExtractFields = {
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    total_amount: "",
    description: "",
    address: ""
  };
  const clipped = pdfText.length > 28000 ? pdfText.slice(0, 28000) + "\n[truncated]" : pdfText;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `You extract structured invoice data from raw PDF text (may be noisy).\n${INVOICE_JSON_INSTRUCTION}\n\nPDF TEXT:\n${clipped}`
      }
    ],
    response_format: { type: "json_object" }
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const o = parseJsonObject<Partial<InvoiceExtractFields>>(raw) ?? {};
  return {
    invoice_number: String(o.invoice_number ?? ""),
    invoice_date: String(o.invoice_date ?? ""),
    due_date: String(o.due_date ?? ""),
    total_amount: String(o.total_amount ?? ""),
    description: String(o.description ?? ""),
    address: String(o.address ?? "")
  };
}

export async function matchAddressWithOpenAI(
  openai: OpenAI,
  inputAddress: string,
  propertyRows: InvoicePropertyRow[]
): Promise<{ matched_address: string; property_id: string }> {
  const listText = propertyRows
    .filter((r) => r.address || r.property_id)
    .map(
      (r, i) =>
        `${i + 1}. address: ${JSON.stringify(r.address)} | property_id: ${JSON.stringify(String(r.property_id))}`
    )
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Find the closest match for this address:
${inputAddress}

From this list:
${listText || "(empty list)"}

Return ONLY a JSON object with keys: matched_address (string), property_id (string).
The property_id MUST be copied exactly from the list item you choose, or the exact string "${NOT_FOUND}" if there is no reasonable match.`
      }
    ],
    response_format: { type: "json_object" }
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  const o = parseJsonObject<{ matched_address?: string; property_id?: string }>(raw) ?? {};
  let property_id = String(o.property_id ?? "").trim();
  const matched_address = String(o.matched_address ?? "").trim();

  const allowed = new Set(
    propertyRows.map((r) => String(r.property_id)).filter((id) => id.length > 0)
  );
  if (!property_id || property_id.toUpperCase() === "NOT FOUND") {
    return { matched_address: matched_address || NOT_FOUND, property_id: NOT_FOUND };
  }
  if (!allowed.has(property_id)) {
    return { matched_address: NOT_FOUND, property_id: NOT_FOUND };
  }
  return { matched_address, property_id };
}

export function buildFinancialFromPropertyId(propertyIdStr: string): {
  account_number: string;
  account_rta: string;
} {
  const id = String(propertyIdStr);
  const padded = id.padStart(6, "0");
  const account_number = `${padded}-110-60721`;
  const account_rta = `PR#${account_number}`;
  return { account_number, account_rta };
}

export type InvoiceExcelRow = {
  ledger: string;
  accountNumber: string;
  gstCode: string;
  amountIncGst: string | number;
  service: string;
  address: string;
  invoiceNumber: string;
  hcaReference: string;
  accountRtaList: string;
};

export async function buildInvoiceExcelBuffer(rows: InvoiceExcelRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Invoices");
  ws.columns = [
    { header: "Ledger", key: "ledger", width: 8 },
    { header: "Account Number", key: "accountNumber", width: 22 },
    { header: "GST Code", key: "gstCode", width: 10 },
    { header: "Amount (Inc GST)", key: "amountIncGst", width: 18 },
    { header: "Service", key: "service", width: 40 },
    { header: "Address", key: "address", width: 45 },
    { header: "Invoice Number", key: "invoiceNumber", width: 18 },
    { header: "HCA Reference", key: "hcaReference", width: 16 },
    { header: "Account number from RTA property list", key: "accountRtaList", width: 36 }
  ];
  for (const r of rows) {
    ws.addRow({
      ledger: r.ledger,
      accountNumber: r.accountNumber,
      gstCode: r.gstCode,
      amountIncGst: r.amountIncGst,
      service: r.service,
      address: r.address,
      invoiceNumber: r.invoiceNumber,
      hcaReference: r.hcaReference,
      accountRtaList: r.accountRtaList
    });
  }
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
