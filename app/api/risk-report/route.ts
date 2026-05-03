import { NextResponse } from "next/server";
import {
  createRiskReportRecord,
  findLatestRiskReportByEmail,
  type StoredRiskReport
} from "@/lib/airtable-risk-reports";
import {
  fetchCatalogProperties,
  pickRecommendedCatalogProperties,
  type CatalogProperty
} from "@/lib/airtable-catalog-properties";
import {
  buildRiskSummary,
  computeReadinessScore,
  maxPropertyPriceForScore,
  scoreToRiskLevel
} from "@/lib/dne-readiness-score";
import { toAirtableLeadFields } from "@/lib/airtable-lead-fields";
import { insertLeadRecord } from "@/lib/airtable-insert-lead";

export const runtime = "nodejs";

const USER_FAIL = "Failed to submit. Please try again.";

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email.trim());
}

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

function isFinitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function normalizeOwnership(raw: unknown): "yes" | "no" {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (s === "yes" || s === "true") return "yes";
  return "no";
}

async function loadRecommendations(score: number): Promise<CatalogProperty[]> {
  const maxPrice = maxPropertyPriceForScore(score);
  const catalog = await fetchCatalogProperties();
  return pickRecommendedCatalogProperties(catalog, maxPrice, 3);
}

function jsonFromStored(
  stored: StoredRiskReport,
  recommended: CatalogProperty[],
  lang: "en" | "zh"
) {
  return {
    success: true as const,
    score: stored.score,
    risk_level: stored.risk_level,
    summary: stored.summary,
    income: stored.income,
    savings: stored.savings,
    ownership: stored.ownership,
    location: stored.location,
    recommended_properties: recommended,
    created_at: stored.created_at,
    lang
  };
}

/** GET /api/risk-report?email=… — latest stored report + fresh recommendations from catalog */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim();
    if (!email) {
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
    }

    const stored = await findLatestRiskReportByEmail(email);
    if (!stored) {
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 404 });
    }

    const lang = searchParams.get("lang") === "zh" ? "zh" : "en";
    const recommended = await loadRecommendations(stored.score);

    return NextResponse.json(jsonFromStored(stored, recommended, lang));
  } catch (e) {
    console.error("[risk-report GET]", e);
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 500 });
  }
}

/**
 * POST /api/risk-report — readiness score, persist risk_reports, optional Leads row, recommendations.
 * Body (snake_case): email, income, savings, ownership, location; optional name for Leads.
 */
export async function POST(req: Request) {
  try {
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
    }

    const b = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

    const email = typeof b.email === "string" ? b.email.trim() : "";
    const location = typeof b.location === "string" ? b.location.trim() : "";
    const name = typeof b.name === "string" ? b.name.trim() : "";

    if (!isValidEmail(email) || !location || !name) {
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
    }

    if (!isFinitePositive(b.income) || !isFiniteNonNegative(b.savings)) {
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 400 });
    }

    const ownership = normalizeOwnership(b.ownership);
    const income = b.income as number;
    const savings = b.savings as number;

    const score = computeReadinessScore({ income, savings, ownership });
    const risk_level = scoreToRiskLevel(score);
    const lang = b.lang === "zh" ? "zh" : "en";
    const summary = buildRiskSummary({
      score,
      risk_level,
      location,
      lang
    });

    const recommended = await loadRecommendations(score);

    try {
      await insertLeadRecord(
        toAirtableLeadFields({
          name,
          email,
          income,
          savings,
          ownership,
          location,
          score
        })
      );
    } catch (e) {
      console.error("[risk-report POST] Leads insert failed", e);
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 500 });
    }

    try {
      await createRiskReportRecord({
        email,
        income,
        savings,
        ownership,
        location,
        score,
        risk_level,
        summary
      });
    } catch (e) {
      console.error("[risk-report POST] risk_reports insert failed", e);
      return NextResponse.json({ success: false, message: USER_FAIL }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      score,
      risk_level,
      summary,
      income,
      savings,
      ownership,
      location,
      recommended_properties: recommended,
      lang
    });
  } catch (e) {
    console.error("[risk-report POST]", e);
    return NextResponse.json({ success: false, message: USER_FAIL }, { status: 500 });
  }
}
