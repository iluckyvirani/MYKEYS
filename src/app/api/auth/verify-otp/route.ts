import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { emailSchema, validateSchema } from "@/lib/auth/validation";
import { generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO, primaryRoleFromAssignments } from "@/lib/auth/helpers";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { notificationService } from "@/lib/notifications/notificationService";
import { emailService } from "@/lib/email/emailService";
import { hashOtp } from "@/lib/auth/otp";

const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

/**
 * POST /api/auth/verify-otp
 * Verify signup OTP, activate account, and log the user in.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateSchema(verifyOtpSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { email, otp } = validation.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    if (user.emailVerified && user.status === "ACTIVE") {
      // Already verified — just log them in
    } else {
      if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
        throw createApiError(ErrorCode.INVALID_OTP);
      }
      if (user.emailOtpExpiresAt.getTime() < Date.now()) {
        throw createApiError(ErrorCode.OTP_EXPIRED);
      }
      if (user.emailOtpHash !== hashOtp(otp)) {
        throw createApiError(ErrorCode.INVALID_OTP);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          emailVerified: true,
          emailOtpHash: null,
          emailOtpExpiresAt: null,
          lastLoginAt: new Date(),
        },
      });

      try {
        await notificationService.createSystemNotification(
          user.id,
          "Welcome to MyKeys!",
          `Welcome ${user.firstName}! Your email is verified. Explore properties and connect with owners.`
        );
      } catch (e) {
        console.error("Welcome notification failed (non-fatal):", e);
      }

      try {
        await emailService.sendWelcomeEmail(user.email, user.firstName);
      } catch (e) {
        console.error("Welcome email failed (non-fatal):", e);
      }
    }

    const fresh = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: true },
    });
    if (!fresh) throw createApiError(ErrorCode.USER_NOT_FOUND);

    const primaryRole = primaryRoleFromAssignments(fresh.roles);

    const { accessToken, refreshToken } = await generateTokenPair(
      fresh.id,
      fresh.email,
      primaryRole
    );
    const userDTO = await toUserDTO(fresh);

    const nextResponse = successResponse(
      { user: userDTO, accessToken, refreshToken },
      "Email verified. Login successful"
    );

    nextResponse.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60,
      path: "/",
    });
    nextResponse.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Verify OTP error:", error);
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
      "OTP verification failed. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
