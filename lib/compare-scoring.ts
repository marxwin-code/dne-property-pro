import type { Lang } from "./i18n/home-hero";

export type IntentLevel = "high" | "medium" | "low";

/** Weighted score: income 40%, savings 40%, existing property 20% (0–100). */
export function computeDealScore(
  income: number,
  savings: number,
  hasProperty: "Yes" | "No"
): number {
  const incomePart = Math.min(40, (income / 150_000) * 40);
  const savingsPart = Math.min(40, (savings / 200_000) * 40);
  const propertyPart = hasProperty === "Yes" ? 20 : 0;
  return Math.max(0, Math.min(100, Math.round(incomePart + savingsPart + propertyPart)));
}

export function getIntentLevel(score: number): IntentLevel {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

const SALES_COPY: Record<IntentLevel, { en: string; zh: string }> = {
  high: {
    en: "You are in a strong position to buy — this is a favourable time to enter the market with confidence.",
    zh: "你已经具备购房条件，现在是非常好的入场时机。"
  },
  medium: {
    en: "With a small optimisation of your deposit or borrowing structure, you can unlock higher-quality property options.",
    zh: "再优化一下资金结构，可以进入更好的房产区间。"
  },
  low: {
    en: "We recommend strengthening savings or income first — a steadier foundation improves long-term outcomes.",
    zh: "建议先提升存款或收入，再进入市场更稳。"
  }
};

export function getSalesScript(intent: IntentLevel, lang: Lang = "en"): string {
  return lang === "zh" ? SALES_COPY[intent].zh : SALES_COPY[intent].en;
}

/** Rough AUD purchase ceiling for comparing listing prices (conservative heuristic). */
export function estimateMaxPurchasePrice(income: number, savings: number): number {
  const fromDeposit = savings > 0 ? savings / 0.15 : 0;
  const fromServiceability = income * 5.5;
  return Math.max(400_000, Math.floor(Math.min(fromDeposit, fromServiceability) || fromServiceability));
}
