/** Absolute site URL for email links (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://depropertypro.com";
  return raw.replace(/\/$/, "");
}
