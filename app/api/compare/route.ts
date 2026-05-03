/**
 * Compare AI API — do not block user input based on business rules; all evaluation
 * is in `lib/investment-readiness-v1` (and downstream copy), not in 400s for “low income”.
 */
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchCatalogProperties } from "@/lib/airtable-catalog-properties";
import { recommendPropertiesFromCatalog } from "@/lib/property-recommendation-engine";
import { buildAiSalesAdvice, computeMaxBudget, getSalesPitch } from "@/lib/ai-match-engine";
import {
  affordabilityScoreToBand,
  computeInvestmentReadinessV1
} from "@/lib/investment-readiness-v1";
import { getLeadLevel, type LeadLevel } from "@/lib/lead-engine";
import type { Lang } from "@/lib/i18n/text";

export const runtime = "nodejs";

type CompareBody = {
  age?: number;
  income?: number;
  savings?: number;
  /** Optional total debt (AUD); defaults to 0. Evaluated only inside scoring. */
  debt?: number;
  hasProperty?: "Yes" | "No";
  email?: string;
  lang?: Lang;
  cityHint?: string;
};

/** Technical validation only — never reject income/savings for being “too low”. */
function isStrictlyPositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

type StrategyJson = {
  summary: string;
  timing: "now" | "later" | "build_deposit";
  risks: string;
  strategy: string;
  buyingPower: string;
};

function parseStrategyJson(text: string): StrategyJson {
  const fallback: StrategyJson = {
    summary: "Your financial position has been reviewed against current market conditions.",
    timing: "later",
    risks: "Market and interest-rate movements can affect borrowing capacity; seek personalised credit advice.",
    strategy:
      "Clarify budget, secure pre-approval, and shortlist stock that matches your long-term plan.",
    buyingPower: "Serviceability and deposit will define your effective purchase range."
  };
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return fallback;
  try {
    const o = JSON.parse(jsonMatch[0]) as Partial<StrategyJson>;
    return {
      summary: typeof o.summary === "string" ? o.summary : fallback.summary,
      timing:
        o.timing === "now" || o.timing === "later" || o.timing === "build_deposit"
          ? o.timing
          : fallback.timing,
      risks: typeof o.risks === "string" ? o.risks : fallback.risks,
      strategy: typeof o.strategy === "string" ? o.strategy : fallback.strategy,
      buyingPower: typeof o.buyingPower === "string" ? o.buyingPower : fallback.buyingPower
    };
  } catch {
    return fallback;
  }
}

function timingLabel(t: StrategyJson["timing"]): string {
  if (t === "now") return "Now — market entry is aligned with your position";
  if (t === "build_deposit") return "Build deposit first — strengthen your entry position";
  return "Later — review timing with a broker or advisor";
}

export type CompareProperty = {
  id: string;
  name: string;
  priceLabel: string;
  location: string;
  image_url: string;
  /** @deprecated use image_url */
  image: string;
  description: string;
};

