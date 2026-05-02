/**
 * Risk Scoring Model — property + buyer financial profile.
 * Components (fixed caps): Legal 20, Financial 25, Building 20, OC 20, Market 15 → total capped 100.
 */

export type PropertyType = "house" | "apartment";
export type BuildingCondition = "good" | "average" | "bad";
export type RiskLevelLabel = "High" | "Medium" | "Low";

/** Required inputs per product spec */
export type RiskScoreInput = {
  price: number;
  income: number;
  savings: number;
  propertyType: PropertyType;
  hasOC: boolean;
  /** Annual OC fees in AUD */
  OC_fee: number;
  specialLevy: boolean;
  buildingCondition: BuildingCondition;
  /** Suburb / location label (for future use & tracing) */
  location: string;
  suburbMedianPrice: number;
  /** Percentage e.g. 4.5 = 4.5% */
  rentalYield: number;
  /** Legal flags — default false if omitted */
  hasEasement?: boolean;
  hasCovenant?: boolean;
  /** When true, contributes +10 to legal bucket */
  zoningRisk?: boolean;
  /** When true and hasOC, contributes +5 */
  OC_reserve_low?: boolean;
};

export type RiskScoreBreakdown = {
  financial: number;
  legal: number;
  building: number;
  oc: number;
  market: number;
};

export type RiskScoreOutput = {
  riskScore: number;
  riskLevel: RiskLevelLabel;
  breakdown: RiskScoreBreakdown;
  summary: string;
  recommendations: string[];
};

const CAP = {
  legal: 20,
  financial: 25,
  building: 20,
  oc: 20,
  market: 15
} as const;

const LEVEL_SUMMARY: Record<RiskLevelLabel, string> = {
  High:
    "You are entering this purchase with elevated financial and structural risk. Careful review and strategy adjustment are strongly recommended.",
  Medium:
    "This property presents moderate risk. With proper planning and due diligence, it can still be a viable investment.",
  Low: "This is a relatively stable purchase with manageable risk based on your financial and property profile."
};

function clamp(n: number, max: number): number {
  return Math.min(Math.max(0, n), max);
}

function computeFinancial(price: number, income: number, savings: number): number {
  let score = 0;
  if (price > 0) {
    const lvr = (price - savings) / price;
    if (lvr > 0.9) score += 25;
    else if (lvr > 0.8) score += 20;
    else if (lvr > 0.7) score += 15;
    else score += 5;
  } else {
    score += 25;
  }

  const dti = income > 0 ? price / income : Number.POSITIVE_INFINITY;
  if (dti > 8) score += 10;
  else if (dti > 6) score += 5;

  return clamp(score, CAP.financial);
}

function computeLegal(input: RiskScoreInput): number {
  let score = 0;
  if (input.hasEasement) score += 5;
  if (input.hasCovenant) score += 5;
  if (input.zoningRisk) score += 10;
  return clamp(score, CAP.legal);
}

function computeBuilding(condition: BuildingCondition): number {
  if (condition === "bad") return 20;
  if (condition === "average") return 10;
  return 5;
}

function computeOC(input: RiskScoreInput): number {
  if (!input.hasOC) return 0;
  let score = 0;
  if (input.specialLevy) score += 15;
  if (input.OC_fee > 5000) score += 5;
  if (input.OC_reserve_low) score += 5;
  return clamp(score, CAP.oc);
}

function computeMarket(
  price: number,
  suburbMedianPrice: number,
  rentalYield: number
): number {
  let score = 0;
  if (suburbMedianPrice > 0 && price > suburbMedianPrice) score += 10;
  if (rentalYield < 3) score += 5;
  return clamp(score, CAP.market);
}

function riskLevelFromScore(total: number): RiskLevelLabel {
  if (total >= 70) return "High";
  if (total >= 40) return "Medium";
  return "Low";
}

function financialExplanation(
  price: number,
  income: number,
  savings: number,
  financialScore: number
): string {
  const parts: string[] = [];
  if (price > 0) {
    const lvr = (price - savings) / price;
    if (lvr > 0.9)
      parts.push(
        "Loan-to-value is very high relative to your deposit, which increases repayment stress and lender risk."
      );
    else if (lvr > 0.8)
      parts.push("Borrowing against most of the purchase price leaves limited buffer if rates or circumstances change.");
    else if (lvr > 0.7)
      parts.push("Deposit covers a moderate share of price; borrowing remains material.");
    else parts.push("Your deposit materially reduces borrowed funds, which lowers leverage-related stress.");
  }
  const dti = income > 0 ? price / income : Infinity;
  if (dti > 8)
    parts.push("Purchase price is elevated versus stated income, stretching typical debt-to-income comfort.");
  else if (dti > 6)
    parts.push("Price relative to income is toward the upper end of common comfort bands.");
  else if (income > 0)
    parts.push("Price versus income sits in a more conservative range for this assessment.");

  if (parts.length === 0)
    return `Financial risk score ${financialScore}/25 based on LVR and price-to-income alignment.`;
  return parts.join(" ");
}

