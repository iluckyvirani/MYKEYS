import { withAuth } from "@/lib/auth/middleware";
import { listSavedPaymentMethods } from "@/lib/stripe/customer";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/payments/saved-methods
 * List saved card payment methods for the authenticated user.
 */
export const GET = withAuth(async (_req, user) => {
  try {
    const methods = await listSavedPaymentMethods(user!.userId);
    return successResponse(methods, "Saved payment methods retrieved");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load payment methods";
    return errorResponse(message, 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});
