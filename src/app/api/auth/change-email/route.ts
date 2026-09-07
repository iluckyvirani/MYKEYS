import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { emailChangeService } from "@/lib/auth/emailChangeService";

/**
 * GET /api/auth/change-email — current change-email status
 */
export const GET = withAuth(async (_req: NextRequest, user: JWTPayload) => {
  try {
    const status = await emailChangeService.getStatus(user.userId);
    return successResponse(status, "Email change status");
  } catch (error: any) {
    const status = error.status || 500;
    return errorResponse(
      error.message || "Failed to load status",
      status,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * POST /api/auth/change-email
 * body.action: start | verify-old | verify-new | resend | cancel
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const action = String(body.action || "").toLowerCase();

    if (action === "start") {
      const data = await emailChangeService.start(user.userId, body.newEmail);
      return successResponse(
        data,
        "Verification code sent to your current email"
      );
    }

    if (action === "verify-old") {
      const data = await emailChangeService.verifyOld(user.userId, body.otp);
      return successResponse(
        data,
        "Current email verified. Code sent to your new email"
      );
    }

    if (action === "verify-new") {
      const data = await emailChangeService.verifyNew(user.userId, body.otp);
      return successResponse(data, "Email updated successfully");
    }

    if (action === "resend") {
      const data = await emailChangeService.resend(user.userId);
      return successResponse(data, "Verification code resent");
    }

    if (action === "cancel") {
      const data = await emailChangeService.cancel(user.userId);
      return successResponse(data, "Email change cancelled");
    }

    return errorResponse(
      "Invalid action. Use start, verify-old, verify-new, resend, or cancel",
      400,
      ErrorCode.VALIDATION_ERROR
    );
  } catch (error: any) {
    console.error("Change email error:", error);
    const status = error.status || 500;
    return errorResponse(
      error.message || "Failed to change email",
      status,
      status === 400
        ? ErrorCode.VALIDATION_ERROR
        : status === 429
          ? ErrorCode.VALIDATION_ERROR
          : ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
