import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { forgotPasswordSchema, validateSchema } from "@/lib/auth/validation";
import { ErrorCode } from "@/lib/auth/errors";
import { ForgotPasswordRequest } from "@/types/auth";
import { emailService } from "@/lib/email/emailService";
import {
  generateOtpCode,
  hashOtp,
  otpExpiresAt,
  secondsUntilResend,
  OTP_RESEND_COOLDOWN_SECONDS,
  maskEmail,
} from "@/lib/auth/otp";

/**
 * POST /api/auth/forgot-password
 * Send a password-reset OTP to the user's email.
 */
export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();

    const validation = validateSchema(forgotPasswordSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { email } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always look successful to avoid email enumeration
    const genericMessage =
      "If an account with that email exists, we've sent a password reset OTP.";

    if (!user) {
      return successResponse(
        {
          requiresOtp: true,
          email,
          maskedEmail: maskEmail(email),
          resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        },
        genericMessage
      );
    }

    const wait = secondsUntilResend(user.emailOtpLastSentAt);
    if (wait > 0) {
      return errorResponse(
        `Please wait ${wait}s before requesting another OTP`,
        429,
        ErrorCode.RATE_LIMIT_EXCEEDED,
        { retryAfter: [String(wait)] }
      );
    }

    const otp = generateOtpCode();
    const now = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashOtp(otp),
        resetTokenExpiry: otpExpiresAt(now),
        emailOtpLastSentAt: now,
      },
    });

    try {
      await emailService.sendPasswordResetOtpEmail(
        user.email,
        user.firstName || "there",
        otp
      );
    } catch (e) {
      console.error("Password reset OTP email failed:", e);
      return errorResponse(
        "Could not send OTP email. Please try again shortly.",
        502,
        ErrorCode.SERVICE_UNAVAILABLE
      );
    }

    return successResponse(
      {
        requiresOtp: true,
        email: user.email,
        maskedEmail: maskEmail(user.email),
        resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        expiresInMinutes: 10,
      },
      genericMessage
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof Error && "statusCode" in error) {
      const apiError = error as any;
      return errorResponse(
        apiError.message,
        apiError.statusCode,
        apiError.code,
        apiError.errors
      );
    }

    return errorResponse(
      "Failed to process password reset request.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
