/**
 * D&E Property Pro — readiness score (0–100) and risk band.
 * All business rules live here; Airtable stores outcomes only.
 */

export type RiskLevelDne = "low" | "medium" | "high";

/** ownership: "yes" | "no" (case-insensitive) */
export function computeReadinessScore(input: {
  income: number;
  savings: number;
  ownership: string;
}): number {
  const own = input.ownership.trim().toLowerCase();
  const ownership_score = own === "yes" ? 20 : 10;
  const income_score = Math.min(input.income / 100_000, 1) * 40;
  const savings_score = Math.min(input.savings / 200_000, 1) * 40;
  const total = income_score + savings_score + ownership_score;
  return Math.round(Math.min(100, Math.max(0, total)));
}

export function scoreToRiskLevel(score: number): RiskLevelDne {
  if (score >= 80) return "low";
  if (score >= 50) return "medium";
  return "high";
}

/** Max listing price (AUD) for property recommendations by readiness score */
export function maxPropertyPriceForScore(score: number): number {
  if (score >= 80) return 1_000_000;
  if (score >= 50) return 700_000;
  return 500_000;
}

export function buildRiskSummary(input: {
  score: number;
  risk_level: RiskLevelDne;
  location: string;
  lang?: "en" | "zh";
}): string {
  const { score, risk_level, location, lang = "en" } = input;
  if (lang === "zh") {
    return [
      `综合评分 ${score}/100（风险档：${risk_level}）。`,
      `意向区域：${location}。`,
      risk_level === "low"
        ? "财务缓冲较好，可Focus略高总价的短名单房源。"
        : risk_level === "medium"
          ? "建议以预算与现金缓冲为优先，控制单笔敞口。"
          : "建议先提升储蓄与可证明收入，再逐步匹配房源。"
    ].join(" ");
  }
  return [
    `Readiness score ${score}/100 (risk band: ${risk_level}).`,
    `Preferred area: ${location}.`,
    risk_level === "low"
      ? "Strong buffer — you may consider a wider shortlist toward the top of your price cap."
      : risk_level === "medium"
        ? "Prioritise cash buffer and loan comfort before stretching on price."
        : "Focus on building savings and documented income before locking in a purchase."
  ].join(" ");
}
