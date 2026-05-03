import { getAirtableEnv } from "./airtable";
import { withRetry } from "./retry";

/** Writes one row to the Leads table (`AIRTABLE_TABLE_NAME`, default `Leads`). */
export async function insertLeadRecord(fields: Record<string, string | number>): Promise<void> {
  const { apiKey, baseId } = getAirtableEnv();
  if (!apiKey || !baseId) {
    console.warn("[insert-lead] Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID — skip.");
    return;
  }

  const tableName = process.env.AIRTABLE_TABLE_NAME || "Leads";
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;

  await withRetry(
    async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ records: [{ fields }] })
      });
      const json = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        const err = new Error(json.error?.message || `Airtable ${response.status}`);
        (err as Error & { status?: number }).status = response.status;
        throw err;
      }
      return json;
    },
    { attempts: 3, baseDelayMs: 500, label: "insert-lead-airtable" }
  );
}
