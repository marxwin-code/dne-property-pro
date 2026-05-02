import { getSiteUrl } from "./site-url";

export type EmailProperty = {
  name: string;
  priceLabel: string;
  location: string;
  image: string;
};

/** Customer-facing investment plan email: score, summary, top 3, sales advice, CTAs. */
export function buildPropertyInvestmentPlanHtml(params: {
  leadScore: number;
  leadLevel: string;
  summary: string;
  salesAdvice: string;
  properties: EmailProperty[];
}) {
  const site = getSiteUrl();
  const propertiesUrl = `${site}/properties`;
  const consultUrl = `${site}/contact`;

  const propBoxes = params.properties
    .slice(0, 3)
    .map(
      (p) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid #334155;border-radius:12px;overflow:hidden;background:#0f172a;">
    <tr>
      <td width="120" style="vertical-align:top;">
        <img src="${escapeHtml(p.image)}" alt="" width="120" height="90" style="display:block;width:120px;height:90px;object-fit:cover;" />
      </td>
      <td style="padding:12px 16px;vertical-align:top;color:#f8fafc;font-size:14px;">
        <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${escapeHtml(p.name)}</div>
        <div style="color:#93c5fd;">${escapeHtml(p.priceLabel)} · ${escapeHtml(p.location)}</div>
      </td>
    </tr>
  </table>`
    )
    .join("");

  const adviceParagraphs = params.salesAdvice
    .split(/\n\n+/)
    .map((block) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:#cbd5e1;">${escapeHtml(block)}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#020617;font-family:system-ui,-apple-system,sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0f172a;border-radius:16px;border:1px solid #1e3a5f;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 16px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#93c5fd;">D&amp;E Property Pro</div>
              <h1 style="margin:12px 0 0;font-size:22px;color:#f8fafc;">Your Property Investment Plan</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:8px;">1 · Your score</div>
              <div style="font-size:32px;font-weight:800;color:#fff;">${params.leadScore}<span style="font-size:18px;color:#64748b;">/100</span>
                <span style="display:inline-block;margin-left:12px;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;background:#1e3a5f;color:#e0f2fe;">${escapeHtml(params.leadLevel)}</span>
              </div>
              <div style="margin-top:12px;height:10px;background:#1e293b;border-radius:999px;overflow:hidden;">
                <div style="width:${Math.min(100, params.leadScore)}%;height:100%;background:linear-gradient(90deg,#2563eb,#38bdf8);"></div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:8px;">2 · Summary</div>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#cbd5e1;">${escapeHtml(params.summary)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:12px;">3 · Top matching properties</div>
              ${propBoxes}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #1e3a5f;">
              <div style="font-size:12px;font-weight:700;color:#93c5fd;margin-bottom:12px;">4 · Sales advice &amp; next steps</div>
              ${adviceParagraphs}
            </td>
          </tr>
          <tr>
            <td style="padding:24px;background:#020617;">
              <a href="${propertiesUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;font-size:14px;margin-right:8px;margin-bottom:10px;">View Matching Properties</a>
              <a href="${consultUrl}" style="display:inline-block;border:2px solid #38bdf8;color:#38bdf8;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;font-size:14px;">Book Free Consultation</a>
            </td>
          </tr>
        </table>
        <p style="font-size:11px;color:#64748b;margin-top:16px;">D&amp;E Property Pro · info@depropertypro.com</p>
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
  const consultUrl = `${site}/contact`;

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
