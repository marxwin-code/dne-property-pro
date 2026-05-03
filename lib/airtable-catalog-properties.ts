/**
 * Airtable **Properties** catalog — fixed columns only (lowercase):
 * name, price, location, image_url, description
 * Table name defaults to `Properties` (override with AIRTABLE_CATALOG_TABLE_NAME).
 */
import { getAirtableEnv } from "./airtable";

export const DEFAULT_PROPERTY_IMAGE_URL =
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0";

export type CatalogProperty = {
  id: string;
  name: string;
  price: number;
  location: string;
  image_url: string;
  description: string;
};

function ensureHttpsImage(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (t.startsWith("https://")) return t;
  if (t.startsWith("http://")) return `https://${t.slice(7)}`;
  return DEFAULT_PROPERTY_IMAGE_URL;
}

function readNum(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function mapRecordToCatalogProperty(
  id: string,
  fields: Record<string, unknown>
): CatalogProperty {
  const f = fields;
  const name = String(f.name ?? f.Name ?? "Property").trim() || "Property";
  const price = readNum(f.price ?? f.Price);
  const location = String(f.location ?? f.Location ?? "—").trim() || "—";
  const desc = String(f.description ?? f.Description ?? "").trim();
  const rawImg = f.image_url ?? f.image_URL ?? f["image url"] ?? f.imageUrl;
  const image_url = ensureHttpsImage(typeof rawImg === "string" ? rawImg : "");

  return {
    id,
    name,
    price,
    location,
    image_url: image_url || DEFAULT_PROPERTY_IMAGE_URL,
    description: desc
  };
}

export function getCatalogTableName(): string {
  return process.env.AIRTABLE_CATALOG_TABLE_NAME?.trim() || "Properties";
}

export async function fetchCatalogProperties(maxRecords = 100): Promise<CatalogProperty[]> {
  const { apiKey, baseId } = getAirtableEnv();
  if (!apiKey || !baseId) {
    console.warn("[airtable-catalog] Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID — no catalog.");
    return [];
  }

  const table = getCatalogTableName();
  const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}?maxRecords=${maxRecords}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 120 }
    });
    if (!res.ok) {
      console.error("[airtable-catalog] fetch failed:", res.status, (await res.text()).slice(0, 300));
      return [];
    }
    const data = (await res.json()) as { records?: Array<{ id: string; fields: Record<string, unknown> }> };
    const records = data.records ?? [];
    return records.map((r) => mapRecordToCatalogProperty(r.id, r.fields));
  } catch (e) {
    console.error("[airtable-catalog]", e);
    return [];
  }
}

export function pickRecommendedCatalogProperties(
  listings: CatalogProperty[],
  maxPrice: number,
  limit = 3
): CatalogProperty[] {
  const ok = listings.filter((l) => Number.isFinite(l.price) && l.price > 0 && l.price <= maxPrice);
  ok.sort((a, b) => b.price - a.price);
  if (ok.length >= limit) return ok.slice(0, limit);
  const rest = listings
    .filter((l) => !ok.includes(l) && Number.isFinite(l.price) && l.price > 0)
    .sort((a, b) => Math.abs(a.price - maxPrice) - Math.abs(b.price - maxPrice));
  return [...ok, ...rest].slice(0, limit);
}
