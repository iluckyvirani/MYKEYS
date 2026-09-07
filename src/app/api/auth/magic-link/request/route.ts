import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import {
  detectDeviceFromUserAgent,
  requestMagicLinkLogin,
} from "@/lib/auth/magicLinkService";

/**
 * POST /api/auth/magic-link/request
 * Send a one-time sign-in link to the user's email (10 min expiry).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim();
    const redirect = String(body?.redirect || "/");
    const timeZone = String(body?.timeZone || "Europe/London").trim();

    if (!email) {
      return errorResponse(
        "Please enter your email address.",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const device =
      String(body?.device || "").trim() ||
      detectDeviceFromUserAgent(request.headers.get("user-agent"));

    const result = await requestMagicLinkLogin({
      email,
      redirect,
      requestMeta: {
        requestedAt: new Date(),
        timeZone: timeZone || "Europe/London",
        device,
      },
    });

    return successResponse(
      result,
      "If an account exists for that email, we sent a sign-in link."
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send sign-in link.";

    if (message === "ACCOUNT_PENDING") {
      return errorResponse(
        "Please verify your email before signing in.",
        403,
        ErrorCode.ACCOUNT_PENDING
      );
    }

    if (message.startsWith("Please wait")) {
      return errorResponse(message, 429, ErrorCode.VALIDATION_ERROR);
    }

    if (
      message.includes("valid email") ||
      message.includes("cannot sign in")
    ) {
      return errorResponse(message, 400, ErrorCode.VALIDATION_ERROR);
    }

    console.error("Magic link request error:", error);
    return errorResponse(
      "Could not send sign-in link. Please try again.",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
