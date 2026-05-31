import { readStripePublishableKey } from "@/lib/stripe-config";
import { successResponse, errorResponse } from "@/lib/response";

/**
 * GET /api/payments/stripe-config
 * Returns the Stripe publishable key for client-side Stripe.js (public, safe to expose).
 */
export async function GET() {
  try {
    const publishableKey = readStripePublishableKey();
    return successResponse({ publishableKey }, "Stripe config retrieved");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stripe is not configured";
    return errorResponse(message, 500);
  }
}
