import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken, generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";
import { ErrorCode, createApiError } from "@/lib/auth/errors";
import { BecomeOwnerResponse } from "@/types/auth";

/**
 * POST /api/users/become-owner
 * Allow a USER to become an OWNER by adding OWNER role
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createApiError(ErrorCode.UNAUTHORIZED);
    }

    const token = authHeader.substring(7);
    const payload = await verifyAccessToken(token);

    if (!payload) {
      throw createApiError(ErrorCode.UNAUTHORIZED);
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Check if user already has OWNER role
    const hasOwnerRole = user.roles.some((r) => r.role === "OWNER");
    if (hasOwnerRole) {
      return errorResponse(
        "User already has OWNER role",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Parse request body for optional owner details
    let companyName, taxId, website;
    try {
      const body = await request.json();
      companyName = body.companyName || null;
      taxId = body.taxId || null;
      website = body.website || null;
    } catch (error) {
      // If body is empty, just ignore
    }

    // Update user with owner details if provided
    if (companyName || taxId || website) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          companyName: companyName || user.companyName,
          taxId: taxId || user.taxId,
          website: website || user.website,
        },
      });
    }

    // Add OWNER role
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        role: "OWNER",
      },
    });

    // Fetch updated user with new roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        roles: true,
      },
    });

    if (!updatedUser) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Convert to DTO
    const userDTO = await toUserDTO(updatedUser);

    // Generate new tokens with OWNER role
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokenPair(
      user.id,
      user.email,
      "OWNER"
    );

    // Prepare response
    const response: BecomeOwnerResponse = {
      success: true,
      message: "You are now an owner! You can start listing properties.",
      data: {
        user: userDTO,
        accessToken: newAccessToken, // New token with OWNER role
        refreshToken: newRefreshToken,
      },
    };

    return successResponse(response.data, response.message, 200);
  } catch (error) {
    console.error("Become owner error:", error);

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
      "Failed to become owner. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
