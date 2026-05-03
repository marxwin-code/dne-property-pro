import { NextResponse } from "next/server";
import { fetchListingsFromAirtable } from "@/lib/airtable";
import { buildAiSalesAdvice, getSalesPitch, matchTopProperties } from "@/lib/ai-match-engine";
import { computeInvestmentReadinessV1 } from "@/lib/investment-readiness-v1";
import { getLeadLevel } from "@/lib/lead-engine";
import type { Lang } from "@/lib/i18n/text";

export const runtime = "nodejs";

type Body = {
  age?: number;
  income?: number;
  savings?: number;
  debt?: number;
  ownership?: "Yes" | "No";
  email?: string;
  location?: string;
  lang?: Lang;
};

function isPositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isNonNeg(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const debt =
      body.debt === undefined || body.debt === null
        ? 0
        : isNonNeg(body.debt)
          ? body.debt
          : null;

    if (
      !isPositive(body.income) ||
      !isNonNeg(body.savings) ||
      debt === null ||
      (body.ownership !== "Yes" && body.ownership !== "No")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid input. Income must be greater than 0; savings must be 0 or greater; debt optional (≥0); ownership Yes|No."
        },
        { status: 400 }
      );
    }

    const lang: Lang = body.lang === "zh" ? "zh" : "en";
    const location = body.location?.trim() ?? "";

    const listings = await fetchListingsFromAirtable();
    const readiness = computeInvestmentReadinessV1({
      income: body.income,
      savings: body.savings,
      debt
    });
    const score = readiness.overall_score;
    const level = getLeadLevel(score);

    const recommended = matchTopProperties(listings, body.income, body.savings, location || undefined, 3).map(
      (p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        priceLabel: p.priceLabel,
        location: p.location,
        image_url: p.image_url,
        image: p.image,
        description: p.description
      })
    );

    const sales_message = buildAiSalesAdvice(
      level,
      recommended.map((p) => ({ location: p.location, priceLabel: p.priceLabel })),
      lang
    );

    return NextResponse.json({
      success: true,
      score,
      level,
      sales_pitch: getSalesPitch(level, lang),
      sales_message,
      recommended_properties: recommended
    });
  } catch (e) {
    console.error("[ai-match]", e);
    return NextResponse.json(
      { success: false, message: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
