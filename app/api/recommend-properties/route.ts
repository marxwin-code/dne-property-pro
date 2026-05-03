import { NextResponse } from "next/server";
import { fetchCatalogProperties } from "@/lib/airtable-catalog-properties";
import { recommendPropertiesFromCatalog } from "@/lib/property-recommendation-engine";

export const runtime = "nodejs";

const BAD_INPUT = "Invalid input.";

function isFinitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/**
 * POST /api/recommend-properties
 * Body: { income, savings, ownership, location?, lang? }
 * Output: { budget, recommended_properties[{ name, price, location, image, description, reason }] }
 */
export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, message: BAD_INPUT }, { status: 400 });
    }

    if (!isFinitePositive(body.income) || !isFiniteNonNegative(body.savings)) {
      return NextResponse.json({ success: false, message: BAD_INPUT }, { status: 400 });
    }

    const ownership = typeof body.ownership === "string" ? body.ownership : "no";
    const location = typeof body.location === "string" ? body.location : "";
    const lang = body.lang === "zh" ? "zh" : "en";

    const catalog = await fetchCatalogProperties(200);
    const out = recommendPropertiesFromCatalog(catalog, {
      income: body.income as number,
      savings: body.savings as number,
      ownership,
      location,
      lang
    });

    return NextResponse.json({
      success: true,
      budget: out.budget,
      loan_capacity: out.loan_capacity,
      recommended_properties: out.recommended_properties.map((p) => ({
        name: p.name,
        price: p.price,
        location: p.location,
        image: p.image,
        description: p.description,
        reason: `${p.reason.why}\n\n${p.reason.suitability}\n\n${p.reason.risk}`
      })),
      fallback_hint: out.fallback_hint
    });
  } catch (e) {
    console.error("[recommend-properties]", e);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
