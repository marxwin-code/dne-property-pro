/**
 * Matching listings to budget — business judgement stays in scoring (investment-readiness-v1),
 * not in blocking user input.
 */
import type { Lang } from "@/lib/i18n/text";
import type { AirtableListing } from "@/lib/airtable";
import type { LeadLevel } from "@/lib/lead-engine";
import { computeInvestmentReadinessV1 } from "@/lib/investment-readiness-v1";

export type { LeadLevel };

/** max_budget = savings × 5 + income × 3 */
export function computeMaxBudget(savings: number, income: number): number {
  return savings * 5 + income * 3;
}

function locationTokensMatch(listLocation: string, hint: string): boolean {
  const h = hint.trim().toLowerCase();
  if (!h) return false;
  const loc = listLocation.toLowerCase();
  if (loc.includes(h)) return true;
  const words = h.split(/[\s,]+/).filter((w) => w.length >= 3);
  return words.some((w) => loc.includes(w));
}

/** True if user hint aligns with at least one listing location (market relevance). */
export function hasLocationIntentMatch(listings: AirtableListing[], locationHint: string): boolean {
  const hint = locationHint.trim();
  if (!hint) return false;
  return listings.some((l) => locationTokensMatch(l.location, hint));
}

/**
 * @deprecated Prefer `computeInvestmentReadinessV1` from `@/lib/investment-readiness-v1`.
 * Kept for callers that still pass legacy arguments; score is overall_score only (listing match ignored for the numeric model).
 */
export function computeAiLeadScore(
  income: number,
  savings: number,
  _hasProperty: "Yes" | "No",
  _listings: AirtableListing[],
  _locationHint: string | undefined
): number {
  return computeInvestmentReadinessV1({ income, savings, debt: 0 }).overall_score;
}

export function matchTopProperties(
  listings: AirtableListing[],
  income: number,
  savings: number,
  locationHint: string | undefined,
  limit = 3
): AirtableListing[] {
  const maxBudget = computeMaxBudget(savings, income);
  const hint = locationHint?.trim() ?? "";

  const finite = listings.filter((l) => Number.isFinite(l.price) && l.price > 0);

  function tier(l: AirtableListing): number {
    if (!hint) return 0;
    const loc = l.location.toLowerCase();
    const h = hint.toLowerCase();
    if (loc.includes(h) || h.includes(loc.slice(0, Math.min(12, loc.length)))) return 3;
    if (locationTokensMatch(l.location, hint)) return 2;
    const hl = hint.split(/[\s,]+/).find((x) => x.length >= 4);
    if (hl && loc.includes(hl.toLowerCase())) return 1;
    return 0;
  }

  let pool = finite.filter((l) => l.price <= maxBudget);

  if (pool.length === 0) {
    pool = [...finite].sort(
      (a, b) => Math.abs(a.price - maxBudget) - Math.abs(b.price - maxBudget)
    );
    return pool.slice(0, limit);
  }

  pool.sort((a, b) => {
    const ta = tier(a);
    const tb = tier(b);
    if (tb !== ta) return tb - ta;
    return Math.abs(a.price - maxBudget) - Math.abs(b.price - maxBudget);
  });

  return pool.slice(0, limit);
}

const PITCH: Record<LeadLevel, { en: string; zh: string }> = {
  Cold: {
    en: "We recommend building savings and borrowing capacity before entering the market — timing is not ideal yet.",
    zh: "当前不建议立即购房，建议提升储蓄能力和贷款能力。"
  },
  Warm: {
    en: "You are approaching purchase readiness — consider entry-level properties aligned with your budget.",
    zh: "已经接近购房条件，建议优先考虑入门型房产。"
  },
  Hot: {
    en: "You are well positioned to invest — we recommend scheduling viewings and professional advice promptly.",
    zh: "已具备投资能力，建议立即安排看房和专业咨询。"
  }
};

export function getSalesPitch(level: LeadLevel, lang: Lang): string {
  return lang === "zh" ? PITCH[level].zh : PITCH[level].en;
}

/** Short lines referencing matched listings (for email / UI). */
export function buildListingPitchLines(
  properties: Array<{ location: string; priceLabel: string }>,
  lang: Lang
): string {
  if (properties.length === 0) return "";
  return properties
    .map((p) =>
      lang === "zh"
        ? `• ${p.location} · ${p.priceLabel}`
        : `• ${p.location} — ${p.priceLabel}`
    )
    .join("\n");
}

export function buildAiSalesAdvice(
  level: LeadLevel,
  properties: Array<{ location: string; priceLabel: string }>,
  lang: Lang
): string {
  const pitch = getSalesPitch(level, lang);
  const lines = buildListingPitchLines(properties, lang);
  return lines ? `${pitch}\n\n${lines}` : pitch;
}
