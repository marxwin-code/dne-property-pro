import { NextResponse } from "next/server";
import { fetchListingsFromAirtable, FALLBACK_PROPERTY_IMAGE } from "@/lib/airtable";

export const runtime = "nodejs";

export async function GET() {
  try {
    const listings = await fetchListingsFromAirtable();
    if (listings.length === 0) {
      return NextResponse.json({
        success: true,
        listings: [
          {
            id: "demo-1",
            name: "Premium House & Land",
            priceLabel: "$620,000",
            location: "Melbourne growth corridor",
            image: FALLBACK_PROPERTY_IMAGE,
            description:
              "Add your listings in Airtable: Name, Price, Location, Description, and an **Image URL** field (https://images.unsplash.com/...)."
          }
        ],
        demo: true
      });
    }
    return NextResponse.json({
      success: true,
      listings: listings.map((l) => ({
        id: l.id,
        name: l.name,
        priceLabel: l.priceLabel,
        location: l.location,
        image: l.image,
        description: l.description
      })),
      demo: false
    });
  } catch (e) {
    console.error("[api/properties]", e);
    return NextResponse.json({ success: false, message: "Failed to load properties." }, { status: 500 });
  }
}
