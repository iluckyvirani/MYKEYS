import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { cancelBid, updateBidPayment } from "@/lib/bids/bidService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/owner/bids/[id]/payment/verify
 * Confirm a Stripe PaymentIntent for a bid and mark it as paid.
 */
export const POST = withAuth<{ id: string }>(async (req: NextRequest, user, ctx) => {
    const bidId = ctx!.params.id;
    const { stripePaymentIntentId } = await req.json();

    if (!stripePaymentIntentId) {
      return errorResponse(
        "stripePaymentIntentId is required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Retrieve and verify the PaymentIntent from Stripe
    const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    if (intent.status !== "succeeded") {
      return errorResponse(
        `Payment has not succeeded (status: ${intent.status})`,
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const chargeId =
      typeof intent.latest_charge === "string"
        ? intent.latest_charge
        : (intent.latest_charge as any)?.id ?? null;

    const bid = await updateBidPayment(bidId, {
      stripePaymentIntentId,
      stripeChargeId: chargeId ?? undefined,
    });

    return successResponse(bid, "Payment confirmed successfully");
});

/**
 * DELETE /api/owner/bids/[id]
 * Cancel a bid (within 1-hour grace window).
 */
export const DELETE = withAuth<{ id: string }>(async (_req: NextRequest, user, ctx) => {
  try {
    const bid = await cancelBid(ctx!.params.id, user.userId);
    return successResponse(bid, "Bid cancelled successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to cancel bid";
    return errorResponse(msg, 400, ErrorCode.VALIDATION_ERROR);
  }
});
