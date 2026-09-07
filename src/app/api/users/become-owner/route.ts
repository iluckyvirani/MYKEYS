import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { verifyAccessToken, generateTokenPair } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";
import { ErrorCode, createApiError } from "@/lib/auth/errors";

function setAuthCookies(
  response: ReturnType<typeof successResponse>,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
    path: "/",
  });
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}

/**
 * POST /api/users/become-owner
 * Allow a USER to become an OWNER by adding OWNER role.
 * If already OWNER, still refresh tokens + return user (client sync).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("accessToken")?.value;
    const token =
      authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : cookieToken;

    if (!token) {
      throw createApiError(ErrorCode.UNAUTHORIZED);
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      throw createApiError(ErrorCode.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { roles: true },
    });

    if (!user) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    const hasOwnerRole = user.roles.some((r) => r.role === "OWNER");

    let companyName: string | null = null;
    let taxId: string | null = null;
    let website: string | null = null;
    try {
      const body = await request.json();
      companyName = body.companyName || null;
      taxId = body.taxId || null;
      website = body.website || null;
    } catch {
      // empty body ok
    }

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

    if (!hasOwnerRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: "OWNER",
        },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: true },
    });

    if (!updatedUser) {
      throw createApiError(ErrorCode.USER_NOT_FOUND);
    }

    const userDTO = await toUserDTO(updatedUser);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokenPair(user.id, user.email, "OWNER");

    const nextResponse = successResponse(
      {
        user: userDTO,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        alreadyOwner: hasOwnerRole,
      },
      hasOwnerRole
        ? "Owner role synced. You can switch to Seller/Landlord dashboard."
        : "You are now an owner! You can start listing properties.",
      200
    );

    return setAuthCookies(nextResponse, newAccessToken, newRefreshToken);
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
