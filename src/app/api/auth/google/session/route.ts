import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { toUserDTO } from "@/lib/auth/helpers";

/**
 * GET /api/auth/google/session
 * One-time handoff: reads tokens from googleAuthHandoff cookie for localStorage,
 * then clears the handoff cookie.
 */
export async function GET(request: NextRequest) {
  try {
    const raw = request.cookies.get("googleAuthHandoff")?.value;
    if (!raw) {
      return errorResponse(
        "No Google session handoff found. Please sign in again.",
        401,
        ErrorCode.UNAUTHORIZED
      );
    }

    let data: { accessToken: string; refreshToken: string };
    try {
      data = JSON.parse(raw);
    } catch {
      return errorResponse(
        "Invalid Google session handoff",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    if (!data.accessToken || !data.refreshToken) {
      return errorResponse(
        "Incomplete Google session handoff",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const payload = await verifyAccessToken(data.accessToken);
    if (!payload?.userId) {
      return errorResponse(
        "Invalid Google session",
        401,
        ErrorCode.UNAUTHORIZED
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return errorResponse("User not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    const userDTO = await toUserDTO(user);
    const response = successResponse(
      {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: userDTO,
      },
      "Google session ready"
    );

    response.cookies.set("googleAuthHandoff", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google session handoff error:", error);
    return errorResponse(
      "Failed to complete Google Sign-In",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
