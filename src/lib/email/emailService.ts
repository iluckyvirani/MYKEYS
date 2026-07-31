import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import {
  getAppBaseUrl,
  getSupportEmail,
  LOGO_CID,
  renderOtpEmail,
  renderStandardEmail,
} from "@/lib/email/emailLayout";

const SUPPORT_EMAIL = getSupportEmail();

function logoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "mykeys-logo-nav.png");
  if (!fs.existsSync(logoPath)) return [];
  return [
    {
      filename: "mykeys-logo-nav.png",
      path: logoPath,
      cid: LOGO_CID,
      contentDisposition: "inline" as const,
    },
  ];
}

/**
 * GoDaddy Workspace Email SMTP (smtpout.secureserver.net).
 * If the mailbox is Microsoft 365 via GoDaddy, set:
 *   EMAIL_HOST=smtp.office365.com
 *   EMAIL_PORT=587
 *   EMAIL_SECURE=false
 */
const emailHost = process.env.EMAIL_HOST || "smtpout.secureserver.net";
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailSecure =
  process.env.EMAIL_SECURE !== undefined
    ? process.env.EMAIL_SECURE === "true"
    : emailPort === 465;

const transporter = nodemailer.createTransport(
  process.env.EMAIL_SERVICE && !process.env.EMAIL_HOST
    ? {
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER || SUPPORT_EMAIL,
          pass: process.env.EMAIL_PASSWORD || "",
        },
      }
    : {
        host: emailHost,
        port: emailPort,
        secure: emailSecure,
        auth: {
          user: process.env.EMAIL_USER || SUPPORT_EMAIL,
          pass: process.env.EMAIL_PASSWORD || "",
        },
      }
);

function mailFrom() {
  const from = process.env.EMAIL_FROM || SUPPORT_EMAIL;
  if (from.includes("<")) return from;
  return `MYKEYS <${from}>`;
}

function mailCc(): string | undefined {
  const cc = process.env.EMAIL_CC?.trim();
  return cc || undefined;
}

function baseMailOptions(to: string) {
  const options: {
    from: string;
    to: string;
    cc?: string;
    attachments: ReturnType<typeof logoAttachment>;
  } = {
    from: mailFrom(),
    to,
    attachments: logoAttachment(),
  };
  const cc = mailCc();
  if (cc) options.cc = cc;
  return options;
}