function buildingExplanation(condition: BuildingCondition): string {
  if (condition === "bad")
    return "Building condition is assessed as weak — higher immediate capital or maintenance exposure is assumed.";
  if (condition === "average")
    return "Building condition is middling — budget for repairs or upgrades within a typical due diligence window.";
  return "Building condition reads as sound, reducing near-term structural spend risk in this model.";
}

function marketExplanation(
  price: number,
  suburbMedianPrice: number,
  rentalYield: number,
  marketScore: number
): string {
  const parts: string[] = [];
  if (suburbMedianPrice > 0 && price > suburbMedianPrice)
    parts.push("Entry price sits above the suburb median, implying a valuation or amenity premium versus typical stock.");
  else if (suburbMedianPrice > 0)
    parts.push("Price is at or below the suburb median reference, which can support liquidity expectations.");

  if (rentalYield < 3)
    parts.push("Indicated rental yield is below 3%, so income return may rely more on capital growth than cash flow.");
  else parts.push("Rental yield is at or above the 3% threshold used in this screen, which supports income return.");

  if (parts.length === 0) return `Market risk score ${marketScore}/15 from price positioning and yield.`;
  return parts.join(" ");
}

function nextStepRecommendations(level: RiskLevelLabel, breakdown: RiskScoreBreakdown): string[] {
  const out: string[] = [];
  if (breakdown.financial >= 18)
    out.push("Confirm borrowing capacity and comfortable repayments with a mortgage broker before committing.");
  if (breakdown.legal >= 10)
    out.push("Have your conveyancer review title, easements, covenants, and zoning against your intended use.");
  if (breakdown.building >= 15)
    out.push("Commission a qualified building and pest inspection and budget for identified defects.");
  if (breakdown.oc >= 12)
    out.push("Request recent AGM minutes, sinking fund / maintenance plans, and clarify any special levies.");
  if (breakdown.market >= 10)
    out.push("Benchmark recent comparable sales and rents to validate price and yield assumptions.");

  if (level === "High") {
    out.push("Consider narrowing price range or increasing deposit to bring LVR and overall exposure down.");
  } else if (level === "Medium") {
    out.push("Proceed with structured due diligence and keep a contingency reserve for rates and repairs.");
  } else {
    out.push("Maintain routine monitoring of rates, OC fees (if applicable), and market rents.");
  }

  return [...new Set(out)].slice(0, 6);
}

/**
 * Compute composite risk score and structured output for UI / API.
 */
export function computeRiskScore(input: RiskScoreInput): RiskScoreOutput {
  const hasEasement = input.hasEasement ?? false;
  const hasCovenant = input.hasCovenant ?? false;
  const zoningRisk = input.zoningRisk ?? false;
  const OC_reserve_low = input.OC_reserve_low ?? false;

  const normalized: RiskScoreInput = {
    ...input,
    hasEasement,
    hasCovenant,
    zoningRisk,
    OC_reserve_low
  };

  const financial = computeFinancial(input.price, input.income, input.savings);
  const legal = computeLegal(normalized);
  const building = computeBuilding(input.buildingCondition);
  const oc = computeOC(normalized);
  const market = computeMarket(input.price, input.suburbMedianPrice, input.rentalYield);

  const rawTotal = financial + legal + building + oc + market;
  const riskScore = clamp(rawTotal, 100);
  const riskLevel = riskLevelFromScore(riskScore);

  const breakdown: RiskScoreBreakdown = {
    financial,
    legal,
    building,
    oc,
    market
  };

  const finExpl = financialExplanation(input.price, input.income, input.savings, financial);
  const bldExpl = buildingExplanation(input.buildingCondition);
  const mktExpl = marketExplanation(
    input.price,
    input.suburbMedianPrice,
    input.rentalYield,
    market
  );

  const coreThree = [finExpl, bldExpl, mktExpl];
  const steps = nextStepRecommendations(riskLevel, breakdown);

  return {
    riskScore,
    riskLevel,
    breakdown,
    summary: LEVEL_SUMMARY[riskLevel],
    recommendations: [...coreThree, ...steps]
  };
}
