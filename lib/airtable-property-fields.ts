/**
 * Airtable `properties` table — canonical field names (lowercase, match Base schema).
 * `name` is the Airtable primary field (Single line text).
 * Base: "Property Database" · Table: `properties` (override via env).
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
  /** Optional in Base; app may still read if present */
  image_url: "image_url",
  description: "description",
  /** Optional stored AI columns (app recomputes in `lib/property-scoring.ts` if useful) */
  price_band: "price_band",
  yield_estimate: "yield_estimate",
  investment_score: "investment_score",
  risk_level: "risk_level",
  suburb_score: "suburb_score",
  /** Legacy / migration */
  estate: "estate",
  price: "price",
  location: "location"
} as const;

export type PropertyFieldKey = (typeof PROPERTY_FIELD)[keyof typeof PROPERTY_FIELD];
