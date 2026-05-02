/** Normalise listing image to a full https URL; otherwise returns null. */
export function normalizeListingImageUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return `https://${t.slice(7)}`;
  return null;
}

export const FALLBACK_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

export type AirtableListing = {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  location: string;
  image: string;
  description: string;
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

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
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

    const out: AirtableListing[] = [];
    for (const rec of records) {
      const f = rec.fields;
      const name = String(f.Name ?? f.name ?? "Listing").trim() || "Listing";
      const { numeric, label } = parsePriceField(f.Price ?? f.price);
      const location = String(f.Location ?? f.location ?? "—").trim();
      const rawImg = f.Image ?? f.image ?? f.Photo;
      const imgNorm = normalizeListingImageUrl(
        typeof rawImg === "string" ? rawImg : Array.isArray(rawImg) && rawImg[0] ? String(rawImg[0]) : ""
      );
      const image = imgNorm ?? FALLBACK_PROPERTY_IMAGE;
      const description = String(f.Description ?? f.description ?? "").trim();

      out.push({
        id: rec.id,
        name,
        price: numeric,
        priceLabel: label,
        location,
        image,
        description
      });
    }
    return out;
  } catch (e) {
    console.error("[airtable] Listings fetch error:", e);
    return [];
  }
}

/** Pick up to `limit` listings with price <= maxPrice AUD (numeric). */
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
