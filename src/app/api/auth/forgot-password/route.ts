import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { forgotPasswordSchema, validateSchema } from "@/lib/auth/validation";
import { generateResetToken, hashResetToken } from "@/lib/auth/password";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { ForgotPasswordRequest } from "@/types/auth";

/**
 * POST /api/auth/forgot-password
 * Request password reset - send reset token to user's email
 * Note: In production, you would send an email with the reset link
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ForgotPasswordRequest = await request.json();

    // Validate input
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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return successResponse(
        null,
        "If an account with that email exists, we've sent password reset instructions."
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = await hashResetToken(resetToken);

    // Set token expiry (1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Store hashed token in database
    // Note: You need to add these fields to your User model
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // You'll need to add these fields to the schema:
        // resetToken: hashedToken,
        // resetTokenExpiry: resetTokenExpiry,
      },
    });

    // TODO: Send email with reset link
    // const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetLink);

    console.log("Password reset token (for development):", resetToken);
    console.log(
      "Reset link:",
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`
    );

    return successResponse(
      // In development, return token. In production, only return success message
      process.env.NODE_ENV === "development" ? { resetToken } : null,
      "If an account with that email exists, we've sent password reset instructions."
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
