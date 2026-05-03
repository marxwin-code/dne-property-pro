import { getAirtableEnv } from "./airtable";

/**
 * Base table: `risk_reports` (override with AIRTABLE_RISK_REPORTS_TABLE_NAME).
 * Field names (lowercase): email, income, savings, ownership, location, score, risk_level, summary, created_at
 * risk_level: low | medium | high
 * PAT needs data.records:read + data.records:write on this base.
 */
export type RiskReportCreateInput = {
  email: string;
  income: number;
  savings: number;
  /** "yes" | "no" */
  ownership: string;
  location: string;
  score: number;
  risk_level: "low" | "medium" | "high";
  summary: string;
};

function getRiskReportTableName(): string {
  return process.env.AIRTABLE_RISK_REPORTS_TABLE_NAME?.trim() || "risk_reports";
}

export async function createRiskReportRecord(input: RiskReportCreateInput): Promise<void> {
  const { apiKey, baseId } = getAirtableEnv();
  if (!apiKey || !baseId) {
    console.warn("[airtable-risk-reports] Missing Airtable env — skip persist.");
    return;
  }

  const table = getRiskReportTableName();
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;
  const fields: Record<string, string | number> = {
    email: input.email.trim().toLowerCase(),
    income: input.income,
    savings: input.savings,
    ownership: input.ownership,
    location: input.location,
    score: input.score,
    risk_level: input.risk_level,
    summary: input.summary,
    created_at: new Date().toISOString()
  };

  const payload = { records: [{ fields }] };
  console.log("BASE:", baseId);
  console.log("TABLE:", table);
  console.log("DATA:", fields);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Airtable risk_reports create failed: ${res.status} ${err.slice(0, 500)}`);
  }
}

export type StoredRiskReport = {
  email: string;
  income: number;
  savings: number;
  ownership: string;
  location: string;
  score: number;
  risk_level: string;
  summary: string;
  created_at: string;
};

function escapeFormulaString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function findLatestRiskReportByEmail(email: string): Promise<StoredRiskReport | null> {
  const { apiKey, baseId } = getAirtableEnv();
  if (!apiKey || !baseId) {
    console.warn("[airtable-risk-reports] Missing Airtable env — cannot lookup.");
    return null;
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const table = getRiskReportTableName();
  const formula = `{email}="${escapeFormulaString(normalized)}"`;
  const qs = new URLSearchParams({ filterByFormula: formula, maxRecords: "30" });
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}?${qs.toString()}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    console.error("[airtable-risk-reports] lookup failed:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as {
    records?: Array<{ createdTime?: string; fields?: Record<string, unknown> }>;
  };
  const rows = (data.records ?? [])
    .filter((r) => r.fields)
    .sort(
      (a, b) =>
        new Date(b.createdTime || (b.fields?.created_at as string) || 0).getTime() -
        new Date(a.createdTime || (a.fields?.created_at as string) || 0).getTime()
    );
  const rec = rows[0];
  if (!rec?.fields) return null;

  const f = rec.fields;
  return {
    email: String(f.email ?? normalized),
    income: Number(f.income) || 0,
    savings: Number(f.savings) || 0,
    ownership: String(f.ownership ?? ""),
    location: String(f.location ?? ""),
    score: Math.round(Number(f.score) || 0),
    risk_level: String(f.risk_level ?? ""),
    summary: String(f.summary ?? ""),
    created_at: String(f.created_at ?? rec.createdTime ?? "")
  };
}
