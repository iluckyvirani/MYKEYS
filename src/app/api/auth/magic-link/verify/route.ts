import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { consumeMagicLinkToken } from "@/lib/auth/magicLinkService";

/**
 * POST /api/auth/magic-link/verify
 * Consume a one-time sign-in token and return session tokens.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || "").trim();

    if (!token) {
      return errorResponse(
        "Missing sign-in token.",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const { user, accessToken, refreshToken } =
      await consumeMagicLinkToken(token);

    const response = successResponse(
      { user, accessToken, refreshToken },
      "Signed in successfully"
    );

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
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid or expired sign-in link.";

    if (message === "ACCOUNT_PENDING") {
      return errorResponse(
        "Please verify your email before signing in.",
        403,
        ErrorCode.ACCOUNT_PENDING
      );
    }

    if (
      message.includes("suspended") ||
      message.includes("inactive") ||
      message.includes("Invalid") ||
      message.includes("expired")
    ) {
      return errorResponse(message, 401, ErrorCode.UNAUTHORIZED);
    }

    console.error("Magic link verify error:", error);
    return errorResponse(
      "Could not complete sign-in. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
