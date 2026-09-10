const SUPPORT_EMAIL = "support@mykeysuk.com";
const BRAND = "#339390";
const BRAND_DARK = "#2a7a78";
const BG = "#f3fafa";
const CARD_BORDER = "#d8eceb";

export function getSupportEmail() {
  return SUPPORT_EMAIL;
}

export function getAppBaseUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Embedded via nodemailer CID attachment — works in Gmail without a public URL. */
export const LOGO_CID = "mykeys-logo@mykeys";

export function getLogoUrl() {
  return `cid:${LOGO_CID}`;
}

function ctaButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="border-radius:6px;background:${BRAND};">
          <a href="${href}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function otpBox(otp: string) {
  return `
    <div style="font-size:32px;letter-spacing:10px;font-weight:700;color:#0f172a;background:${BG};border:1px solid ${CARD_BORDER};border-radius:10px;padding:18px 16px;text-align:center;margin:24px 0;font-family:Arial,Helvetica,sans-serif;">
      ${otp}
    </div>
  `;
}

/**
 * Shared MYKEYS email shell — logo header, teal accents, support footer.
 */
export function renderEmailLayout(opts: {
  title: string;
  bodyHtml: string;
  /** Optional preheader text for inbox preview */
  preheader?: string;
}) {
  const logo = getLogoUrl();
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${opts.preheader}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${CARD_BORDER};border-radius:14px;overflow:hidden;">
          <tr>
            <td style="background:#000000;padding:16px 24px;text-align:center;">
              <img src="${logo}" alt="MYKEYS" width="200" style="display:inline-block;max-width:220px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${BRAND};font-weight:700;">
                ${opts.title}
              </h1>
              <div style="font-size:15px;line-height:1.6;color:#334155;">
                ${opts.bodyHtml}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 4px;font-size:14px;color:#475569;">Best regards,</p>
              <p style="margin:0 0 16px;font-size:14px;color:#0f172a;font-weight:700;">The MYKEYS Team</p>
              <div style="border-top:1px solid ${CARD_BORDER};padding-top:14px;text-align:center;">
                <img src="${logo}" alt="MYKEYS" width="120" style="display:inline-block;max-width:140px;height:auto;border:0;margin:0 0 10px;" />
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">
                  Need help?
                  <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND};text-decoration:none;font-weight:600;">${SUPPORT_EMAIL}</a><br/>
                  © ${new Date().getFullYear()} MYKEYS. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderStandardEmail(opts: {
  title: string;
  greetingName: string;
  paragraphs: string[];
  cta?: { href: string; label: string };
  extraHtml?: string;
  preheader?: string;
}) {
  const paras = opts.paragraphs
    .map((p) => `<p style="margin:0 0 14px;">${p}</p>`)
    .join("");
  const cta = opts.cta ? ctaButton(opts.cta.href, opts.cta.label) : "";
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${opts.greetingName},</p>
    ${paras}
    ${opts.extraHtml || ""}
    ${cta}
  `;
  return renderEmailLayout({
    title: opts.title,
    bodyHtml,
    preheader: opts.preheader,
  });
}

export function renderOtpEmail(opts: {
  title: string;
  firstName: string;
  intro: string;
  otp: string;
  note: string;
}) {
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${opts.firstName},</p>
    <p style="margin:0 0 8px;">${opts.intro}</p>
    ${otpBox(opts.otp)}
    <p style="margin:0;color:#64748b;font-size:14px;">${opts.note}</p>
  `;
  return renderEmailLayout({
    title: opts.title,
    bodyHtml,
    preheader: `Your MYKEYS code is ${opts.otp}`,
  });
}

/** Mint/teal CTA used for magic-link emails (full-width friendly). */
export function ctaButtonMint(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 12px;">
      <tr>
        <td align="center" style="border-radius:8px;background:#a2d9d6;border:2px solid #339390;">
          <a href="${href}" style="display:block;padding:14px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#0f172a;text-decoration:none;border-radius:8px;text-align:center;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export { ctaButton };
