import { Resend } from "resend";
import { RESEND_FROM, RESEND_REPLY_TO } from "./resend-from";
import { getSiteUrl } from "./site-url";

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export type LeadNotificationPayload = {
  name: string;
  email: string;
  age: string;
  income: string;
  savings: string;
  property: string;
  message: string;
  source?: string;
  createdAtIso: string;
};

export async function sendNewLeadInternalEmail(payload: LeadNotificationPayload) {
  const resend = getResend();
  if (!resend) return { ok: false as const, error: "Missing RESEND_API_KEY" };

  const text = `New lead — ${payload.source || "website"}

Name: ${payload.name || "—"}
Email: ${payload.email}
Age: ${payload.age}
Income: ${payload.income}
Savings: ${payload.savings}
Property: ${payload.property}
Message: ${payload.message || "—"}
Source: ${payload.source || "—"}
Time (UTC): ${payload.createdAtIso}`;

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: RESEND_REPLY_TO,
    replyTo: RESEND_REPLY_TO,
    subject: "New Lead - Property Inquiry",
    text
  });

  if (error || !data?.id) {
    return { ok: false as const, error: error?.message ?? "Send failed" };
  }
  return { ok: true as const };
}

export async function sendCustomerReportReadyEmail(params: {
  to: string;
  summaryHtml: string;
  reportUrl: string;
  consultUrl: string;
}) {
  const resend = getResend();
  if (!resend) return { ok: false as const, error: "Missing RESEND_API_KEY" };

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a;max-width:560px;">
  <p>Hi,</p>
  <p>Your personalised property report is ready.</p>
  <div style="margin:20px 0;padding:16px;border-radius:12px;background:#f8fafc;">
    ${params.summaryHtml}
  </div>
  <p style="margin:24px 0 12px;">
    <a href="${params.reportUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:9999px;font-weight:600;">View Full Report</a>
  </p>
  <p style="margin:12px 0;">
    <a href="${params.consultUrl}" style="display:inline-block;border:2px solid #2563eb;color:#2563eb;text-decoration:none;padding:10px 20px;border-radius:9999px;font-weight:600;">Book Consultation</a>
  </p>
  <p style="font-size:13px;color:#64748b;margin-top:28px;">D&amp;E Property Pro</p>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: params.to.trim(),
    replyTo: RESEND_REPLY_TO,
    subject: "Your Property Report is Ready",
    html,
    text: `Your property report is ready.\n\n${params.summaryHtml.replace(/<[^>]+>/g, "")}\n\nView full report: ${params.reportUrl}\nBook consultation: ${params.consultUrl}`
  });

  if (error || !data?.id) {
    return { ok: false as const, error: error?.message ?? "Send failed" };
  }
  return { ok: true as const };
}

export async function sendCustomerAcknowledgmentEmail(params: { to: string; name?: string }) {
  const resend = getResend();
  if (!resend) return { ok: false as const, error: "Missing RESEND_API_KEY" };

  const greeting = params.name?.trim() ? `Hi ${params.name.trim()},` : "Hi,";
  const site = getSiteUrl();

  const html = `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.6;color:#0f172a;">
  <p>${greeting}</p>
  <p>Thanks for contacting D&amp;E Property Pro — we received your message and will reply shortly.</p>
  <p style="margin-top:20px;"><a href="${site}/contact" style="color:#2563eb;">Visit our contact page</a></p>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: RESEND_FROM,
    to: params.to.trim(),
    replyTo: RESEND_REPLY_TO,
    subject: "We received your inquiry",
    html,
    text: `${greeting}\n\nThanks for contacting D&E Property Pro. We received your message and will reply shortly.\n${site}`
  });

  if (error || !data?.id) {
    return { ok: false as const, error: error?.message ?? "Send failed" };
  }
  return { ok: true as const };
}
