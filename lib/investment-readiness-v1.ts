/**
 * Investment Readiness & Risk Scoring (V1)
 *
 * PRINCIPLES (product):
 * - Do not block user input based on business rules.
 * - All business evaluation must happen in the scoring system.
 * - Input stage: collect numbers only (technical validation: positive where required).
 * - Scoring stage: all "can you afford / what goes wrong" judgements live here.
 *
 * risk_score in this model = "safety" (higher = lower financial risk), per spec.
 * overall_score combines affordability and risk into one 0–100 readout.
 */

export type InvestmentReadinessInput = {
  /** Annual pre-tax income (AUD) — must be > 0 at API boundary. */
  income: number;
  /** Savings / deposit (AUD) — may be 0. */
  savings: number;
  /** Total debt (AUD) — optional, default 0. */
  debt?: number;
};

export type RiskLevelV1 = "low" | "medium" | "high";

export type InvestmentReadinessV1 = {
  monthly_income: number;
  borrowing_power: number;
  max_property_price: number;
  affordable_price: number;
  affordability_score: number;
  /** Higher = safer (lower personal financial risk). */
  risk_safety_score: number;
  overall_score: number;
  risk_level: RiskLevelV1;
  /** Short bullet lines for report (EN). */
  low_score_reasons_en: string[];
  high_score_reasons_en: string[];
  /** Short bullet lines for report (ZH). */
  low_score_reasons_zh: string[];
  high_score_reasons_zh: string[];
};

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Full V1 pipeline: intermediate values + three scores + risk band + explanations.
 */
export function computeInvestmentReadinessV1(input: InvestmentReadinessInput): InvestmentReadinessV1 {
  const income = input.income;
  const savings = Math.max(0, input.savings);
  const debt = Math.max(0, input.debt ?? 0);

  const monthly_income = income / 12;
  const borrowing_power = income * 5;
  const max_property_price = savings / 0.2;
  const affordable_price = Math.min(borrowing_power, max_property_price);

  const score_income = clamp01(income / 200_000) * 40;
  const score_savings = clamp01(savings / 200_000) * 40;
  const score_balance = clamp01(affordable_price / 800_000) * 20;
  const affordability_score = round2(
    Math.min(100, score_income + score_savings + score_balance)
  );

  const debt_ratio = income > 0 ? debt / income : 0;
  const monthly_expense = monthly_income * 0.6;
  const emergency_months = monthly_expense > 0 ? savings / monthly_expense : 0;

  const score_debt = (1 - clamp01(debt_ratio)) * 40;
  const score_emergency = clamp01(emergency_months / 6) * 30;
  const score_buffer = clamp01(savings / 100_000) * 30;
  const risk_safety_score = round2(
    Math.min(100, score_debt + score_emergency + score_buffer)
  );

  const overall_score = round2(affordability_score * 0.6 + risk_safety_score * 0.4);

  let risk_level: RiskLevelV1;
  if (overall_score >= 75) risk_level = "low";
  else if (overall_score >= 50) risk_level = "medium";
  else risk_level = "high";

  const low_score_reasons_en: string[] = [];
  const low_score_reasons_zh: string[] = [];
  const high_score_reasons_en: string[] = [];
  const high_score_reasons_zh: string[] = [];

  if (income < 80_000) {
    low_score_reasons_en.push("Income is on the lower side versus typical purchase targets.");
    low_score_reasons_zh.push("相对购房目标而言，收入偏低。");
  }
  if (savings < 40_000) {
    low_score_reasons_en.push("Savings buffer is limited.");
    low_score_reasons_zh.push("存款缓冲有限。");
  }
  if (debt_ratio > 0.25) {
    low_score_reasons_en.push("Debt relative to income is elevated.");
    low_score_reasons_zh.push("负债相对收入偏高。");
  }
  if (emergency_months < 3) {
    low_score_reasons_en.push("Emergency runway (months of expenses covered) is thin.");
    low_score_reasons_zh.push("应急资金覆盖月数不足。");
  }

  if (income >= 120_000) {
    high_score_reasons_en.push("Income supports stronger borrowing capacity.");
    high_score_reasons_zh.push("收入支撑更强的借贷空间。");
  }
  if (savings >= 80_000) {
    high_score_reasons_en.push("Savings position is solid.");
    high_score_reasons_zh.push("存款较为充足。");
  }
  if (debt_ratio <= 0.15 && debt > 0) {
    high_score_reasons_en.push("Debt is controlled relative to income.");
    high_score_reasons_zh.push("负债相对收入可控。");
  }
  if (emergency_months >= 4) {
    high_score_reasons_en.push("Good emergency buffer versus typical expenses.");
    high_score_reasons_zh.push("应急资金相对支出较为充裕。");
  }
  if (overall_score >= 70 && low_score_reasons_en.length === 0) {
    high_score_reasons_en.push("Overall balance between income, savings, and debt is healthy.");
    high_score_reasons_zh.push("收入、存款与负债整体平衡较好。");
  }

  return {
    monthly_income,
    borrowing_power,
    max_property_price,
    affordable_price,
    affordability_score,
    risk_safety_score,
    overall_score,
    risk_level,
    low_score_reasons_en,
    low_score_reasons_zh,
    high_score_reasons_en,
    high_score_reasons_zh
  };
}

/** Band label for UI — derived from affordability_score only (not a gate). */
export function affordabilityScoreToBand(score: number): "Low" | "Medium" | "High" {
  if (score < 35) return "Low";
  if (score < 70) return "Medium";
  return "High";
}
