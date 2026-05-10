import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { cancelBid, updateBidPayment } from "@/lib/bids/bidService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * POST /api/owner/bids/[id]/payment/verify
 * Verify Razorpay payment signature and mark bid as paid.
 */
export const POST = withAuth<{ id: string }>(
  async (req: NextRequest, user, ctx) => {
    const bidId = ctx!.params.id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return errorResponse(
        "razorpayOrderId, razorpayPaymentId, and razorpaySignature are required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Verify signature
    const crypto = await import("crypto");
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpaySignature) {
      return errorResponse("Invalid payment signature", 400, ErrorCode.VALIDATION_ERROR);
    }

    const bid = await updateBidPayment(bidId, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return successResponse(bid, "Payment verified successfully");
  },
  { roles: [UserRole.OWNER] }
);

/**
 * DELETE /api/owner/bids/[id]
 * Cancel a bid (within 1-hour grace window).
 */
export const DELETE = withAuth<{ id: string }>(
  async (_req: NextRequest, user, ctx) => {
    try {
      const bid = await cancelBid(ctx!.params.id, user!.userId);
      return successResponse(bid, "Bid cancelled successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel bid";
      return errorResponse(msg, 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.OWNER] }
);