export async function POST(req: Request) {
  try {
    const body: CompareBody = await req.json();

    const debtRaw = body.debt;
    const debt =
      debtRaw === undefined || debtRaw === null
        ? 0
        : typeof debtRaw === "number" && Number.isFinite(debtRaw) && debtRaw >= 0
          ? debtRaw
          : null;

    if (
      !isStrictlyPositive(body.age) ||
      !isStrictlyPositive(body.income) ||
      !isNonNegative(body.savings) ||
      debt === null ||
      (body.hasProperty !== "Yes" && body.hasProperty !== "No") ||
      !body.email?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid input. Age and income must be numbers greater than 0; savings must be 0 or greater; debt must be omitted or a non-negative number."
        },
        { status: 400 }
      );
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey) {
      return NextResponse.json(
        { success: false, message: "Server configuration missing OPENAI_API_KEY." },
        { status: 503 }
      );
    }

    const income = body.income;
    const savings = body.savings;
    const hasProperty = body.hasProperty;
    const age = body.age;
    const lang: Lang = body.lang === "zh" ? "zh" : "en";
    const cityHint = body.cityHint?.trim();

    const readiness = computeInvestmentReadinessV1({
      income,
      savings,
      debt
    });
    const leadScore = readiness.overall_score;
    const leadLevel: LeadLevel = getLeadLevel(leadScore);
    const affordability = affordabilityScoreToBand(readiness.affordability_score);
    const budgetEstimate = computeMaxBudget(savings, income);

    const catalog = await fetchCatalogProperties(200);
    const recEngine = recommendPropertiesFromCatalog(catalog, {
      income,
      savings,
      ownership: hasProperty === "Yes" ? "yes" : "no",
      location: cityHint ?? "",
      lang
    });

    const recommendedProperties: CompareProperty[] = recEngine.recommended_properties.map((p) => ({
      id: p.id,
      name: p.name,
      priceLabel: `$${Math.round(p.price).toLocaleString("en-AU")}`,
      location: p.location,
      image_url: p.image,
      image: p.image,
      description: p.description || "—",
      reason: p.reason
    }));

    const salesAdvice = buildAiSalesAdvice(
      leadLevel,
      recommendedProperties.map((p) => ({ location: p.location, priceLabel: p.priceLabel })),
      lang
    );

    const salesPitch = getSalesPitch(leadLevel, lang);

    const jsonInstruction = `Return ONLY a single JSON object (no markdown) with keys:
{"summary":"One concise executive sentence (max 35 words).","timing":"now"|"later"|"build_deposit","risks":"2-3 sentences on key risks.","strategy":"A premium advisory paragraph on affordability, timing, and next steps (4-6 sentences).","buyingPower":"One short sentence referencing indicative purchase range ≈ savings×5 + income×3 and serviceability."}`;

    const prompt = `You are a senior Australian property investment adviser.
Client: age ${age}, annual income AUD ${income}, savings AUD ${savings}, debt AUD ${debt}, owns property: ${hasProperty}.
Investment readiness (V1): overall_score ${leadScore}/100, affordability_score ${readiness.affordability_score}/100, risk_safety_score ${readiness.risk_safety_score}/100, risk_band ${readiness.risk_level}. Indicative max purchase budget (savings×5 + income×3): ~AUD ${budgetEstimate.toLocaleString("en-AU")}.
Affordability display band (from affordability_score only): ${affordability}.
Do not refuse or discourage the client solely because income is low — explain trade-offs and risks instead.
${jsonInstruction}`;

    const openai = new OpenAI({ apiKey: openAiKey });
    const aiResponse = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt
    });

    const rawOut = aiResponse.output_text?.trim() ?? "";
    const strategy = parseStrategyJson(rawOut);

    const propertyInsight =
      affordability === "Low"
        ? "Focus on deposit growth and borrowing clarity before targeting premium stock."
        : affordability === "Medium"
          ? "You can evaluate quality house-and-land stock with structured finance."
          : "You have capacity to pursue premium assets and optimise for long-term growth.";

    const report = `${strategy.strategy}\n\nRisks:\n${strategy.risks}`;

    return NextResponse.json({
      success: true,
      message: "Report generated",
      report,
      leadScore,
      leadLevel,
      readinessScore: leadScore,
      dealScore: leadScore,
      salesAdvice,
      salesPitch,
      budgetEstimate,
      affordability,
      affordabilityScore: readiness.affordability_score,
      riskSafetyScore: readiness.risk_safety_score,
      overallScore: readiness.overall_score,
      scoringRiskLevel: readiness.risk_level,
      scoringV1: {
        monthly_income: readiness.monthly_income,
        borrowing_power: readiness.borrowing_power,
        max_property_price: readiness.max_property_price,
        affordable_price: readiness.affordable_price,
        low_reasons_en: readiness.low_score_reasons_en,
        high_reasons_en: readiness.high_score_reasons_en,
        low_reasons_zh: readiness.low_score_reasons_zh,
        high_reasons_zh: readiness.high_score_reasons_zh
      },
      summary: strategy.summary,
      propertyInsight,
      buyingPower: strategy.buyingPower,
      timing: strategy.timing,
      timingLabel: timingLabel(strategy.timing),
      risks: strategy.risks,
      strategy: strategy.strategy,
      recommendedProperties,
      recommendationBudget: recEngine.budget,
      recommendationLoanCapacity: recEngine.loan_capacity,
      recommendationFallbackHint: recEngine.fallback_hint
    });
  } catch (e) {
    console.error("[compare]", e);
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
