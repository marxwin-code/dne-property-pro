/**
 * Personality quiz result keys map to distinct local fallbacks so broken remote URLs
 * still feel intentional. Replace files under /public/images with branded art later.
 */
export type PersonalityResultKey = "A" | "B" | "C" | "D";

const DEFAULT_AVATAR = "/images/default-avatar.jpg";

/** Primary local image per profile (Architect / Strategist→investor / Spender→explorer / Drifter). */
export const PERSONALITY_IMAGE_FALLBACK: Record<PersonalityResultKey, string> = {
  A: "/images/architect.jpg",
  B: "/images/investor.jpg",
  C: "/images/explorer.jpg",
  D: DEFAULT_AVATAR
};

/** Use remote URL when valid; otherwise serve the personality-specific default immediately. */
export function resolvePersonalityImageSrc(
  key: PersonalityResultKey,
  remoteUrl: string | undefined | null
): string {
  const t = (remoteUrl ?? "").trim();
  if (!t) return PERSONALITY_IMAGE_FALLBACK[key];
  return t;
}

export function getUltimateFallbackSrc(): string {
  return DEFAULT_AVATAR;
}
