/**
 * Property Recommendation Engine — budget from income/savings, filter Properties catalog,
 * fuzzy location match, template-based recommendation copy (no hardcoded listings).
 */
import type { CatalogProperty } from "./airtable-catalog-properties";

export type RecommendInput = {
  income: number;
  savings: number;
  ownership: string;
  /** Target suburb / area for fuzzy match (optional → no location filter). */
  location: string;
  lang?: "en" | "zh";
};

export type RecommendedPropertyOut = {
  id: string;
  name: string;
  price: number;
  location: string;
  image: string;
  description: string;
  reason: {
    why: string;
    suitability: string;
    risk: string;
  };
};

/** Loan capacity = income × 5 (AUD); total purchase budget = savings + loan capacity */
export function computePurchaseBudget(income: number, savings: number): {
  loan_capacity: number;
  budget: number;
} {
  const loan_capacity = Math.max(0, income) * 5;
  const budget = Math.max(0, savings) + loan_capacity;
  return { loan_capacity, budget };
}

export function locationMatchesListing(listingLocation: string, userHint: string): boolean {
  const hint = userHint.trim().toLowerCase();
  if (!hint) return true;
  const loc = listingLocation.trim().toLowerCase();
  if (!loc) return false;
  if (loc.includes(hint)) return true;
  const tokens = hint.split(/[\s,]+/).filter((t) => t.length >= 2);
  return tokens.some((t) => loc.includes(t));
}

function ownershipLower(raw: string): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

export function buildRecommendationReason(
  p: CatalogProperty,
  ctx: RecommendInput & { budget: number }
): RecommendedPropertyOut["reason"] {
  const zh = ctx.lang === "zh";
  const own = ownershipLower(ctx.ownership);
  const headroom = ctx.budget * 1.1 - p.price;
  const tight = headroom < ctx.budget * 0.05;

  const hint = ctx.location.trim();
  const typeNote =
    p.property_type !== null
      ? zh
        ? ` 物业类型：${p.property_type === "house" ? "独立屋" : p.property_type === "apartment" ? "公寓" : "联排别墅"}。`
        : ` Property type: ${p.property_type}.`
      : "";
  const why = zh
    ? hint
      ? `总价约 $${Math.round(p.price).toLocaleString("en-AU")}，在您估算购买力（含 10% 缓冲）内；区位「${p.location}」与意向区域「${hint}」相匹配。${typeNote}`
      : `总价约 $${Math.round(p.price).toLocaleString("en-AU")}，在您估算购买力（含 10% 缓冲）内；区位：${p.location}。${typeNote}`
    : hint
      ? `Listed at ~$${Math.round(p.price).toLocaleString("en-AU")}, within your affordability cap (10% buffer); "${p.location}" aligns with your area filter "${hint}".${typeNote}`
      : `Listed at ~$${Math.round(p.price).toLocaleString("en-AU")}, within your affordability cap (10% buffer); location: ${p.location}.${typeNote}`;

  let suitability: string;
  if (zh) {
    suitability =
      own === "yes" || own === "true"
        ? "已有房产背景下，更适合作为增值型资产配置评估；若自住需复核现金流与利率情景。"
        : "更适合首次置业或自住为主的现金流匹配；若侧重租金回报，请核对该区典型租金与您月供压力。";
  } else {
    suitability =
      own === "yes" || own === "true"
        ? "With existing property exposure, treat this as a portfolio add-on and validate cashflow under higher-rate scenarios."
        : "Suited to owner-occupier entry or balanced yield checks — validate repayments against rental comps if investing.";
  }

  let risk: string;
  if (zh) {
    risk = tight
      ? "价格紧贴预算上限：预留交割费用与缓冲，避免一次性掏空储蓄。"
      : "仍需关注利率上行与服务费；建议在出价前完成贷款预批并复核该区可比成交。";
  } else {
    risk = tight
      ? "Price sits close to your stretch cap — keep settlement costs and a cash buffer separate."
      : "Interest-rate risk and ongoing holding costs still apply; confirm pre-approval before offering.";
  }

  return { why, suitability, risk };
}

export type RecommendEngineResult = {
  budget: number;
  loan_capacity: number;
  recommended_properties: RecommendedPropertyOut[];
  /** User-facing when catalog empty or zero matches */
  fallback_hint: string;
};

/**
 * Filters catalog only — caller must pass rows from Airtable (`fetchCatalogProperties`).
 * Drops listings without a real Image URL from Airtable as required.
 */
export function recommendPropertiesFromCatalog(
  catalog: CatalogProperty[],
  input: RecommendInput
): RecommendEngineResult {
  const lang = input.lang === "zh" ? "zh" : "en";
  const { budget, loan_capacity } = computePurchaseBudget(input.income, input.savings);
  const maxPrice = budget * 1.1;

  let fallback_hint =
    lang === "zh"
      ? "暂无匹配的房源。可提高年收入或存款以增大预算，或放宽目标区域关键词。"
      : "No matching listings. Try increasing income/savings to lift your budget, or broaden your suburb keywords.";

  if (catalog.length === 0) {
    return {
      budget,
      loan_capacity,
      recommended_properties: [],
      fallback_hint
    };
  }

  const filtered = catalog.filter((row) => {
    if (!Number.isFinite(row.price) || row.price <= 0) return false;
    if (row.price > maxPrice) return false;
    if (row.image_kind === "placeholder" || !row.image_url.startsWith("https://")) return false;
    return locationMatchesListing(row.location, input.location);
  });

  filtered.sort((a, b) => a.price - b.price);
  const top = filtered.slice(0, 3);

  const recommended_properties: RecommendedPropertyOut[] = top.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    location: p.location,
    image: p.image_url,
    description: p.description,
    reason: buildRecommendationReason(p, { ...input, lang, budget })
  }));

  if (recommended_properties.length === 0 && catalog.some((c) => c.price > 0 && c.price <= maxPrice)) {
    fallback_hint =
      lang === "zh"
        ? "预算内有房源但被跳过（缺少 Image URL 且未识别 property_type，或未匹配意向区域）。请在 Airtable 填写图片或类型（House / Apartment / Townhouse）。"
        : "Listings exist within budget but were skipped (no Image URL and no property_type, or suburb mismatch). Add an image or property_type in Airtable.";
  }

  return {
    budget,
    loan_capacity,
    recommended_properties,
    fallback_hint
  };
}
