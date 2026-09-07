import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { registerSchema, validateSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { RegisterRequest } from "@/types/auth";
import { emailService } from "@/lib/email/emailService";
import {
  generateOtpCode,
  hashOtp,
  otpExpiresAt,
  OTP_RESEND_COOLDOWN_SECONDS,
  maskEmail,
} from "@/lib/auth/otp";

/**
 * POST /api/auth/register
 * Create account in PENDING state and email a signup OTP.
 * Tokens are issued only after OTP verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();

    const validation = validateSchema(registerSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const validatedData = validation.data;
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUserByEmail && existingUserByEmail.status !== "PENDING") {
      throw createApiError(ErrorCode.EMAIL_ALREADY_EXISTS);
    }

    if (validatedData.phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: validatedData.phone },
      });
      if (
        existingUserByPhone &&
        existingUserByPhone.id !== existingUserByEmail?.id
      ) {
        throw createApiError(ErrorCode.PHONE_ALREADY_EXISTS);
      }
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const otp = generateOtpCode();
    const now = new Date();

    let user;
    if (existingUserByEmail?.status === "PENDING") {
      user = await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone || null,
          companyName: validatedData.companyName || null,
          website: validatedData.website || null,
          emailVerified: false,
          emailOtpHash: hashOtp(otp),
          emailOtpExpiresAt: otpExpiresAt(now),
          emailOtpLastSentAt: now,
          status: "PENDING",
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          phone: validatedData.phone || null,
          status: "PENDING",
          authProvider: "EMAIL",
          emailVerified: false,
          emailOtpHash: hashOtp(otp),
          emailOtpExpiresAt: otpExpiresAt(now),
          emailOtpLastSentAt: now,
          companyName: validatedData.companyName || null,
          website: validatedData.website || null,
        },
      });

      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: "USER",
        },
      });
    }

    try {
      await emailService.sendSignupOtpEmail(
        user.email,
        user.firstName,
        otp
      );
    } catch (e) {
      console.error("Signup OTP email failed:", e);
      return errorResponse(
        "Account created but we could not send the OTP email. Please try Resend OTP.",
        502,
        ErrorCode.SERVICE_UNAVAILABLE,
        undefined
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
      "OTP sent to your email. Please verify to continue.",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);

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
      "Registration failed. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
