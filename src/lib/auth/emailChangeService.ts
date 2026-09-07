import { prisma } from "@/lib/prisma";
import {
  generateOtpCode,
  hashOtp,
  otpExpiresAt,
  secondsUntilResend,
  maskEmail,
} from "@/lib/auth/otp";
import { emailService } from "@/lib/email/emailService";

export type EmailChangeStep = "VERIFY_OLD" | "VERIFY_NEW";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function clearEmailChange(data: {
  pendingEmail?: null;
  emailChangeStep?: null;
  emailChangeOtpHash?: null;
  emailChangeOtpExpiresAt?: null;
  emailChangeLastSentAt?: null | Date;
} = {}) {
  return {
    pendingEmail: null,
    emailChangeStep: null,
    emailChangeOtpHash: null,
    emailChangeOtpExpiresAt: null,
    ...data,
  };
}

export const emailChangeService = {
  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        pendingEmail: true,
        emailChangeStep: true,
        emailChangeOtpExpiresAt: true,
        emailChangeLastSentAt: true,
      },
    });
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }

    return {
      currentEmail: user.email,
      pendingEmail: user.pendingEmail,
      step: (user.emailChangeStep as EmailChangeStep | null) || null,
      maskedCurrentEmail: maskEmail(user.email),
      maskedPendingEmail: user.pendingEmail
        ? maskEmail(user.pendingEmail)
        : null,
      resendWaitSeconds: secondsUntilResend(user.emailChangeLastSentAt),
      expiresAt: user.emailChangeOtpExpiresAt?.toISOString() || null,
    };
  },

  async start(userId: string, newEmailRaw: string) {
    const newEmail = normalizeEmail(newEmailRaw);
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      throw Object.assign(new Error("Enter a valid email address"), {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailChangeLastSentAt: true,
      },
    });
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }

    if (newEmail === user.email.toLowerCase()) {
      throw Object.assign(
        new Error("New email must be different from your current email"),
        { status: 400 }
      );
    }

    const taken = await prisma.user.findFirst({
      where: { email: { equals: newEmail, mode: "insensitive" }, NOT: { id: userId } },
      select: { id: true },
    });
    if (taken) {
      throw Object.assign(new Error("This email is already in use"), {
        status: 400,
      });
    }

    const wait = secondsUntilResend(user.emailChangeLastSentAt);
    if (wait > 0) {
      throw Object.assign(
        new Error(`Please wait ${wait}s before requesting another code`),
        { status: 429, wait }
      );
    }

    const now = new Date();
    const otp = generateOtpCode();

    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        emailChangeStep: "VERIFY_OLD",
        emailChangeOtpHash: hashOtp(otp),
        emailChangeOtpExpiresAt: otpExpiresAt(now),
        emailChangeLastSentAt: now,
      },
    });

    await emailService.sendEmailChangeOtpEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
      target: "current",
      pendingEmail: newEmail,
    });

    return {
      step: "VERIFY_OLD" as const,
      maskedCurrentEmail: maskEmail(user.email),
      maskedPendingEmail: maskEmail(newEmail),
      pendingEmail: newEmail,
      resendWaitSeconds: 60,
    };
  },

  async verifyOld(userId: string, otpRaw: string) {
    const otp = String(otpRaw || "").trim();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        pendingEmail: true,
        emailChangeStep: true,
        emailChangeOtpHash: true,
        emailChangeOtpExpiresAt: true,
        emailChangeLastSentAt: true,
      },
    });
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    if (user.emailChangeStep !== "VERIFY_OLD" || !user.pendingEmail) {
      throw Object.assign(new Error("No email change in progress"), {
        status: 400,
      });
    }
    if (!user.emailChangeOtpHash || !user.emailChangeOtpExpiresAt) {
      throw Object.assign(new Error("No verification code found"), {
        status: 400,
      });
    }
    if (user.emailChangeOtpExpiresAt.getTime() < Date.now()) {
      throw Object.assign(new Error("Code expired. Please resend."), {
        status: 400,
      });
    }
    if (user.emailChangeOtpHash !== hashOtp(otp)) {
      throw Object.assign(new Error("Invalid verification code"), {
        status: 400,
      });
    }

    const now = new Date();
    const newOtp = generateOtpCode();

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailChangeStep: "VERIFY_NEW",
        emailChangeOtpHash: hashOtp(newOtp),
        emailChangeOtpExpiresAt: otpExpiresAt(now),
        emailChangeLastSentAt: now,
      },
    });

    await emailService.sendEmailChangeOtpEmail({
      to: user.pendingEmail,
      firstName: user.firstName,
      otp: newOtp,
      target: "new",
      pendingEmail: user.pendingEmail,
    });

    return {
      step: "VERIFY_NEW" as const,
      maskedCurrentEmail: maskEmail(user.email),
      maskedPendingEmail: maskEmail(user.pendingEmail),
      pendingEmail: user.pendingEmail,
      resendWaitSeconds: 60,
    };
  },

  async verifyNew(userId: string, otpRaw: string) {
    const otp = String(otpRaw || "").trim();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        pendingEmail: true,
        emailChangeStep: true,
        emailChangeOtpHash: true,
        emailChangeOtpExpiresAt: true,
      },
    });
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    if (user.emailChangeStep !== "VERIFY_NEW" || !user.pendingEmail) {
      throw Object.assign(new Error("Verify your current email first"), {
        status: 400,
      });
    }
    if (!user.emailChangeOtpHash || !user.emailChangeOtpExpiresAt) {
      throw Object.assign(new Error("No verification code found"), {
        status: 400,
      });
    }
    if (user.emailChangeOtpExpiresAt.getTime() < Date.now()) {
      throw Object.assign(new Error("Code expired. Please resend."), {
        status: 400,
      });
    }
    if (user.emailChangeOtpHash !== hashOtp(otp)) {
      throw Object.assign(new Error("Invalid verification code"), {
        status: 400,
      });
    }

    const taken = await prisma.user.findFirst({
      where: {
        email: { equals: user.pendingEmail, mode: "insensitive" },
        NOT: { id: userId },
      },
      select: { id: true },
    });
    if (taken) {
      await prisma.user.update({
        where: { id: userId },
        data: clearEmailChange(),
      });
      throw Object.assign(new Error("This email is already in use"), {
        status: 400,
      });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        ...clearEmailChange(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
      },
    });

    return {
      step: null,
      email: updated.email,
      user: updated,
    };
  },

  async resend(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        pendingEmail: true,
        emailChangeStep: true,
        emailChangeLastSentAt: true,
      },
    });
    if (!user?.pendingEmail || !user.emailChangeStep) {
      throw Object.assign(new Error("No email change in progress"), {
        status: 400,
      });
    }

    const wait = secondsUntilResend(user.emailChangeLastSentAt);
    if (wait > 0) {
      throw Object.assign(
        new Error(`Please wait ${wait}s before requesting another code`),
        { status: 429, wait }
      );
    }

    const now = new Date();
    const otp = generateOtpCode();
    const step = user.emailChangeStep as EmailChangeStep;
    const to = step === "VERIFY_OLD" ? user.email : user.pendingEmail;

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailChangeOtpHash: hashOtp(otp),
        emailChangeOtpExpiresAt: otpExpiresAt(now),
        emailChangeLastSentAt: now,
      },
    });

    await emailService.sendEmailChangeOtpEmail({
      to,
      firstName: user.firstName,
      otp,
      target: step === "VERIFY_OLD" ? "current" : "new",
      pendingEmail: user.pendingEmail,
    });

    return {
      step,
      maskedCurrentEmail: maskEmail(user.email),
      maskedPendingEmail: maskEmail(user.pendingEmail),
      pendingEmail: user.pendingEmail,
      resendWaitSeconds: 60,
    };
  },

  async cancel(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: clearEmailChange(),
    });
    return { cancelled: true };
  },
};
