import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { successResponse, errorResponse } from "@/lib/response";
import { prisma } from "@/lib/prisma";
import { paymentService } from "@/lib/payments/paymentService";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * POST /api/payments/verify-by-intent
 * Body: { stripePaymentIntentId: string }
 * Used after Stripe redirect return when payment id is unknown on the client.
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();
    const stripePaymentIntentId = String(body.stripePaymentIntentId || "").trim();
    if (!stripePaymentIntentId) {
      return errorResponse("stripePaymentIntentId is required", 400);
    }

    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId,
        userId: user.userId,
      },
    });

    if (!payment) {
      return errorResponse("Payment not found for this intent", 404);
    }

    const result = await paymentService.confirmPayment(
      payment.id,
      { stripePaymentIntentId },
      user.userId
    );

    return successResponse(result, "Payment verified");
  } catch (error: any) {
    console.error("POST /api/payments/verify-by-intent error:", error);
    return errorResponse(error.message || "Failed to verify payment", 400);
  }
});
