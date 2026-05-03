/**
 * Maps property type → search phrases, builds Unsplash Source–style image URLs
 * (comma-separated keywords in query). Pair with `property_type` on Airtable when Image URL is empty.
 */

const TYPE_KEYWORDS = {
  house: "modern house exterior australia",
  apartment: "apartment building australia",
  townhouse: "townhouse australia"
} as const;

export type NormalizedPropertyType = keyof typeof TYPE_KEYWORDS;

export function normalizePropertyType(raw: string | undefined | null): NormalizedPropertyType | null {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return null;
  if (/\b(apartment|apt)\b/i.test(s)) return "apartment";
  if (/town\s*house|townhouse/.test(s)) return "townhouse";
  if (/\b(house|home|detached|villa)\b/i.test(s)) return "house";
  return null;
}

/**
 * Concatenate Unsplash Source URL: width/height + comma-joined tokens from the keyword phrase.
 * @see https://source.unsplash.com/ (community pattern; use `images.unsplash.com` in next.config for hotlinking)
 */
export function buildUnsplashUrlForPropertyType(type: NormalizedPropertyType): string {
  const phrase = TYPE_KEYWORDS[type];
  const commaKeywords = phrase.split(/\s+/).join(",");
  return `https://source.unsplash.com/1200/675/?${commaKeywords}`;
}
