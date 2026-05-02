import { NextResponse } from "next/server";
import { findLatestRiskReportByEmail } from "@/lib/airtable-risk-reports";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email query parameter is required." }, { status: 400 });
    }

    const stored = await findLatestRiskReportByEmail(email);
    if (!stored) {
      return NextResponse.json(
        {
          success: false,
          message: "No saved risk report found for this email. Generate a new report on this page first."
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tier: "stored",
      risk_score: stored.risk_score,
      risk_level: stored.risk_level,
      risk_breakdown: stored.risk_breakdown,
      ai_summary: stored.ai_summary,
      ai_summary_en: stored.ai_summary_en,
      recommendation: stored.recommendation,
      recommendation_en: stored.recommendation_en,
      created_at: stored.created_at
    });
  } catch (e) {
    console.error("[risk-report/lookup]", e);
    return NextResponse.json({ success: false, message: "Lookup failed." }, { status: 500 });
  }
}
