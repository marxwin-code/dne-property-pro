import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  fetchListingsFromAirtable,
  pickAffordableListings,
  type AirtableListing
} from "@/lib/airtable";
import {
  computeDealScore,
  estimateMaxPurchasePrice,
  getIntentLevel,
  type IntentLevel
} from "@/lib/compare-scoring";

export const runtime = "nodejs";

type CompareBody = {
  age?: number;
  income?: number;
  savings?: number;
  hasProperty?: "Yes" | "No";
  email?: string;
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function getAffordability(income: number): "Low" | "Medium" | "High" {
  if (income < 60000) return "Low";
  if (income <= 120000) return "Medium";
  return "High";
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
  image: string;
  description: string;
};

export async function POST(req: Request) {
  try {
    const body: CompareBody = await req.json();

    if (
      !isPositiveNumber(body.age) ||
      !isPositiveNumber(body.income) ||
      !isPositiveNumber(body.savings) ||
      (body.hasProperty !== "Yes" && body.hasProperty !== "No") ||
      !body.email?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid input. Please complete all fields." },
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

    const dealScore = computeDealScore(income, savings, hasProperty);
    const intentLevel: IntentLevel = getIntentLevel(dealScore);
    const affordability = getAffordability(income);
    const maxPurchase = estimateMaxPurchasePrice(income, savings);

    let listings: AirtableListing[] = await fetchListingsFromAirtable();
    if (listings.length === 0) {
      listings = [
        {
          id: "fallback-1",
          name: "Premium House & Land —West corridor",
          price: 620_000,
          priceLabel: "$620,000",
          location: "Melbourne growth corridor",
          image:
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          description: "Turnkey package suited to owner-occupiers and investors seeking land upside."
        },
        {
          id: "fallback-2",
          name: "Designer Town Residence",
          price: 580_000,
          priceLabel: "$580,000",
          location: "Inner south-east",
          image:
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
          description: "Low-maintenance layout with strong rental appeal."
        },
        {
          id: "fallback-3",
          name: "Family Home & Land",
          price: 640_000,
          priceLabel: "$640,000",
          location: "Established schools precinct",
          image:
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
          description: "Four-bedroom stock aligned with family rental demand."
        }
      ];
    }

    const recommendedRaw = pickAffordableListings(listings, maxPurchase, 3);
    const recommendedProperties: CompareProperty[] = recommendedRaw.map((l) => ({
      id: l.id,
      name: l.name,
      priceLabel: l.priceLabel,
      location: l.location,
      image: l.image,
      description: l.description || "—"
    }));

    const jsonInstruction = `Return ONLY a single JSON object (no markdown) with keys:
{"summary":"One concise executive sentence (max 35 words).","timing":"now"|"later"|"build_deposit","risks":"2-3 sentences on key risks.","strategy":"A premium advisory paragraph on affordability, timing, and next steps (4-6 sentences).","buyingPower":"One short sentence on purchase capacity vs deposit and serviceability."}`;

    const prompt = `You are a senior Australian property investment adviser.
Client: age ${age}, annual income AUD ${income}, savings AUD ${savings}, owns property: ${hasProperty}.
Deal intent score (0-100): ${dealScore}. Affordability band: ${affordability}. Estimated max purchase ~AUD ${maxPurchase}.
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
      readinessScore: dealScore,
      dealScore,
      intentLevel,
      affordability,
      summary: strategy.summary,
      propertyInsight,
      buyingPower: strategy.buyingPower,
      timing: strategy.timing,
      timingLabel: timingLabel(strategy.timing),
      risks: strategy.risks,
      strategy: strategy.strategy,
      recommendedProperties,
      maxPurchaseEstimate: maxPurchase
    });
  } catch (e) {
    console.error("[compare]", e);
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again" },
      { status: 500 }
    );
  }
}
