import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { changePasswordSchema, validateSchema } from "@/lib/auth/validation";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { ChangePasswordRequest } from "@/types/auth";

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await requireAuth(request);

    // Parse request body
    const body: ChangePasswordRequest = await request.json();

    // Validate input
    const validation = validateSchema(changePasswordSchema, body);
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Fetch user with password
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw createApiError(
        ErrorCode.INVALID_CREDENTIALS,
        "Current password is incorrect"
      );
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      return errorResponse(
        "New password must be different from current password",
        400,
        ErrorCode.INVALID_INPUT
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { password: hashedPassword },
    });

    return successResponse(null, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);

    if (error instanceof Error && "statusCode" in error) {
      const apiError = error as any;
      return errorResponse(
        apiError.message,
        apiError.statusCode,
        apiError.code,
        apiError.errors
      );
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return errorResponse("Unauthorized. Please login.", 401);
    }

    return errorResponse(
      "Failed to change password.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
