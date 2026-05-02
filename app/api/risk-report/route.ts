import { NextResponse } from "next/server";
import { createRiskReportRecord } from "@/lib/airtable-risk-reports";
import {
  computePropertyRiskReport,
  defaultEngineOptionsFromEnv,
  type PropertyRiskReportInput
} from "@/lib/property-risk-report";
import { sendRiskReportToInbox } from "@/lib/risk-report-email";

export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email.trim());
}

function isFinitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

function parseBoolish(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (s === "yes" || s === "true") return true;
    if (s === "no" || s === "false") return false;
  }
  return undefined;
}

function parseBody(
  raw: unknown
): { input: PropertyRiskReportInput; tier: "free" | "full"; email?: string; lang: "en" | "zh" } | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;

  const income = b.income;
  const savings = b.savings;
  if (!isFinitePositive(income) || !isFiniteNonNegative(savings)) return null;

  const userLoc =
    typeof b.userLocation === "string"
      ? b.userLocation
      : typeof b.location === "string"
        ? b.location
        : "";
  if (!userLoc.trim()) return null;

  const prop = b.property;
  if (!prop || typeof prop !== "object") return null;
  const p = prop as Record<string, unknown>;
  const price = p.price;
  const propLocation = p.location;
  const propType = p.type;
  if (!isFinitePositive(price) || typeof propLocation !== "string" || !propLocation.trim()) {
    return null;
  }
  if (typeof propType !== "string" || !propType.trim()) return null;

  const tierRaw = b.tier;
  const tier = tierRaw === "free" ? "free" : "full";

  const email = typeof b.email === "string" ? b.email.trim() : undefined;
  const lang = b.lang === "zh" ? "zh" : "en";

  const input: PropertyRiskReportInput = {
    income,
    savings,
    ownership: parseBoolish(b.ownership),
    location: userLoc.trim(),
    property: {
      price,
      location: propLocation.trim(),
      type: propType.trim()
    }
  };

  return { input, tier, email, lang };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = parseBody(json);

    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid input. Required: income, savings, location (or userLocation), property: { price, location, type }. Full tier also requires a valid email. Optional: ownership, tier (free|full), lang (en|zh)."
        },
        { status: 400 }
      );
    }

    if (parsed.tier === "full") {
      if (!parsed.email || !isValidEmail(parsed.email)) {
        return NextResponse.json(
          {
            success: false,
            message: "A valid email is required for the full risk report (delivery + saved copy)."
          },
          { status: 400 }
        );
      }
    }

    const opts = defaultEngineOptionsFromEnv();
    const result = computePropertyRiskReport(parsed.input, opts);

    if (parsed.tier === "free") {
      return NextResponse.json({
        success: true,
        tier: "free" as const,
        risk_score: result.risk_score,
        risk_level: result.risk_level,
        message: "Upgrade for full breakdown, AI summary, and recommendations."
      });
    }

    try {
      await createRiskReportRecord({
        email: parsed.email!,
        score: result.risk_score,
        risk_level: result.risk_level,
        risk_breakdown: result.risk_breakdown,
        ai_summary: result.ai_summary,
        ai_summary_en: result.ai_summary_en,
        recommendation: result.recommendation,
        recommendation_en: result.recommendation_en
      });
    } catch (err) {
      console.error("[risk-report] Airtable persist failed:", err);
      return NextResponse.json(
        {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : "Could not save the risk report. Check Airtable risk_reports table and env."
        },
        { status: 502 }
      );
    }

    try {
      await sendRiskReportToInbox({
        email: parsed.email!,
        risk_score: result.risk_score,
        risk_level: result.risk_level,
        ai_summary: result.ai_summary,
        ai_summary_en: result.ai_summary_en,
        recommendation: result.recommendation,
        recommendation_en: result.recommendation_en,
        lang: parsed.lang
      });
    } catch (err) {
      console.error("[risk-report] Email send failed:", err);
      return NextResponse.json(
        {
          success: false,
          message:
            err instanceof Error ? err.message : "Report was saved but email could not be sent."
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      tier: "full" as const,
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      risk_breakdown: result.risk_breakdown,
      ai_summary: result.ai_summary,
      ai_summary_en: result.ai_summary_en,
      recommendation: result.recommendation,
      recommendation_en: result.recommendation_en
    });
  } catch (e) {
    console.error("[risk-report]", e);
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
