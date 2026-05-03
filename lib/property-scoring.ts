/**
 * Property AI fields — computed on the server only (not Airtable formulas).
 * Field names in API payloads are lowercase snake_case (structured, no dynamic keys).
 */

export type PriceBand = "Low" | "Mid" | "High";
export type RiskLevel = "Low" | "Medium" | "High";

/** Assumed weekly rent for yield_estimate (AUD). */
export const DEFAULT_WEEKLY_RENT_AUD = 500;

/** package_price &lt; 700k → Low; 700k–800k → Mid; ≥800k → High */
export function computePriceBand(packagePriceAud: number): PriceBand {
  if (!Number.isFinite(packagePriceAud) || packagePriceAud <= 0) return "Mid";
  if (packagePriceAud < 700_000) return "Low";
  if (packagePriceAud < 800_000) return "Mid";
  return "High";
}

/** Annual yield as percentage: (weekly_rent * 52 / package_price) * 100 */
export function computeYieldEstimatePercent(
  packagePriceAud: number,
  weeklyRentAud: number = DEFAULT_WEEKLY_RENT_AUD
): number {
  if (!Number.isFinite(packagePriceAud) || packagePriceAud <= 0) return 0;
  return (weeklyRentAud * 52 * 100) / packagePriceAud;
}

/** title_date contains "2027" → High; else land_size &lt; 300 → Medium; else Low */
export function computeRiskLevel(titleDate: string, landSizeSqm: number): RiskLevel {
  const td = (titleDate ?? "").trim();
  if (td.includes("2027")) return "High";
  if (Number.isFinite(landSizeSqm) && landSizeSqm > 0 && landSizeSqm < 300) return "Medium";
  return "Low";
}

export type InvestmentScoreInput = {
  price_band: PriceBand;
  risk_level: RiskLevel;
  /** Percentage, e.g. 3.56 for 3.56% */
  yield_percent: number;
};

/**
 * Base 100; deductions: High risk −30, Medium −15, High price band −20, yield &lt; 3.5% −15.
 * Clamped to 0–100.
 */
export function computeInvestmentScore(input: InvestmentScoreInput): number {
  let score = 100;
  if (input.risk_level === "High") score -= 30;
  else if (input.risk_level === "Medium") score -= 15;
  if (input.price_band === "High") score -= 20;
  if (input.yield_percent < 3.5) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}
