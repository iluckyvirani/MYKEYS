import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import {
  emailSchema,
  passwordSchema,
  validateSchema,
} from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { hashOtp } from "@/lib/auth/otp";

const resetWithOtpSchema = z
  .object({
    email: emailSchema,
    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * POST /api/auth/reset-password
 * Reset password using email + OTP.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateSchema(resetWithOtpSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { email, otp, newPassword } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      throw createApiError(ErrorCode.INVALID_OTP);
    }

    if (user.resetTokenExpiry.getTime() < Date.now()) {
      throw createApiError(ErrorCode.OTP_EXPIRED);
    }

    if (user.resetToken !== hashOtp(otp)) {
      throw createApiError(ErrorCode.INVALID_OTP);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return successResponse(
      null,
      "Password reset successful. You can now login with your new password."
    );
  } catch (error) {
    console.error("Reset password error:", error);

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
      "Failed to reset password.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
