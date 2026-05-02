import { PROPERTY_IMG_FALLBACK } from "./luxury-media";

/** Normalise listing image to a full https URL; otherwise returns null. */
export function normalizeListingImageUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return `https://${t.slice(7)}`;
  return null;
}

export const FALLBACK_PROPERTY_IMAGE = PROPERTY_IMG_FALLBACK;

/**
 * Normalised listing — always use these keys on the frontend/API (never raw `fields`).
 */
export type AirtableListing = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  location: string;
  /** Primary image URL (maps from Airtable `image_url`). */
  image_url: string;
  description: string;
  /** Alias of `image_url` for legacy callers. */
  image: string;
};

function parsePriceField(value: unknown): { numeric: number; label: string } {
  if (typeof value === "number" && Number.isFinite(value)) {
    return { numeric: value, label: `$${value.toLocaleString("en-AU")}` };
  }
  const s = String(value ?? "").trim();
  const digits = s.replace(/[^\d.]/g, "");
  const n = parseFloat(digits);
  if (Number.isFinite(n) && n > 0) {
    return { numeric: n, label: s.startsWith("$") ? s : `$${n.toLocaleString("en-AU")}` };
  }
  return { numeric: Number.POSITIVE_INFINITY, label: s || "—" };
}

type RawFields = Record<string, unknown>;

/**
 * Single place: map Airtable record.fields → app shape (lowercase schema).
 * Expected columns: name, price, location, image_url, description (legacy column names still read as fallback).
 */
export function mapFieldsToListing(id: string, fields: RawFields): AirtableListing {
  const f = fields;
  const name = String(f.name ?? f.Name ?? "Listing").trim() || "Listing";
  const { numeric, label } = parsePriceField(f.price ?? f.Price);
  const location = String(f.location ?? f.Location ?? "—").trim();
  const rawImg =
    f.image_url ??
    f.image_URL ??
    f["Image URL"] ??
    f["image url"] ??
    f.Image ??
    f.image ??
    f.Photo ??
    f.img;
  const imgNorm = normalizeListingImageUrl(
    typeof rawImg === "string" ? rawImg : Array.isArray(rawImg) && rawImg[0] ? String(rawImg[0]) : ""
  );
  const image_url = imgNorm ?? FALLBACK_PROPERTY_IMAGE;
  const description = String(f.description ?? f.Description ?? "").trim();

  return {
    id,
    name,
    price: numeric,
    priceLabel: label,
    location,
    image_url,
    image: image_url,
    description
  };
}

type AirtableRecord = {
  id: string;
  fields: RawFields;
};

export function getAirtableEnv() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const leadsTable = process.env.AIRTABLE_TABLE_NAME || "Leads";
  const listingsTable =
    process.env.AIRTABLE_LISTINGS_TABLE_NAME || process.env.AIRTABLE_PROPERTIES_TABLE_NAME || "Properties";
  return { apiKey, baseId, leadsTable, listingsTable };
}

export async function fetchListingsFromAirtable(maxRecords = 100): Promise<AirtableListing[]> {
  const { apiKey, baseId, listingsTable } = getAirtableEnv();
  if (!apiKey || !baseId) {
    console.warn("[airtable] Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID — skipping listings fetch.");
    return [];
  }

  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(listingsTable)}?maxRecords=${maxRecords}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 120 }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[airtable] Listings fetch failed:", res.status, errText.slice(0, 500));
      return [];
    }

    const data = (await res.json()) as { records?: AirtableRecord[] };
    const records = data.records ?? [];
    console.log(`[airtable] Connected: loaded ${records.length} listing rows from "${listingsTable}".`);

    return records.map((rec) => mapFieldsToListing(rec.id, rec.fields));
  } catch (e) {
    console.error("[airtable] Listings fetch error:", e);
    return [];
  }
}

/** @deprecated Use recommendPropertiesForBudget from lead-engine (budget = savings * 5). */
export function pickAffordableListings(
  listings: AirtableListing[],
  maxPrice: number,
  limit = 3
): AirtableListing[] {
  const affordable = listings.filter((l) => l.price <= maxPrice && Number.isFinite(l.price));
  affordable.sort((a, b) => b.price - a.price);
  if (affordable.length >= limit) return affordable.slice(0, limit);
  const rest = listings
    .filter((l) => !affordable.includes(l))
    .sort((a, b) => a.price - b.price);
  return [...affordable, ...rest].slice(0, limit);
}
