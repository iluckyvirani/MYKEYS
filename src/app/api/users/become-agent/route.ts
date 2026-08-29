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
 * POST /api/users/become-agent
 * Allow a USER to become an AGENT by adding AGENT role.
 * If already AGENT, still refresh tokens + return user (client sync).
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

    const hasAgentRole = user.roles.some((r) => r.role === "AGENT");

    let companyName: string | null = null;
    let website: string | null = null;
    let phone: string | null = null;
    try {
      const body = await request.json();
      companyName = body.companyName || null;
      website = body.website || null;
      phone = body.phone || null;
    } catch {
      // empty body ok
    }

    if (companyName || website || phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          companyName: companyName || user.companyName,
          website: website || user.website,
          phone: phone || user.phone,
        },
      });
    }

    if (!hasAgentRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: "AGENT",
        },
      });
    }

    // Clear deprecated seller-type flag if present
    if (user.listingSellerType === "AGENT") {
      await prisma.user.update({
        where: { id: user.id },
        data: { listingSellerType: null },
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
      await generateTokenPair(user.id, user.email, "AGENT");

    const nextResponse = successResponse(
      {
        user: userDTO,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        alreadyAgent: hasAgentRole,
      },
      hasAgentRole
        ? "Agent role synced. You can switch to Agent dashboard."
        : "You are now an agent! You can start listing properties.",
      200
    );

    return setAuthCookies(nextResponse, newAccessToken, newRefreshToken);
  } catch (error) {
    console.error("Become agent error:", error);

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
      "Failed to become agent. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
