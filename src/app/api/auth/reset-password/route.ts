import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { resetPasswordSchema, validateSchema } from "@/lib/auth/validation";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { ResetPasswordRequest } from "@/types/auth";

/**
 * POST /api/auth/reset-password
 * Reset password using reset token
 * Note: This implementation assumes you've added resetToken and resetTokenExpiry fields to User model
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ResetPasswordRequest = await request.json();

    // Validate input
    const validation = validateSchema(resetPasswordSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { token, newPassword } = validation.data;

    // Find user with matching reset token and valid expiry
    // Note: You need to add resetToken and resetTokenExpiry fields to your User model
    const users = await prisma.user.findMany({
      where: {
        // resetTokenExpiry: {
        //   gte: new Date(),
        // },
      },
    });

    // Verify token for each user (since we can't query hashed tokens directly)
    let matchedUser = null;
    for (const user of users) {
      // You'll need to retrieve the stored hashed token
      // const isValidToken = await verifyPassword(token, user.resetToken);
      // if (isValidToken) {
      //   matchedUser = user;
      //   break;
      // }
    }

    // For now, without the schema changes, we'll return an error
    // Remove this when you add the fields to the schema
    throw createApiError(
      ErrorCode.INVALID_RESET_TOKEN,
      "Password reset functionality requires schema updates. Please add resetToken and resetTokenExpiry fields to User model."
    );

    // Uncomment below when schema is updated:
    /*
    if (!matchedUser) {
      throw createApiError(ErrorCode.INVALID_RESET_TOKEN);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: matchedUser.id },
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
    */
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
