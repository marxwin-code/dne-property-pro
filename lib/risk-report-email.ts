import { Resend } from "resend";
import { buildRiskReportEmailHtml } from "@/lib/report-email-html";
import { RESEND_FROM, RESEND_REPLY_TO } from "@/lib/resend-from";

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email.trim());
}

export async function sendRiskReportToInbox(input: {
  email: string;
  risk_score: number;
  risk_level: string;
  ai_summary: string;
  ai_summary_en: string;
  recommendation: string;
  recommendation_en: string;
  lang: "en" | "zh";
}): Promise<void> {
  if (!isValidEmail(input.email)) {
    throw new Error("Invalid email for risk report delivery.");
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  const resend = new Resend(apiKey);
  const zh = input.lang === "zh";
  const html = buildRiskReportEmailHtml({
    email: input.email.trim(),
    risk_score: input.risk_score,
    risk_level: input.risk_level,
    ai_summary: zh ? input.ai_summary : input.ai_summary_en,
    recommendation: zh ? input.recommendation : input.recommendation_en
  });

  const textLines = [
    "Your Property Risk Report",
    "",
    `Score: ${input.risk_score}/100`,
    `Level: ${input.risk_level}`,
    "",
    zh ? input.ai_summary : input.ai_summary_en,
    "",
    zh ? input.recommendation : input.recommendation_en,
    "",
    `View full report: see HTML email link`
  ];

  const result = await resend.emails.send({
    from: RESEND_FROM,
    to: input.email.trim(),
    replyTo: RESEND_REPLY_TO,
    subject: zh ? "您的购房风险报告" : "Your Property Risk Report",
    html,
    text: textLines.join("\n")
  });

  if (result.error || !result.data?.id) {
    throw new Error(result.error?.message ?? "Failed to send risk report email.");
  }
}