function siteUrl(path: string) {
  return `${getAppBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const emailService = {
  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const mailOptions = {
        ...baseMailOptions(email),
        subject: "Welcome to MYKEYS!",
        html: renderStandardEmail({
          title: `Welcome to MYKEYS, ${firstName}!`,
          greetingName: firstName,
          preheader: "Your MYKEYS account is ready — start exploring properties today.",
          paragraphs: [
            "We're excited to have you on board. Start exploring properties and connecting with owners today.",
            "Your email is verified and your account is ready to use.",
          ],
          cta: {
            href: siteUrl("/user/dashboard"),
            label: "Go to Dashboard",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
    }
  },

  async sendInquiryConfirmationEmail(
    email: string,
    name: string,
    propertyTitle: string
  ) {
    try {
      const mailOptions = {
        ...baseMailOptions(email),
        subject: "Thank you for your inquiry",
        html: renderStandardEmail({
          title: `Thank you, ${name}!`,
          greetingName: name,
          paragraphs: [
            `We've received your inquiry about <strong>${propertyTitle}</strong>.`,
            "The property owner will review your message and get back to you soon. In the meantime you can explore more listings or check your inquiry dashboard for updates.",
          ],
          cta: {
            href: siteUrl("/user/dashboard/inquiries"),
            label: "View Inquiries",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Inquiry confirmation email sent to ${email}`);
    } catch (error) {
      console.error(
        `Failed to send inquiry confirmation email to ${email}:`,
        error
      );
    }
  },

  async sendNewInquiryNotificationEmail(
    ownerEmail: string,
    ownerName: string,
    inquirerName: string,
    propertyTitle: string,
    inquiryId: string
  ) {
    try {
      const mailOptions = {
        ...baseMailOptions(ownerEmail),
        subject: `New inquiry for ${propertyTitle}`,
        html: renderStandardEmail({
          title: "New inquiry received",
          greetingName: ownerName,
          paragraphs: [
            `<strong>${inquirerName}</strong> sent an inquiry about your property <strong>${propertyTitle}</strong>.`,
            "Please review and respond as soon as possible to increase booking chances.",
          ],
          cta: {
            href: siteUrl(`/owner/dashboard/inquiries/${inquiryId}`),
            label: "View Inquiry",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`New inquiry notification sent to ${ownerEmail}`);
    } catch (error) {
      console.error(
        `Failed to send new inquiry notification to ${ownerEmail}:`,
        error
      );
    }
  },

  async sendInquiryResponseEmail(
    guestEmail: string,
    guestName: string,
    ownerName: string,
    propertyTitle: string,
    ownerResponse: string,
    inquiryId: string
  ) {
    try {
      const mailOptions = {
        ...baseMailOptions(guestEmail),
        subject: `Response about ${propertyTitle}`,
        html: renderStandardEmail({
          title: `Response from ${ownerName}`,
          greetingName: guestName,
          paragraphs: [
            `Good news! <strong>${ownerName}</strong> has responded to your inquiry about <strong>${propertyTitle}</strong>.`,
            `<strong>Message:</strong><br/>${ownerResponse.replace(/\n/g, "<br>")}`,
          ],
          cta: {
            href: siteUrl("/user/dashboard/inquiries"),
            label: "View in Dashboard",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Inquiry response email sent to ${guestEmail}`);
    } catch (error) {
      console.error(
        `Failed to send inquiry response email to ${guestEmail}:`,
        error
      );
    }
  },

  async sendNewReviewNotificationEmail(
    ownerEmail: string,
    ownerName: string,
    reviewerName: string,
    propertyTitle: string,
    rating: number,
    reviewText: string,
    propertyId: string
  ) {
    try {
      const mailOptions = {
        ...baseMailOptions(ownerEmail),
        subject: `New ${rating}-star review for ${propertyTitle}`,
        html: renderStandardEmail({
          title: "You received a new review",
          greetingName: ownerName,
          paragraphs: [
            `<strong>${reviewerName}</strong> left a <strong>${rating}-star review</strong> for <strong>${propertyTitle}</strong>.`,
            `<strong>Review:</strong><br/>${reviewText.replace(/\n/g, "<br>")}`,
          ],
          cta: {
            href: siteUrl(`/property/${propertyId}#reviews`),
            label: "View Review",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`New review notification sent to ${ownerEmail}`);
    } catch (error) {
      console.error(
        `Failed to send new review notification to ${ownerEmail}:`,
        error
      );
    }
  },

  async sendBookingConfirmationEmail(
    guestEmail: string,
    guestName: string,
    propertyTitle: string,
    checkInDate: string,
    checkOutDate: string,
    totalAmount: number,
    bookingId: string
  ) {
    try {
      const details = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-collapse:collapse;border:1px solid #d8eceb;border-radius:8px;overflow:hidden;">
          <tr style="background:#f3fafa;">
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;"><strong>Check-in</strong></td>
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;">${checkInDate}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;"><strong>Check-out</strong></td>
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;">${checkOutDate}</td>
          </tr>
          <tr style="background:#f3fafa;">
            <td style="padding:10px 12px;"><strong>Total</strong></td>
            <td style="padding:10px 12px;">£${totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      `;
      const mailOptions = {
        ...baseMailOptions(guestEmail),
        subject: `Booking request for ${propertyTitle}`,
        html: renderStandardEmail({
          title: "Booking request received",
          greetingName: guestName,
          paragraphs: [
            `Your booking for <strong>${propertyTitle}</strong> has been received and is awaiting owner confirmation.`,
            "We will notify you as soon as the owner confirms your booking.",
          ],
          extraHtml: details,
          cta: {
            href: siteUrl(`/user/dashboard/bookings/${bookingId}`),
            label: "View Booking Request",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Booking confirmation email sent to ${guestEmail}`);
    } catch (error) {
      console.error(
        `Failed to send booking confirmation email to ${guestEmail}:`,
        error
      );
    }
  },

  async sendBookingNotificationEmailToOwner(
    ownerEmail: string,
    ownerName: string,
    guestName: string,
    propertyTitle: string,
    checkInDate: string,
    checkOutDate: string,
    bookingId: string
  ) {
    try {
      const details = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-collapse:collapse;border:1px solid #d8eceb;border-radius:8px;overflow:hidden;">
          <tr style="background:#f3fafa;">
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;"><strong>Guest</strong></td>
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;">${guestName}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;"><strong>Check-in</strong></td>
            <td style="padding:10px 12px;border-bottom:1px solid #d8eceb;">${checkInDate}</td>
          </tr>
          <tr style="background:#f3fafa;">
            <td style="padding:10px 12px;"><strong>Check-out</strong></td>
            <td style="padding:10px 12px;">${checkOutDate}</td>
          </tr>
        </table>
      `;
      const mailOptions = {
        ...baseMailOptions(ownerEmail),
        subject: `New booking for ${propertyTitle}`,
        html: renderStandardEmail({
          title: "You have a new booking",
          greetingName: ownerName,
          paragraphs: [
            `<strong>${guestName}</strong> has booked your property <strong>${propertyTitle}</strong>.`,
          ],
          extraHtml: details,
          cta: {
            href: siteUrl(`/owner/dashboard/bookings/${bookingId}`),
            label: "View Booking",
          },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Booking notification email sent to ${ownerEmail}`);
    } catch (error) {
      console.error(
        `Failed to send booking notification email to ${ownerEmail}:`,
        error
      );
    }
  },

  async sendSavedSearchAlertEmail(
    email: string,
    firstName: string,
    searchName: string,
    matches: {
      id: string;
      title: string;
      location: string;
      priceLabel: string;
    }[],
    resultsUrl: string
  ) {
    try {
      const listHtml = `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-collapse:collapse;border:1px solid #d8eceb;border-radius:8px;overflow:hidden;">
          ${matches
            .map(
              (m, i) => `
            <tr style="${i % 2 === 0 ? "background:#f3fafa;" : ""}">
              <td style="padding:12px;border-bottom:1px solid #d8eceb;">
                <strong style="color:#0f172a;">${m.title}</strong><br/>
                <span style="color:#64748b;font-size:13px;">${m.location || ""}</span>
                ${
                  m.priceLabel
                    ? `<br/><span style="color:#339390;font-weight:700;">${m.priceLabel}</span>`
                    : ""
                }
              </td>
              <td style="padding:12px;border-bottom:1px solid #d8eceb;text-align:right;white-space:nowrap;">
                <a href="${siteUrl(`/property/${m.id}`)}" style="color:#339390;font-weight:700;text-decoration:none;">View</a>
              </td>
            </tr>`
            )
            .join("")}
        </table>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
          Manage alerts in your
          <a href="${siteUrl("/user/dashboard/saved-searches")}" style="color:#339390;text-decoration:none;font-weight:600;">dashboard</a>.
        </p>
      `;

      const mailOptions = {
        ...baseMailOptions(email),
        subject: `New listings for "${searchName}"`,
        html: renderStandardEmail({
          title: "New matching properties",
          greetingName: firstName,
          paragraphs: [
            `We found <strong>${matches.length}</strong> new listing${
              matches.length === 1 ? "" : "s"
            } matching your saved search <strong>${searchName}</strong>.`,
          ],
          extraHtml: listHtml,
          cta: { href: resultsUrl, label: "View all results" },
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Saved search alert email sent to ${email}`);
    } catch (error) {
      console.error(
        `Failed to send saved search alert email to ${email}:`,
        error
      );
    }
  },

  async sendSignupOtpEmail(email: string, firstName: string, otp: string) {
    try {
      const mailOptions = {
        ...baseMailOptions(email),
        subject: "Your MYKEYS verification code",
        html: renderOtpEmail({
          title: "Verify your email",
          firstName,
          intro:
            "Use this one-time code to finish creating your MYKEYS account:",
          otp,
          note: "This code expires in <strong>10 minutes</strong>. If you did not sign up, you can ignore this email.",
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Signup OTP email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send signup OTP email to ${email}:`, error);
      throw error;
    }
  },

  async sendPasswordResetOtpEmail(
    email: string,
    firstName: string,
    otp: string
  ) {
    try {
      const mailOptions = {
        ...baseMailOptions(email),
        subject: "Your MYKEYS password reset code",
        html: renderOtpEmail({
          title: "Reset your password",
          firstName,
          intro: "Use this one-time code to reset your MYKEYS password:",
          otp,
          note: "This code expires in <strong>10 minutes</strong>. If you did not request a reset, you can ignore this email.",
        }),
      };
      await transporter.sendMail(mailOptions);
      console.log(`Password reset OTP email sent to ${email}`);
    } catch (error) {
      console.error(
        `Failed to send password reset OTP email to ${email}:`,
        error
      );
      throw error;
    }
  },

  async sendRentDueEmail(opts: {
    to: string;
    recipientName: string;
    propertyTitle: string;
    rentAmountLabel: string;
    dueDay: number;
    role: "tenant" | "owner";
    tenantName?: string;
  }) {
    const isOwner = opts.role === "owner";
    const paragraphs = isOwner
      ? [
          `Rent for <strong>${opts.propertyTitle}</strong> is due today (day ${opts.dueDay} of the month).`,
          `Tenant: <strong>${opts.tenantName || "Tenant"}</strong>`,
          `Amount: <strong>${opts.rentAmountLabel}</strong>`,
        ]
      : [
          `This is a reminder that rent for <strong>${opts.propertyTitle}</strong> is due today (day ${opts.dueDay} of the month).`,
          `Amount due: <strong>${opts.rentAmountLabel}</strong>`,
          "Please arrange payment with your landlord as agreed.",
        ];

    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject: isOwner
        ? `Rent due today — ${opts.propertyTitle}`
        : `Rent due reminder — ${opts.propertyTitle}`,
      html: renderStandardEmail({
        title: "Rent due today",
        greetingName: opts.recipientName,
        paragraphs,
        cta: isOwner
          ? {
              href: siteUrl("/owner/dashboard/rent"),
              label: "Open Rent Management",
            }
          : undefined,
        preheader: `Rent due for ${opts.propertyTitle}`,
      }),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rent due email sent to ${opts.to}`);
  },

  async sendPackageRenewReminderEmail(opts: {
    to: string;
    firstName: string;
    packageName: string;
    daysLeft: number;
    endDate: Date;
  }) {
    const endLabel = opts.endDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject:
        opts.daysLeft === 1
          ? "Your MYKEYS package expires tomorrow"
          : `Renew your MYKEYS package — ${opts.daysLeft} days left`,
      html: renderStandardEmail({
        title: "Package renew reminder",
        greetingName: opts.firstName,
        paragraphs: [
          `Your <strong>${opts.packageName}</strong> package expires in <strong>${opts.daysLeft} day${opts.daysLeft === 1 ? "" : "s"}</strong> (on ${endLabel}).`,
          "Renew now to keep your long-term and buy listings visible on MYKEYS.",
        ],
        cta: {
          href: siteUrl("/owner/dashboard/packages"),
          label: "Renew package",
        },
        preheader: `Package expires in ${opts.daysLeft} day(s)`,
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Package renew reminder sent to ${opts.to}`);
  },

  async sendPackageExpiredEmail(opts: {
    to: string;
    firstName: string;
    packageName: string;
  }) {
    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject: "Your MYKEYS package has expired",
      html: renderStandardEmail({
        title: "Package expired",
        greetingName: opts.firstName,
        paragraphs: [
          `Your <strong>${opts.packageName}</strong> package has expired.`,
          "Long-term rent and buy listings have been taken offline. Renew your package to restore visibility on the website.",
        ],
        cta: {
          href: siteUrl("/owner/dashboard/packages"),
          label: "Restore package",
        },
        preheader: "Renew to restore your listings",
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Package expired email sent to ${opts.to}`);
  },

  async sendRestorePackageToListEmail(opts: {
    to: string;
    firstName: string;
    propertyTitle: string;
    reason: "expired" | "limit";
  }) {
    const reasonText =
      opts.reason === "limit"
        ? "your package listing limit is full"
        : "you do not have an active package";
    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject: `Restore package to list ${opts.propertyTitle}`,
      html: renderStandardEmail({
        title: "Restore package to go live",
        greetingName: opts.firstName,
        paragraphs: [
          `The tenancy for <strong>${opts.propertyTitle}</strong> has finished.`,
          `We could not put the property back on the website because ${reasonText}.`,
          "Renew or upgrade your package to make this property visible again.",
        ],
        cta: {
          href: siteUrl("/owner/dashboard/packages"),
          label: "View packages",
        },
        preheader: "Tenancy ended — restore package to list property",
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Restore package email sent to ${opts.to}`);
  },

  async sendTenancyEndedListingRestoredEmail(opts: {
    to: string;
    firstName: string;
    propertyTitle: string;
  }) {
    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject: `${opts.propertyTitle} is live again`,
      html: renderStandardEmail({
        title: "Listing restored",
        greetingName: opts.firstName,
        paragraphs: [
          `The tenancy for <strong>${opts.propertyTitle}</strong> has finished.`,
          "Your property is live on MYKEYS again.",
        ],
        cta: {
          href: siteUrl("/owner/dashboard/properties"),
          label: "View properties",
        },
        preheader: "Property is live on the website again",
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Listing restored email sent to ${opts.to}`);
  },

  async sendDiaryReminderEmail(opts: {
    to: string;
    firstName: string;
    title: string;
    description?: string | null;
    priority: string;
    dueDate: Date;
  }) {
    const dateLabel = opts.dueDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const paragraphs = [
      `Reminder: <strong>${opts.title}</strong> is due today (${dateLabel}).`,
      `Priority: <strong>${opts.priority}</strong>`,
    ];
    if (opts.description) {
      paragraphs.push(opts.description);
    }

    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject: `Diary reminder — ${opts.title}`,
      html: renderStandardEmail({
        title: "Diary reminder",
        greetingName: opts.firstName,
        paragraphs,
        preheader: `${opts.title} is due today`,
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Diary reminder email sent to ${opts.to}`);
  },

  async sendEmailChangeOtpEmail(opts: {
    to: string;
    firstName: string;
    otp: string;
    target: "current" | "new";
    pendingEmail: string;
  }) {
    const isCurrent = opts.target === "current";
    const mailOptions = {
      ...baseMailOptions(opts.to),
      subject: isCurrent
        ? "Confirm email change — verify your current email"
        : "Confirm your new MYKEYS email",
      html: renderOtpEmail({
        title: isCurrent ? "Verify current email" : "Verify new email",
        firstName: opts.firstName,
        intro: isCurrent
          ? `You requested to change your MYKEYS email to <strong>${opts.pendingEmail}</strong>. Enter this code to confirm it was you:`
          : `Enter this code to confirm your new MYKEYS email address:`,
        otp: opts.otp,
        note: "This code expires in <strong>10 minutes</strong>. If you did not request an email change, you can ignore this email.",
      }),
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email change OTP (${opts.target}) sent to ${opts.to}`);
  },
};
