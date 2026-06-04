import { withAuth } from "@/lib/auth/middleware";
import { detachPaymentMethod } from "@/lib/stripe/customer";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * DELETE /api/payments/saved-methods/[paymentMethodId]
 * Remove a saved payment method from the user's Stripe customer.
 */
export const DELETE = withAuth<{ paymentMethodId: string }>(
  async (_req, user, context) => {
    const { paymentMethodId } = await context!.params;
    try {
      await detachPaymentMethod(user!.userId, paymentMethodId);
      return successResponse(null, "Payment method removed");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove payment method";
      return errorResponse(message, 400, ErrorCode.VALIDATION_ERROR);
    }
  }
);
