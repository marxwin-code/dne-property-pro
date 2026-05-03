import { NextResponse } from "next/server";
import {
  DEFAULT_PROPERTY_IMAGE_URL,
  fetchCatalogProperties,
  type CatalogProperty
} from "@/lib/airtable-catalog-properties";

export const runtime = "nodejs";

function toListingCard(p: CatalogProperty) {
  const priceLabel =
    p.price > 0 ? `$${Math.round(p.price).toLocaleString("en-AU")}` : "—";
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    priceLabel,
    location: p.location,
    image_url: p.image_url,
    image: p.image_url,
    description: p.description
  };
}

export async function GET() {
  try {
    const rows = await fetchCatalogProperties();
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        listings: [
          {
            id: "demo-1",
            name: "Premium House & Land",
            price: 620_000,
            priceLabel: "$620,000",
            location: "Melbourne growth corridor",
            image_url: DEFAULT_PROPERTY_IMAGE_URL,
            image: DEFAULT_PROPERTY_IMAGE_URL,
            description:
              "Add rows to Airtable table Properties: name, price, location, image_url (https…), description."
          }
        ],
        demo: true
      });
    }
    return NextResponse.json({
      success: true,
      listings: rows.map(toListingCard),
      demo: false
    });
  } catch (e) {
    console.error("[api/properties]", e);
    return NextResponse.json({ success: false, message: "Failed to load properties." }, { status: 500 });
  }
}
