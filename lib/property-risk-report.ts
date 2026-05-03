/**
 * Property Risk Report Engine — safety score from 100 downward (higher = safer purchase).
 * Separate from lib/risk-scoring.ts (different product / formula).
 *
 * Do not block user input based on business rules. Income/savings are validated only as
 * positive numbers where required; affordability and risk are computed inside this module.
 */

export type AxisRisk = "Low" | "Medium" | "High";

export type PropertyRiskReportInput = {
  income: number;
  savings: number;
  /** Reserved for future rules (e.g. equity treatment) */
  ownership?: boolean | string;
  /** User-preferred area / suburb text */
  location: string;
  property: {
    price: number;
    location: string;
    type: string;
  };
};

export type RiskBreakdown = {
  financial: AxisRisk;
  cashflow: AxisRisk;
  location: AxisRisk;
  property: AxisRisk;
  liquidity: AxisRisk;
};

export type AggregateRiskLabel = "Low Risk" | "Medium Risk" | "High Risk";

export type PropertyRiskReportResult = {
  risk_score: number;
  risk_level: AggregateRiskLabel;
  risk_breakdown: RiskBreakdown;
  ai_summary: string;
  ai_summary_en: string;
  recommendation: string;
  recommendation_en: string;
};

export type PropertyRiskEngineOptions = {
  /** Annual interest rate, e.g. 0.065 */
  interestRate: number;
  loanYears: number;
  /** AUD — above this counts as "high price" for liquidity */
  highPriceThreshold: number;
  /** Lowercase substrings that indicate a relatively liquid / core market */
  coreLocationHints: string[];
};

const DEFAULT_CORE_HINTS = [
  "cbd",
  "melbourne",
  "sydney",
  "docklands",
  "southbank",
  "parramatta",
  "chatswood",
  "st kilda",
  "richmond",
  "carlton",
  "fitzroy",
  "hawthorn",
  "camberwell",
  "toorak",
  "bondi",
  "manly",
  "north sydney"
];

