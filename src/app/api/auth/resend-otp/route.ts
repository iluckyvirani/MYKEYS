import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { emailSchema, validateSchema } from "@/lib/auth/validation";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { emailService } from "@/lib/email/emailService";
import {
  generateOtpCode,
  hashOtp,
  otpExpiresAt,
  secondsUntilResend,
  OTP_RESEND_COOLDOWN_SECONDS,
  maskEmail,
} from "@/lib/auth/otp";

const resendSchema = z.object({
  email: emailSchema,
});

/**
 * POST /api/auth/resend-otp
 * Resend signup OTP with cooldown.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateSchema(resendSchema, body);
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

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    if (user.emailVerified && user.status === "ACTIVE") {
      return errorResponse(
        "Email is already verified. Please sign in.",
        400,
        ErrorCode.INVALID_INPUT
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
        status: "PENDING",
        emailVerified: false,
        emailOtpHash: hashOtp(otp),
        emailOtpExpiresAt: otpExpiresAt(now),
        emailOtpLastSentAt: now,
      },
    });

    try {
      await emailService.sendSignupOtpEmail(user.email, user.firstName, otp);
    } catch (e) {
      console.error("Resend OTP email failed:", e);
      return errorResponse(
        "Could not send OTP email. Please try again shortly.",
        502,
        ErrorCode.SERVICE_UNAVAILABLE
      );
    }

    return successResponse(
      {
        email: user.email,
        maskedEmail: maskEmail(user.email),
        resendCooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        expiresInMinutes: 10,
      },
      "A new OTP has been sent to your email"
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
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
      "Failed to resend OTP. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
