import { getSiteUrl } from "./site-url";

export type EmailProperty = {
  name: string;
  priceLabel: string;
  location: string;
  image: string;
  description?: string;
};

function getConsultHref(): string {
  const cal = process.env.NEXT_PUBLIC_CALENDLY_URL ?? process.env.CALENDLY_BOOKING_URL;
  const u = cal?.trim();
  if (u?.startsWith("http")) return u;
  return `${getSiteUrl()}/contact`;
}

function scoreTierLabel(score: number): string {
  if (score >= 70) return "Hot (70–100)";
  if (score >= 40) return "Warm (40–70)";
  return "Cold (0–40)";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type UserSnapshot = {
  age: number;
  income: number;
  savings: number;
  hasProperty: string;
  location?: string;
};

/** Customer-facing investment plan: score, snapshot, sales pitch, properties, CTAs. */
export function buildPropertyInvestmentPlanHtml(params: {
  leadScore: number;
  leadLevel: string;
  summary: string;
  salesPitch: string;
  salesAdvice: string;
  properties: EmailProperty[];
  userSnapshot?: UserSnapshot;
}) {
  const site = getSiteUrl();
  const propertiesUrl = `${site}/properties`;
  const consultUrl = getConsultHref();

  const snapshotTable = params.userSnapshot
    ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:0;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#0c1a2e 0%,#0f172a 50%,#172554 100%);border:1px solid #2563eb55;">
    <tr>
      <td style="padding:18px 20px;">
        <div style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#93c5fd;margin-bottom:10px;">Your profile</div>
        <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;color:#e2e8f0;">
          <tr><td style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">Age</td><td align="right" style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">${params.userSnapshot.age}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">Annual income (AUD)</td><td align="right" style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">${params.userSnapshot.income.toLocaleString("en-AU")}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">Savings (AUD)</td><td align="right" style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">${params.userSnapshot.savings.toLocaleString("en-AU")}</td></tr>
          <tr><td style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">Property ownership</td><td align="right" style="padding:6px 0;border-bottom:1px solid #1e3a5f80;">${escapeHtml(params.userSnapshot.hasProperty)}</td></tr>
          <tr><td style="padding:6px 0;">Preferred area</td><td align="right" style="padding:6px 0;">${escapeHtml(params.userSnapshot.location?.trim() || "—")}</td></tr>
        </table>
      </td>
    </tr>
  </table>`
    : "";

  const propBoxes = params.properties
    .slice(0, 3)
    .map(
      (p) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-radius:14px;overflow:hidden;border:1px solid #2563eb44;background:linear-gradient(180deg,#0f172a 0%,#0a1220 100%);box-shadow:0 8px 24px rgba(37,99,235,0.12);">
    <tr>
      <td width="130" style="vertical-align:top;width:130px;">
        <img src="${escapeHtml(p.image)}" alt="" width="130" height="98" style="display:block;width:130px;height:98px;object-fit:cover;" />
      </td>
      <td style="padding:14px 18px;vertical-align:top;color:#f8fafc;font-size:14px;">
        <div style="font-weight:800;font-size:16px;margin-bottom:6px;color:#fff;">${escapeHtml(p.name)}</div>
        <div style="color:#7dd3fc;font-weight:600;margin-bottom:6px;">${escapeHtml(p.priceLabel)}</div>
        <div style="color:#94a3b8;font-size:12px;margin-bottom:8px;">${escapeHtml(p.location)}</div>
        ${p.description ? `<div style="font-size:13px;line-height:1.45;color:#cbd5e1;">${escapeHtml(p.description.slice(0, 220))}${p.description.length > 220 ? "…" : ""}</div>` : ""}
      </td>
    </tr>
  </table>`
    )
    .join("");

  const pitchHtml = `<p style="margin:0;font-size:15px;line-height:1.65;color:#f1f5f9;font-weight:500;">${escapeHtml(params.salesPitch)}</p>`;

  const summaryHtml = `<p style="margin:0;font-size:15px;line-height:1.55;color:#cbd5e1;">${escapeHtml(params.summary)}</p>`;

  const adviceParagraphs = params.salesAdvice
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#94a3b8;">${escapeHtml(block)}</p>`)
    .join("");

  const pct = Math.min(100, Math.max(0, params.leadScore));

  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#020617;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#020617 0%,#0f172a 100%);padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:linear-gradient(145deg,#0f172a 0%,#111827 100%);border-radius:20px;border:1px solid #2563eb33;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.45);">
          <tr>
            <td style="padding:28px 26px 18px;background:linear-gradient(90deg,#1e3a8a 0%,#2563eb 40%,#0f172a 100%);">
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#bfdbfe;">D&amp;E Property Pro</div>
              <h1 style="margin:10px 0 0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.02em;">Your Property Investment Plan</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#93c5fd;">Curated match · Lead intelligence · Next steps</p>
            </td>
          </tr>
          ${snapshotTable ? `<tr><td style="padding:20px 22px 0;">${snapshotTable}</td></tr>` : ""}
          <tr>
            <td style="padding:22px 26px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;margin-bottom:10px;">Lead score</div>
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:baseline;">
                  <span style="font-size:38px;font-weight:900;color:#fff;line-height:1;">${params.leadScore}</span>
                  <span style="font-size:18px;color:#64748b;">/100</span>
                </td>
                <td style="padding-left:14px;vertical-align:middle;">
                  <span style="display:inline-block;padding:8px 14px;border-radius:999px;font-size:12px;font-weight:700;background:#1e3a8a;color:#e0f2fe;border:1px solid #3b82f6;">${escapeHtml(params.leadLevel)}</span>
                  <span style="display:inline-block;margin-left:8px;padding:6px 12px;border-radius:8px;font-size:11px;color:#94a3b8;border:1px solid #334155;">${escapeHtml(scoreTierLabel(params.leadScore))}</span>
                </td>
              </tr></table>
              <div style="margin-top:16px;height:12px;background:#1e293b;border-radius:999px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#1d4ed8,#38bdf8,#22d3ee);border-radius:999px;"></div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 26px;border-bottom:1px solid #1e3a5f;background:#0a1220;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#38bdf8;margin-bottom:12px;">Your sales insight</div>
              ${pitchHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 26px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;margin-bottom:10px;">Executive summary</div>
              ${summaryHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 26px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;margin-bottom:14px;">Top matching properties</div>
              ${propBoxes || `<p style="color:#64748b;font-size:14px;">No listings matched this screen — our team can still shortlist for you.</p>`}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 26px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;margin-bottom:12px;">Advisor notes</div>
              ${adviceParagraphs}
            </td>
          </tr>
          <tr>
            <td style="padding:26px;background:#020617;">
              <a href="${propertiesUrl}" style="display:inline-block;background:linear-gradient(90deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:15px 26px;border-radius:999px;font-weight:800;font-size:14px;margin-right:10px;margin-bottom:12px;box-shadow:0 4px 14px rgba(37,99,235,0.45);">View Matching Properties</a>
              <a href="${consultUrl}" style="display:inline-block;border:2px solid #38bdf8;color:#38bdf8;text-decoration:none;padding:13px 24px;border-radius:999px;font-weight:800;font-size:14px;">Book Free Consultation</a>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#64748b;margin-top:18px;">D&amp;E Property Pro · info@depropertypro.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Legacy detailed report layout (kept for reference). */
export function buildCompareReportEmailHtml(params: {
  summary: string;
  dealScore: number;
  timingLabel: string;
  risks: string;
  strategyExcerpt: string;
  age: number;
  income: number;
  savings: number;
  hasProperty: string;
  properties: EmailProperty[];
}) {
  const site = getSiteUrl();
  const propertiesUrl = `${site}/properties`;
  const consultUrl = getConsultHref();

  const propBoxes = params.properties
    .slice(0, 3)
    .map(
      (p) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#0f172a;">
    <tr>
      <td width="120" style="vertical-align:top;">
        <img src="${escapeHtml(p.image)}" alt="" width="120" height="90" style="display:block;width:120px;height:90px;object-fit:cover;" />
      </td>
      <td style="padding:12px 16px;vertical-align:top;color:#f8fafc;font-size:14px;">
        <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${escapeHtml(p.name)}</div>
        <div style="color:#93c5fd;margin-bottom:4px;">${escapeHtml(p.priceLabel)} · ${escapeHtml(p.location)}</div>
      </td>
    </tr>
  </table>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#020617;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0f172a;border-radius:16px;border:1px solid #1e3a5f;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 12px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#93c5fd;">D&amp;E Property Pro</div>
              <h1 style="margin:12px 0 0;font-size:22px;color:#f8fafc;">Your Property Investment Report</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:8px;">Section 1 · Score</div>
              <div style="font-size:32px;font-weight:800;color:#fff;">${params.dealScore}<span style="font-size:18px;color:#64748b;">/100</span></div>
              <div style="margin-top:12px;height:10px;background:#1e293b;border-radius:999px;overflow:hidden;">
                <div style="width:${params.dealScore}%;height:100%;background:linear-gradient(90deg,#2563eb,#38bdf8);"></div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:8px;">Section 2 · Summary</div>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#cbd5e1;">${escapeHtml(params.summary)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:8px;">Section 3 · Financial snapshot</div>
              <table cellpadding="8" style="font-size:14px;color:#cbd5e1;width:100%;">
                <tr><td style="border-bottom:1px solid #1e293b;">Age</td><td align="right" style="border-bottom:1px solid #1e293b;">${params.age}</td></tr>
                <tr><td style="border-bottom:1px solid #1e293b;">Income (AUD)</td><td align="right" style="border-bottom:1px solid #1e293b;">${params.income.toLocaleString("en-AU")}</td></tr>
                <tr><td style="border-bottom:1px solid #1e293b;">Savings (AUD)</td><td align="right" style="border-bottom:1px solid #1e293b;">${params.savings.toLocaleString("en-AU")}</td></tr>
                <tr><td>Ownership</td><td align="right">${escapeHtml(params.hasProperty)}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:8px;">Section 4 · AI strategy</div>
              <p style="margin:0 0 10px;font-size:14px;color:#94a3b8;"><strong style="color:#e2e8f0;">Timing:</strong> ${escapeHtml(params.timingLabel)}</p>
              <p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#cbd5e1;">${escapeHtml(params.strategyExcerpt)}</p>
              <p style="margin:0;font-size:13px;line-height:1.5;color:#94a3b8;"><strong style="color:#e2e8f0;">Risks:</strong> ${escapeHtml(params.risks)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:12px;">Section 5 · Recommended properties</div>
              ${propBoxes}
            </td>
          </tr>
          <tr>
            <td style="padding:24px;background:#020617;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:16px;">Section 6 · Next action</div>
              <a href="${propertiesUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;font-size:14px;margin-right:8px;margin-bottom:10px;">View Matching Properties</a>
              <a href="${consultUrl}" style="display:inline-block;border:2px solid #38bdf8;color:#38bdf8;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;">Book Free Consultation</a>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#64748b;margin-top:16px;">This email was sent by D&amp;E Property Pro · Reply to this message or write to info@depropertypro.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export type RiskReportEmailParams = {
  email: string;
  risk_score: number;
  risk_level: string;
  ai_summary: string;
  recommendation: string;
};

/** Risk report delivery — primary CTA returns user to the site with email prefilled. */
export function buildRiskReportEmailHtml(params: RiskReportEmailParams): string {
  const site = getSiteUrl();
  const reportUrl = `${site}/risk-report?email=${encodeURIComponent(params.email.trim())}`;
  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#020617;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0f172a;border-radius:16px;border:1px solid #78350f;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 12px;border-bottom:1px solid #1e293b;">
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#fbbf24;">D&amp;E Property Pro</div>
              <h1 style="margin:12px 0 0;font-size:22px;color:#f8fafc;">Your Property Risk Report</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e293b;">
              <div style="font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:8px;">Risk score</div>
              <div style="font-size:32px;font-weight:800;color:#fff;">${params.risk_score}<span style="font-size:18px;color:#64748b;">/100</span></div>
              <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;">${escapeHtml(params.risk_level)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e293b;">
              <div style="font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:8px;">Summary</div>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#cbd5e1;">${escapeHtml(params.ai_summary)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e293b;">
              <div style="font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:8px;">Recommendation</div>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#fef3c7;">${escapeHtml(params.recommendation)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;background:#020617;">
              <a href="${escapeHtml(reportUrl)}" style="display:inline-block;background:#f59e0b;color:#0f172a;text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:800;font-size:15px;">View Full Risk Report</a>
              <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Save this link to revisit your breakdown anytime.</p>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#64748b;margin-top:16px;">This email was sent by D&amp;E Property Pro · Reply to this message or write to info@depropertypro.com</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
