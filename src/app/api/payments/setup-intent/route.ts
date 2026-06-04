import { withAuth } from "@/lib/auth/middleware";
import { createSetupIntent } from "@/lib/stripe/customer";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * POST /api/payments/setup-intent
 * Create a SetupIntent so the user can save a card without making a payment.
 */
export const POST = withAuth(async (_req, user) => {
  try {
    const clientSecret = await createSetupIntent(user!.userId);
    return successResponse({ clientSecret }, "Setup intent created");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare card setup";
    return errorResponse(message, 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});
