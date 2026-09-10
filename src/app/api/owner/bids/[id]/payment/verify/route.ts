import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { confirmBidStripePayment } from "@/lib/bids/bidService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * POST /api/owner/bids/[id]/payment/verify
 * Confirm a Stripe PaymentIntent for a boost and store the charge id.
 */
export const POST = withAuth<{ id: string }>(async (req: NextRequest, user, ctx) => {
  try {
    const bidId = ctx!.params.id;
    const { stripePaymentIntentId } = await req.json();

    if (!stripePaymentIntentId) {
      return errorResponse(
        "stripePaymentIntentId is required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const bid = await confirmBidStripePayment(
      bidId,
      user.userId,
      String(stripePaymentIntentId)
    );
    return successResponse(bid, "Payment confirmed successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to confirm payment";
    const code = msg === "Unauthorized" ? 403 : 400;
    return errorResponse(msg, code, ErrorCode.VALIDATION_ERROR);
  }
});
