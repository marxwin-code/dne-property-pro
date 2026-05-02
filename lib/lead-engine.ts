import type { Lang } from "./i18n/home-hero";
import type { AirtableListing } from "./airtable";

/** Lead score 0–100: additive rules, capped at 100. */
export function computeLeadScore(
  age: number,
  income: number,
  savings: number,
  propertyOwnership: "Yes" | "No"
): number {
  let score = 0;
  if (savings > 80_000) score += 30;
  if (income > 100_000) score += 30;
  if (propertyOwnership === "No") score += 20;
  if (age >= 28 && age <= 45) score += 20;
  return Math.min(100, score);
}

export type LeadLevel = "Hot" | "Warm" | "Cold";

export function getLeadLevel(score: number): LeadLevel {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

const LEVEL_NARRATIVE: Record<
  LeadLevel,
  { en: string; zh: string }
> = {
  Hot: {
    en: "Based on your financial position, you are in a strong position to secure a property now. This opportunity aligns well with your budget and long-term growth.",
    zh: "依据您的财务状况，您已具备较强的入市条件；该机会与您的预算及长期成长预期较为契合。"
  },
  Warm: {
    en: "You are close to entering the property market. With a small adjustment in savings or strategy, this property could become achievable.",
    zh: "您已接近进入市场；在存款或策略上稍作调整，下列房源将更可达成。"
  },
  Cold: {
    en: "At your current stage, we recommend focusing on improving your deposit and borrowing capacity before targeting this property.",
    zh: "以现阶段而言，建议优先提升首付与还款能力，再锁定此类房源。"
  }
};

export function buildSalesAdvice(
  level: LeadLevel,
  properties: Array<{ location: string; priceLabel: string }>,
  lang: Lang
): string {
  const base = lang === "zh" ? LEVEL_NARRATIVE[level].zh : LEVEL_NARRATIVE[level].en;
  const lines = properties.map((p) =>
    lang === "zh"
      ? `${p.location} 区域、标价 ${p.priceLabel} 的房源与您的画像匹配度较高。`
      : `This property in ${p.location} priced at ${p.priceLabel} is a strong match for your profile.`
  );
  return [base, ...lines].join("\n\n");
}

/** budget = savings * 5; filter price <= budget; sort by same-city match then closest price to budget. */
export function recommendPropertiesForBudget(
  listings: AirtableListing[],
  savings: number,
  cityHint: string | undefined,
  limit = 3
): AirtableListing[] {
  const budget = savings * 5;
  const hint = cityHint?.trim().toLowerCase() || "";

  const finite = listings.filter((l) => Number.isFinite(l.price) && l.price > 0);

  function sameCity(l: AirtableListing): boolean {
    if (!hint) return false;
    const loc = l.location.toLowerCase();
    if (loc.includes(hint)) return true;
    return hint
      .split(/[\s,]+/)
      .some((w) => w.length >= 3 && loc.includes(w));
  }

  let pool = finite.filter((l) => l.price <= budget);

  if (pool.length === 0) {
    pool = [...finite].sort(
      (a, b) => Math.abs(a.price - budget) - Math.abs(b.price - budget)
    );
    return pool.slice(0, limit);
  }

  pool.sort((a, b) => {
    const ca = sameCity(a) ? 1 : 0;
    const cb = sameCity(b) ? 1 : 0;
    if (ca !== cb) return cb - ca;
    return Math.abs(a.price - budget) - Math.abs(b.price - budget);
  });

  return pool.slice(0, limit);
}
