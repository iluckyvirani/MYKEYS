import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { subscribeToNewsletter } from "@/lib/newsletter/service";

/**
 * POST /api/newsletter/subscribe
 * Public — footer "Stay Updated" form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim();

    if (!email) {
      return errorResponse("Email is required", 400, ErrorCode.VALIDATION_ERROR);
    }

    const result = await subscribeToNewsletter(email);

    return successResponse(
      { email: result.subscriber.email, alreadySubscribed: result.alreadySubscribed },
      result.alreadySubscribed
        ? "You are already subscribed"
        : "Subscribed successfully — we will email you when new properties go live",
      result.alreadySubscribed ? 200 : 201
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to subscribe";
    if (message.includes("valid email")) {
      return errorResponse(message, 400, ErrorCode.VALIDATION_ERROR);
    }
    console.error("Newsletter subscribe error:", error);
    return errorResponse(
      "Failed to subscribe",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
