import type { RiskBreakdown } from "./property-risk-report";
import { getAirtableEnv } from "./airtable";

/**
 * Base table: `risk_reports` (override with AIRTABLE_RISK_REPORTS_TABLE_NAME).
 * All field names lowercase: email, score, risk_level, financial_risk, cashflow_risk,
 * location_risk, property_risk, liquidity_risk, summary, created_at
 *
 * `summary` stores JSON for round-trip: ai / recommendation text (EN+ZH).
 */
export type RiskReportRowInput = {
  email: string;
  score: number;
  risk_level: string;
  risk_breakdown: RiskBreakdown;
  ai_summary: string;
  ai_summary_en: string;
  recommendation: string;
  recommendation_en: string;
};

function getRiskReportTableName(): string {
  return process.env.AIRTABLE_RISK_REPORTS_TABLE_NAME?.trim() || "risk_reports";
}

function summaryPayload(input: RiskReportRowInput): string {
  return JSON.stringify({
    ai_summary: input.ai_summary,
    ai_summary_en: input.ai_summary_en,
    recommendation: input.recommendation,
    recommendation_en: input.recommendation_en
  });
}

function parseSummaryField(raw: string | undefined): {
  ai_summary: string;
  ai_summary_en: string;
  recommendation: string;
  recommendation_en: string;
} {
  if (!raw?.trim()) {
    return { ai_summary: "", ai_summary_en: "", recommendation: "", recommendation_en: "" };
  }
  try {
    const o = JSON.parse(raw) as Record<string, string>;
    return {
      ai_summary: o.ai_summary ?? "",
      ai_summary_en: o.ai_summary_en ?? "",
      recommendation: o.recommendation ?? "",
      recommendation_en: o.recommendation_en ?? ""
    };
  } catch {
    return { ai_summary: raw, ai_summary_en: "", recommendation: "", recommendation_en: "" };
  }
}

export async function createRiskReportRecord(input: RiskReportRowInput): Promise<void> {
  const { apiKey, baseId } = getAirtableEnv();
  if (!apiKey || !baseId) {
    console.warn("[airtable-risk-reports] Missing Airtable env — skip persist.");
    return;
  }

  const table = getRiskReportTableName();
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;
  const b = input.risk_breakdown;
  const fields: Record<string, string | number> = {
    email: input.email.trim().toLowerCase(),
    score: input.score,
    risk_level: input.risk_level,
    financial_risk: b.financial,
    cashflow_risk: b.cashflow,
    location_risk: b.location,
    property_risk: b.property,
    liquidity_risk: b.liquidity,
    summary: summaryPayload(input),
    created_at: new Date().toISOString()
  };

  const payload = { records: [{ fields }] };
  console.log("Airtable risk_reports payload:", JSON.stringify({ table, email: fields.email, score: fields.score }));

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
  risk_score: number;
  risk_level: string;
  risk_breakdown: RiskBreakdown;
  ai_summary: string;
  ai_summary_en: string;
  recommendation: string;
  recommendation_en: string;
  created_at: string;
};

function escapeFormulaString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Latest report for this email (case-insensitive). */
export async function findLatestRiskReportByEmail(
  email: string
): Promise<StoredRiskReport | null> {
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
  const score = typeof f.score === "number" ? f.score : Number(f.score) || 0;
  const risk_level = String(f.risk_level ?? "");
  const meta = parseSummaryField(String(f.summary ?? ""));

  const risk_breakdown: RiskBreakdown = {
    financial: (f.financial_risk as RiskBreakdown["financial"]) || "Low",
    cashflow: (f.cashflow_risk as RiskBreakdown["cashflow"]) || "Low",
    location: (f.location_risk as RiskBreakdown["location"]) || "Low",
    property: (f.property_risk as RiskBreakdown["property"]) || "Low",
    liquidity: (f.liquidity_risk as RiskBreakdown["liquidity"]) || "Low"
  };

  return {
    email: String(f.email ?? normalized),
    risk_score: Math.round(score),
    risk_level,
    risk_breakdown,
    ai_summary: meta.ai_summary,
    ai_summary_en: meta.ai_summary_en,
    recommendation: meta.recommendation,
    recommendation_en: meta.recommendation_en,
    created_at: String(f.created_at ?? "")
  };
}