function clampScore(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Standard principal & interest monthly repayment (AUD). */
export function monthlyRepaymentPAndI(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  if (r <= 0) return principal / n;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

function normalizeLoc(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .trim();
}

/** Tokens for overlap (Latin + CJK runs). */
function locationTokens(s: string): Set<string> {
  const n = normalizeLoc(s);
  const set = new Set<string>();
  for (const w of n.split(/\s+/).filter(Boolean)) {
    if (w.length >= 2) set.add(w);
  }
  // Chinese: treat consecutive chars as optional bigrams not needed — substring overlap via includes
  return set;
}

function locationMismatchMedium(userLoc: string, propertyLoc: string): boolean {
  const u = normalizeLoc(userLoc);
  const p = normalizeLoc(propertyLoc);
  if (!u.length || !p.length) return true;
  if (p.includes(u) || u.includes(p)) return false;
  const tu = locationTokens(userLoc);
  const tp = locationTokens(propertyLoc);
  for (const t of tu) {
    if (t.length >= 3 && p.includes(t)) return false;
    if (tp.has(t)) return false;
  }
  for (const t of tp) {
    if (t.length >= 3 && u.includes(t)) return false;
  }
  return true;
}

function isCoreArea(propertyLoc: string, hints: string[]): boolean {
  const p = normalizeLoc(propertyLoc);
  return hints.some((h) => h.length >= 2 && p.includes(h.toLowerCase()));
}

function assessFinancial(
  price: number,
  income: number,
  savings: number
): AxisRisk {
  const capacity = income * 5 + savings * 2;
  if (capacity <= 0) return price > 0 ? "High" : "Low";
  if (price > capacity) return "High";
  if (price > capacity * 0.7) return "Medium";
  return "Low";
}

function assessCashflow(
  price: number,
  income: number,
  savings: number,
  opts: PropertyRiskEngineOptions
): AxisRisk {
  const annualIncome = income;
  if (annualIncome <= 0) return "High";
  const monthlyIncome = annualIncome / 12;
  const maxDeposit = Math.min(savings, price * 0.2);
  const loan = Math.max(0, price - maxDeposit);
  const monthly = monthlyRepaymentPAndI(loan, opts.interestRate, opts.loanYears);
  const ratio = monthly / monthlyIncome;
  if (ratio > 0.4) return "High";
  if (ratio > 0.3) return "Medium";
  return "Low";
}

function assessLocation(userLoc: string, propertyLoc: string): AxisRisk {
  return locationMismatchMedium(userLoc, propertyLoc) ? "Medium" : "Low";
}

function assessPropertyType(typeRaw: string): AxisRisk {
  const t = typeRaw.trim().toLowerCase();
  if (t === "house" || t.includes("house")) return "Low";
  if (t === "apartment" || t.includes("apartment") || t.includes("unit")) return "Medium";
  return "Medium";
}

function assessLiquidity(
  price: number,
  propertyLoc: string,
  opts: PropertyRiskEngineOptions
): AxisRisk {
  const core = isCoreArea(propertyLoc, opts.coreLocationHints);
  const T = opts.highPriceThreshold;
  // High price in a non-core area → harder exit = High liquidity risk
  if (price > T && !core) return "High";
  // Stretched outer-suburb listing, or very expensive but core (still some liquidity drag)
  if (!core && price > T * 0.65 && price <= T) return "Medium";
  if (price > T && core) return "Medium";
  return "Low";
}

function axisDeduction(axis: AxisRisk, high: number, medium: number): number {
  if (axis === "High") return high;
  if (axis === "Medium") return medium;
  return 0;
}

function aggregateLabel(score: number): AggregateRiskLabel {
  if (score >= 80) return "Low Risk";
  if (score >= 50) return "Medium Risk";
  return "High Risk";
}

const AI_ZH: Record<AggregateRiskLabel, string> = {
  "High Risk": "该房产存在较高财务压力及流动性风险，不建议当前购买",
  "Medium Risk": "该房产整体可行，但需优化资金结构或选择更优区域",
  "Low Risk": "该房产风险较低，适合作为当前投资选择"
};

const AI_EN: Record<AggregateRiskLabel, string> = {
  "High Risk":
    "This property carries elevated financial pressure and liquidity risk; purchasing now is not recommended.",
  "Medium Risk":
    "This property is broadly workable, but you should improve your funding mix or consider a stronger location.",
  "Low Risk": "Overall risk is comparatively low; this property fits well as a current investment choice."
};

const REC_ZH: Record<AggregateRiskLabel, string> = {
  "High Risk": "不建议",
  "Medium Risk": "观望",
  "Low Risk": "可以买"
};

const REC_EN: Record<AggregateRiskLabel, string> = {
  "High Risk": "Do not buy",
  "Medium Risk": "Wait and reassess",
  "Low Risk": "Proceed"
};

export function defaultEngineOptionsFromEnv(): PropertyRiskEngineOptions {
  const rate = Number(process.env.RISK_REPORT_INTEREST_RATE ?? "0.065");
  const years = Number(process.env.RISK_REPORT_LOAN_YEARS ?? "30");
  const highPrice = Number(process.env.RISK_REPORT_HIGH_PRICE_THRESHOLD ?? "1500000");
  const extra = (process.env.RISK_REPORT_CORE_KEYWORDS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return {
    interestRate: Number.isFinite(rate) && rate > 0 ? rate : 0.065,
    loanYears: Number.isFinite(years) && years > 0 ? years : 30,
    highPriceThreshold: Number.isFinite(highPrice) && highPrice > 0 ? highPrice : 1_500_000,
    coreLocationHints: [...DEFAULT_CORE_HINTS.map((h) => h.toLowerCase()), ...extra]
  };
}

export function computePropertyRiskReport(
  input: PropertyRiskReportInput,
  opts: PropertyRiskEngineOptions = defaultEngineOptionsFromEnv()
): PropertyRiskReportResult {
  const { income, savings, location: userLoc, property } = input;
  const { price, location: propLoc, type } = property;

  const financial = assessFinancial(price, income, savings);
  const cashflow = assessCashflow(price, income, savings, opts);
  const location = assessLocation(userLoc, propLoc);
  const propertyRisk = assessPropertyType(type);
  const liquidity = assessLiquidity(price, propLoc, opts);

  let score = 100;
  score -= axisDeduction(financial, 30, 15);
  score -= axisDeduction(cashflow, 30, 15);
  if (location === "Medium") score -= 10;
  if (propertyRisk === "Medium") score -= 10;
  score -= axisDeduction(liquidity, 20, 10);

  const risk_score = clampScore(score);
  const risk_level = aggregateLabel(risk_score);

  return {
    risk_score,
    risk_level,
    risk_breakdown: {
      financial,
      cashflow,
      location,
      property: propertyRisk,
      liquidity
    },
    ai_summary: AI_ZH[risk_level],
    ai_summary_en: AI_EN[risk_level],
    recommendation: REC_ZH[risk_level],
    recommendation_en: REC_EN[risk_level]
  };
}
