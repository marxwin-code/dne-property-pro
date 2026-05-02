import { NextResponse } from "next/server";
import { fetchListingsFromAirtable } from "@/lib/airtable";
import {
  buildAiSalesAdvice,
  computeAiLeadScore,
  getSalesPitch,
  matchTopProperties
} from "@/lib/ai-match-engine";
import { getLeadLevel } from "@/lib/lead-engine";
import type { Lang } from "@/lib/i18n/text";

export const runtime = "nodejs";

type Body = {
  age?: number;
  income?: number;
  savings?: number;
  ownership?: "Yes" | "No";
  email?: string;
  location?: string;
  lang?: Lang;
};

function isFin(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!isFin(body.income) || !isFin(body.savings) || (body.ownership !== "Yes" && body.ownership !== "No")) {
      return NextResponse.json(
        { success: false, message: "Invalid input. income, savings, and ownership (Yes|No) are required." },
        { status: 400 }
      );
    }

    const lang: Lang = body.lang === "zh" ? "zh" : "en";
    const location = body.location?.trim() ?? "";

    const listings = await fetchListingsFromAirtable();
    const score = computeAiLeadScore(
      body.income,
      body.savings,
      body.ownership,
      listings,
      location || undefined
    );
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
