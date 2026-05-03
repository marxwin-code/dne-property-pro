/**
 * Airtable `properties` / `properties_v2` — canonical field names (lowercase).
 * `name` is the primary field (Single line text).
 * Override table via env · default listings table is `properties_v2`.
 * Do not construct field keys dynamically; import these identifiers only.
 */
export const PROPERTY_FIELD = {
  /** Primary field (Airtable record title) */
  name: "name",
  suburb: "suburb",
  lot_number: "lot_number",
  land_size: "land_size",
  frontage: "frontage",
  depth: "depth",
  land_price: "land_price",
  title_date: "title_date",
  house_design: "house_design",
  house_size: "house_size",
  build_price: "build_price",
  facade: "facade",
  bedrooms: "bedrooms",
  bathrooms: "bathrooms",
  car_spaces: "car_spaces",
  package_price: "package_price",
  status: "status",
  region: "region",
  image_url: "image_url",
  description: "description",
  /** Optional stored columns (legacy / overlap with v2) */
  yield_estimate: "yield_estimate",
  suburb_score: "suburb_score",
  estate: "estate",
  location: "location"
} as const;

/** Extended metrics on table `properties_v2` (and compatible bases). */
export const PROPERTY_V2_FIELD = {
  /** Listing / valuation price (distinct from `package_price` when both exist) */
  price: "price",
  weekly_rent: "weekly_rent",
  investment_score: "investment_score",
  yield_percent: "yield_percent",
  /** Single select: cheap | fair | expensive */
  price_band: "price_band",
  growth_score: "growth_score",
  /** Single select: low | medium | high */
  risk_level: "risk_level",
  distance_to_cbd: "distance_to_cbd",
  school_score: "school_score",
  crime_rate: "crime_rate",
  image_url: "image_url"
} as const;

export type PropertyFieldKey = (typeof PROPERTY_FIELD)[keyof typeof PROPERTY_FIELD];
export type PropertyV2FieldKey = (typeof PROPERTY_V2_FIELD)[keyof typeof PROPERTY_V2_FIELD];
