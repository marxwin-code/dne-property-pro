/**
 * Dynamic Airtable table resolution and REST URLs (no airtable.js dependency).
 * Table names must come from environment (or explicit `defaultTable` supplied by caller for secondary tables).
 */

export type AirtableCredentials = { apiKey: string; baseId: string };

/**
 * Resolves `process.env[envVar]` (default `AIRTABLE_TABLE_NAME`). Returns `null` if unset/blank — no hardcoded table.
 * For additional tables later, pass `envVar` and optional `defaultTable` from that table's own env read.
 */
export function resolveAirtableTableName(options?: {
  envVar?: string;
  defaultTable?: string;
}): string | null {
  const envVar = options?.envVar ?? "AIRTABLE_TABLE_NAME";
  const raw = String(process.env[envVar] ?? "").trim();
  if (raw) return raw;
  const fb = String(options?.defaultTable ?? "").trim();
  return fb || null;
}

export function airtableRecordsPath(baseId: string, tableName: string): string {
  return `/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(tableName)}`;
}

export function airtableRecordsUrl(baseId: string, tableName: string): string {
  return `https://api.airtable.com${airtableRecordsPath(baseId, tableName)}`;
}

export function getAirtableCredentialsOrNull(): AirtableCredentials | null {
  const apiKey = String(process.env.AIRTABLE_API_KEY ?? "").trim();
  const baseId = String(process.env.AIRTABLE_BASE_ID ?? "").trim();
  if (!apiKey || !baseId) {
    console.error("Missing Airtable config", {
      reason: "credentials",
      hasApiKey: Boolean(apiKey),
      hasBaseId: Boolean(baseId),
      AIRTABLE_TABLE_NAME: process.env.AIRTABLE_TABLE_NAME?.trim() ? "set" : "unset"
    });
    return null;
  }
  return { apiKey, baseId };
}
