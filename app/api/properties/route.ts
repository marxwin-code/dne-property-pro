import { NextResponse } from "next/server";
import type { AirtableListing } from "@/lib/airtable";
import { fetchListingsFromAirtable, FALLBACK_PROPERTY_IMAGE, makeFallbackAirtableListing } from "@/lib/airtable";

export const runtime = "nodejs";

/** Public API: snake_case metrics + card fields (fixed keys only). */
function toResponseListing(l: AirtableListing) {
  return {
    id: l.id,
    suburb: l.suburb,
    lot_number: l.lot_number,
    price: l.list_price,
    package_price: l.package_price,
    price_band: l.price_band,
    market_price_band: l.market_price_band,
    weekly_rent: l.weekly_rent,
    yield_percent: l.yield_percent,
    yield_estimate: l.yield_estimate,
    investment_score: l.investment_score,
    growth_score: l.growth_score,
    risk_level: l.risk_level,
    suburb_score: l.suburb_score,
    distance_to_cbd: l.distance_to_cbd,
    school_score: l.school_score,
    crime_rate: l.crime_rate,
    name: l.name,
    priceLabel: l.priceLabel,
    location: l.location,
    image_url: l.image_url,
    image: l.image,
    description: l.description
  };
}

export async function GET() {
  try {
    const listings = await fetchListingsFromAirtable();
    if (listings.length === 0) {
      const demo = makeFallbackAirtableListing({
        id: "demo-1",
        name: "Premium House & Land",
        price: 620_000,
        location: "Melbourne growth corridor",
        image_url: FALLBACK_PROPERTY_IMAGE,
        description:
          "Add your properties in Airtable: table `properties_v2` (or set AIRTABLE_PROPERTIES_TABLE_NAME), fields suburb, lot_number, package_price, weekly_rent, image_url, …"
      });
      return NextResponse.json({
        success: true,
        listings: [toResponseListing(demo)],
        demo: true
      });
    }
    return NextResponse.json({
      success: true,
      listings: listings.map(toResponseListing),
      demo: false
    });
  } catch (e) {
    console.error("[api/properties]", e);
    return NextResponse.json({ success: false, message: "Failed to load properties." }, { status: 500 });
  }
}
