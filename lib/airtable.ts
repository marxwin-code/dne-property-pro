import { PROPERTY_IMG_FALLBACK } from "./luxury-media";
import { PROPERTY_FIELD } from "./airtable-property-fields";
import {
  computeInvestmentScore,
  computePriceBand,
  computeRiskLevel,
  computeYieldEstimatePercent,
  type PriceBand,
  type RiskLevel
} from "./property-scoring";

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

type RawFields = Record<string, unknown>;

function readString(f: RawFields, ...keys: string[]): string {
  for (const k of keys) {
    const v = f[k];
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
}

function readNumber(f: RawFields, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = f[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const digits = v.replace(/[^\d.-]/g, "");
      const n = parseFloat(digits);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

function readInt(f: RawFields, ...keys: string[]): number {
  const n = readNumber(f, ...keys);
  return n !== null && Number.isFinite(n) ? Math.round(n) : 0;
}

/**
 * Normalised listing — structured snake_case fields plus legacy UI keys (`name`, `price`, `location`).
 * AI metrics (`price_band`, `yield_estimate`, `investment_score`, `risk_level`) are always computed in code.
 */
export type AirtableListing = {
  id: string;
  suburb: string;
  estate: string;
  lot_number: string;
  land_size: number;
  frontage: number;
  depth: number;
  land_price: number;
  title_date: string;
  house_design: string;
  house_size: number;
  build_price: number;
  facade: string;
  bedrooms: number;
  bathrooms: number;
  car_spaces: number;
  package_price: number;
  status: string;
  region: string;
  price_band: PriceBand;
  yield_estimate: number;
  investment_score: number;
  risk_level: RiskLevel;
  suburb_score: number;
  name: string;
  price: number;
  priceLabel: string;
  location: string;
  image_url: string;
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

function buildDescription(f: RawFields, suburb: string, houseDesign: string): string {
  const beds = readInt(f, "bedrooms", "Beds");
  const baths = readInt(f, "bathrooms", "Baths");
  const cars = readInt(f, "car_spaces", "car");
  const land = readNumber(f, "land_size", "Land Size");
  const facade = readString(f, "facade", "Facade");
  const parts: string[] = [];
  if (beds || baths || cars) {
    parts.push([beds ? `${beds} bed` : null, baths ? `${baths} bath` : null, cars ? `${cars} car` : null]
      .filter(Boolean)
      .join(" · "));
  }
  if (land !== null && land > 0) parts.push(`${land} m² land`);
  if (facade) parts.push(`${facade} facade`);
  if (parts.length > 0) return parts.join(" · ");
  if (houseDesign && suburb) return `${houseDesign} — ${suburb}`;
  return readString(f, "description", "Description") || "House & land package";
}

/**
 * Single place: map Airtable record.fields → app shape (lowercase schema, no dynamic field names).
 * `PROPERTY_FIELD.name` is the Airtable primary field (Single line text).
 * Supports legacy columns: price, location, image_url, description.
 */
export function mapFieldsToListing(id: string, fields: RawFields): AirtableListing {
  const f = fields;

  let package_price =
    readNumber(f, "package_price", "package price", "Package Price") ??
    readNumber(f, "price", "Price");
  if (package_price === null || !Number.isFinite(package_price) || package_price <= 0) {
    const { numeric } = parsePriceField(f.price ?? f.Price);
    package_price =
      Number.isFinite(numeric) && numeric > 0 && numeric !== Number.POSITIVE_INFINITY ? numeric : 0;
  }

  const suburb =
    readString(f, "suburb", "Suburb") || readString(f, "location", "Location") || "—";
  const estate = readString(f, "estate", "Estate");
  const lot_number = readString(f, "lot_number", "lot number", "Lot") || "—";
  const land_size = readNumber(f, "land_size", "land size", "Land Size") ?? 0;
  const frontage = readNumber(f, "frontage", "Frontage") ?? 0;
  const depth = readNumber(f, "depth", "Depth") ?? 0;
  const land_price = readNumber(f, "land_price", "land price", "Land Price") ?? 0;
  const title_date = readString(f, "title_date", "title date", "Title");
  const house_design = readString(f, "house_design", "house design", "House Design");
  const house_size = readNumber(f, "house_size", "house size", "House Size") ?? 0;
  const build_price = readNumber(f, "build_price", "build price", "Build Price") ?? 0;
  const facade = readString(f, "facade", "Facade");
  const bedrooms = readInt(f, "bedrooms", "beds", "Bedrooms");
  const bathrooms = readInt(f, "bathrooms", "baths", "Bathrooms");
  const car_spaces = readInt(f, "car_spaces", "car spaces", "Car Spaces");
  const status = readString(f, "status", "Status") || "Available";
  const region = readString(f, "region", "Region") || "—";

  const nameFromPrimary = readString(f, PROPERTY_FIELD.name, "Name");
  const houseDesign = house_design;
  const name =
    nameFromPrimary ||
    (houseDesign && lot_number !== "—"
      ? `${houseDesign} · Lot ${lot_number}`
      : houseDesign || `${suburb} ${lot_number !== "—" ? `Lot ${lot_number}` : "Listing"}`);

  const { numeric: priceNum, label: priceLabelRaw } = parsePriceField(f.price ?? f.Price);
  const priceLabel =
    package_price > 0
      ? `$${Math.round(package_price).toLocaleString("en-AU")}`
      : priceLabelRaw;

  const location =
    readString(f, "location", "Location") ||
    (region && region !== "—" ? `${suburb}, ${region}` : suburb);

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

  const description =
    readString(f, "description", "Description").trim() || buildDescription(f, suburb, houseDesign);

  const effectivePrice =
    package_price > 0
      ? package_price
      : Number.isFinite(priceNum) && priceNum > 0 && priceNum !== Number.POSITIVE_INFINITY
        ? priceNum
        : 0;
  const price_band = computePriceBand(effectivePrice || 1);
  const yield_estimate = computeYieldEstimatePercent(effectivePrice || 1);
  const risk_level = computeRiskLevel(title_date, land_size);
  const suburb_scoreRaw = readNumber(f, "suburb_score", "suburb score");
  const suburb_score =
    suburb_scoreRaw !== null && Number.isFinite(suburb_scoreRaw) ? Math.round(suburb_scoreRaw) : 70;

  const investment_score = computeInvestmentScore({
    price_band,
    risk_level,
    yield_percent: yield_estimate
  });

  return {
    id,
    suburb,
    estate,
    lot_number,
    land_size,
    frontage,
    depth,
    land_price,
    title_date,
    house_design,
    house_size,
    build_price,
    facade,
    bedrooms,
    bathrooms,
    car_spaces,
    package_price: effectivePrice,
    status,
    region,
    price_band,
    yield_estimate,
    investment_score,
    risk_level,
    suburb_score,
    name,
    price: effectivePrice,
    priceLabel,
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
    process.env.AIRTABLE_LISTINGS_TABLE_NAME ||
    process.env.AIRTABLE_PROPERTIES_TABLE_NAME ||
    "properties";
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

/**
 * Demo / compare fallback when Airtable is empty — still exposes the full structured shape + computed scores.
 */
export function makeFallbackAirtableListing(input: {
  id: string;
  name: string;
  price: number;
  location: string;
  image_url: string;
  description: string;
  suburb?: string;
  lot_number?: string;
  land_size?: number;
  title_date?: string;
  region?: string;
}): AirtableListing {
  const suburb = (input.suburb ?? input.location.split(",")[0]?.trim()) || "Melbourne";
  const region = input.region ?? "West";
  const lot_number = input.lot_number ?? "—";
  const land_size = input.land_size ?? 350;
  const title_date = input.title_date ?? "Titled";
  const package_price = input.price;
  const price_band = computePriceBand(package_price);
  const yield_estimate = computeYieldEstimatePercent(package_price);
  const risk_level = computeRiskLevel(title_date, land_size);
  const investment_score = computeInvestmentScore({
    price_band,
    risk_level,
    yield_percent: yield_estimate
  });
  return {
    id: input.id,
    suburb,
    estate: "",
    lot_number,
    land_size,
    frontage: 0,
    depth: 0,
    land_price: 0,
    title_date,
    house_design: "",
    house_size: 0,
    build_price: 0,
    facade: "",
    bedrooms: 0,
    bathrooms: 0,
    car_spaces: 0,
    package_price,
    status: "Available",
    region,
    price_band,
    yield_estimate,
    investment_score,
    risk_level,
    suburb_score: 70,
    name: input.name,
    price: package_price,
    priceLabel: `$${Math.round(package_price).toLocaleString("en-AU")}`,
    location: input.location,
    image_url: input.image_url,
    image: input.image_url,
    description: input.description
  };
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
