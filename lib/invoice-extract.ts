import { airtableRecordsUrl, getAirtableCredentialsOrNull } from "@/lib/airtable-table";
import type { InvoiceFinancialConfig } from "@/lib/invoice-extract-config";
import { invoiceExtractLog } from "@/lib/invoice-extract-log";

export type InvoicePropertyRow = { address: string; property_id: string };

export function readFirstMappedField(fields: Record<string, unknown>, candidates: string[]): string {
  for (const key of candidates) {
    if (!(key in fields)) continue;
    const v = fields[key];
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
}

export type FetchInvoicePropertiesResult =
  | { ok: true; rows: InvoicePropertyRow[] }
  | { ok: false; error: string; status: number };

/**
 * Loads rows from Airtable using env-driven table name and field candidate lists.
 */
export async function fetchInvoicePropertyRows(params: {
  tableName: string;
  addressFields: string[];
  propertyIdFields: string[];
}): Promise<FetchInvoicePropertiesResult> {
  const creds = getAirtableCredentialsOrNull();
  if (!creds) {
    invoiceExtractLog("error", "airtable_credentials_missing", {});
    return {
      ok: false,
      error:
        "Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID, and AIRTABLE_TABLE_NAME for the records table.",
      status: 503
    };
  }

  const { tableName, addressFields, propertyIdFields } = params;
  if (!tableName.trim()) {
    invoiceExtractLog("error", "airtable_table_name_empty", {});
    return {
      ok: false,
      error: "Set AIRTABLE_TABLE_NAME to the Airtable table that holds property rows.",
      status: 400
    };
  }
  if (addressFields.length === 0 || propertyIdFields.length === 0) {
    invoiceExtractLog("error", "airtable_field_mapping_empty", {
      addressFields: addressFields.length,
      propertyIdFields: propertyIdFields.length
    });
    return {
      ok: false,
      error:
        "Configure Airtable field mapping: set AIRTABLE_FIELD_ADDRESS and AIRTABLE_FIELD_PROPERTY_ID (comma-separated column names), or rely on config/invoice-extract.json candidates.",
      status: 400
    };
  }

  const rows: InvoicePropertyRow[] = [];
  let offset = "";
  const baseUrl = airtableRecordsUrl(creds.baseId, tableName);

  try {
    for (;;) {
      const q = new URLSearchParams();
      q.set("pageSize", "100");
      if (offset) q.set("offset", offset);
      const res = await fetch(`${baseUrl}?${q}`, {
        headers: { Authorization: `Bearer ${creds.apiKey}` },
        cache: "no-store"
      });
      if (!res.ok) {
        const t = await res.text();
        invoiceExtractLog("error", "airtable_fetch_http_error", {
          status: res.status,
          tableName,
          bodyPreview: t.slice(0, 240)
        });
        return {
          ok: false,
          error: "Could not load properties from Airtable.",
          status: res.status >= 500 ? 502 : res.status
        };
      }
      const data = (await res.json()) as {
        records?: Array<{ fields?: Record<string, unknown> }>;
        offset?: string;
      };
      for (const rec of data.records ?? []) {
        const fields = rec.fields ?? {};
        const address = readFirstMappedField(fields, addressFields);
        const property_id = readFirstMappedField(fields, propertyIdFields);
        rows.push({ address, property_id });
      }
      if (!data.offset) break;
      offset = data.offset;
    }
  } catch (e) {
    invoiceExtractLog("error", "airtable_network_error", { errorReason: String(e) });
    return {
      ok: false,
      error: "Failed to reach Airtable. Try again later.",
      status: 502
    };
  }

  return { ok: true, rows };
}

export function buildFinancialFromPropertyId(
  propertyIdStr: string,
  financial: InvoiceFinancialConfig
): { account_number: string; account_rta: string } {
  const id = String(propertyIdStr);
  const padded = id.padStart(financial.padLength, "0");
  const account_number = `${padded}${financial.middleSuffix}`;
  const account_rta = `${financial.rtaPrefix}${account_number}`;
  return { account_number, account_rta };
}
