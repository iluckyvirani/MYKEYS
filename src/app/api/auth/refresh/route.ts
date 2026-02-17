import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { refreshTokenSchema, validateSchema } from "@/lib/auth/validation";
import { verifyRefreshToken, generateTokenPair } from "@/lib/auth/jwt";
import { createApiError, ErrorCode } from "@/lib/auth/errors";
import { RefreshTokenRequest, RefreshTokenResponse } from "@/types/auth";

/**
 * POST /api/auth/refresh
 * Generate new access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from body or cookies
    let refreshToken: string | undefined;

    try {
      const body: RefreshTokenRequest = await request.json();
      refreshToken = body.refreshToken;
    } catch {
      // If body parsing fails, try to get from cookies
      refreshToken = request.cookies.get("refreshToken")?.value;
    }

    if (!refreshToken) {
      throw createApiError(
        ErrorCode.INVALID_TOKEN,
        "Refresh token is required"
      );
    }

    // Validate refresh token format
    const validation = validateSchema(refreshTokenSchema, { refreshToken });
    if (!validation.success) {
      return errorResponse(
        "Validation failed",
        400,
        ErrorCode.VALIDATION_ERROR,
        validation.errors
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      throw createApiError(
        ErrorCode.INVALID_TOKEN,
        "Invalid or expired refresh token"
      );
    }

    // Fetch user's current roles from database (to pick up any role changes)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND, "User not found");
    }

    // Get primary role - select highest privilege role
    // Priority: ADMIN > OWNER > USER
    let primaryRole = "USER";
    if (user.roles && user.roles.length > 0) {
      if (user.roles.some((r) => r.role === "ADMIN")) {
        primaryRole = "ADMIN";
      } else if (user.roles.some((r) => r.role === "OWNER")) {
        primaryRole = "OWNER";
      } else {
        primaryRole = "USER";
      }
    }

    // Generate new token pair with current role
    const { accessToken, refreshToken: newRefreshToken } =
      await generateTokenPair(payload.userId, payload.email, primaryRole);

    // Prepare response
    const response: RefreshTokenResponse = {
      accessToken,
      refreshToken: newRefreshToken,
    };

    // Create NextResponse with tokens in cookies
    const nextResponse = successResponse(
      response,
      "Tokens refreshed successfully"
    );

    // Set HTTP-only cookies for new tokens
    nextResponse.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    nextResponse.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Refresh token error:", error);

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
      "Token refresh failed. Please login again.",
      401,
      ErrorCode.INVALID_TOKEN
    );
  }
}
