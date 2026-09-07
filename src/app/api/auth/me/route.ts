import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { requireAuth } from "@/lib/auth/middleware";
import { toUserDTO, authUserSelect } from "@/lib/auth/helpers";
import { createApiError, ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authUser = await requireAuth(request);

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: authUserSelect,
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Convert to DTO (exclude password)
    const userDTO = await toUserDTO(user);

    return successResponse(userDTO, "User profile retrieved successfully");
  } catch (error) {
    console.error("Get profile error:", error);

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
      "Failed to retrieve profile.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
