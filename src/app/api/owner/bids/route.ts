import { NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import {
  getOwnerBids,
  createBid,
  validateBidInput,
  getAdminSettings,
  getHighestBidForZip,
  PlaceBidInput,
} from "@/lib/bids/bidService";
import { readStripePublishableKey } from "@/lib/stripe-config";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/owner/bids
 * Return all bids placed by the authenticated owner.
 */
export const GET = withAuth(async (_req: NextRequest, user) => {
  const bids = await getOwnerBids(user.userId);
  return successResponse(bids, "Bids retrieved successfully");
});

/**
 * POST /api/owner/bids
 * Place a same-day boost bid (valid until end of today).
 * Owners may raise the amount unlimited times during the day.
 * Body: { propertyId, zipCode, amount }
 */
export const POST = withAuth(async (req: NextRequest, user) => {
    const body = await req.json();
    const { propertyId, zipCode, amount } = body;

    if (!propertyId || !zipCode || amount === undefined || amount === null) {
      return errorResponse(
        "propertyId, zipCode, and amount are required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const settings = await getAdminSettings();

    const input: PlaceBidInput = {
      propertyId,
      ownerId: user.userId,
      zipCode: String(zipCode).trim(),
      amount: Number(amount),
    };

    const validationError = await validateBidInput(input, settings);
    if (validationError) {
      return errorResponse(validationError, 400, ErrorCode.VALIDATION_ERROR);
    }

    // Same-day boost: total cost = bid amount for today
    const totalCost = parseFloat(Number(amount).toFixed(2));

    // Create Stripe PaymentIntent
    let stripeClientSecret: string | null = null;
    let stripePaymentIntentId: string | null = null;
    try {
      const { stripe, toPence } = await import("@/lib/stripe");
      const { withStripeCustomerForPayment } = await import("@/lib/stripe/customer");
      const intent = await stripe.paymentIntents.create(
        await withStripeCustomerForPayment(user.userId, {
          amount: toPence(totalCost),
          currency: "gbp",
          automatic_payment_methods: { enabled: true },
          metadata: {
            propertyId,
            zipCode,
            ownerId: user.userId,
            bidType: "property_boost",
            duration: "same_day",
          },
        })
      );
      stripeClientSecret = intent.client_secret;
      stripePaymentIntentId = intent.id;
    } catch {
      // Stripe unavailable in dev — proceed without intent
    }

    // Create bid record (always today only)
    const bid = await createBid(input);

    // Store stripe intent id if we got one
    if (stripePaymentIntentId) {
      const { updateBidPayment } = await import("@/lib/bids/bidService");
      await updateBidPayment(bid.id, { stripePaymentIntentId });
    }

    // Also return the current highest bid for this zip for display
    const currentHighest = await getHighestBidForZip(input.zipCode);

    let publishableKey = "";
    try {
      publishableKey = readStripePublishableKey();
    } catch {
      // Client can fall back to /api/payments/stripe-config
    }

    return successResponse(
      {
        bid: { ...bid, stripePaymentIntentId: stripePaymentIntentId ?? null },
        clientSecret: stripeClientSecret,
        currentHighest,
        publishableKey,
      },
      "Bid placed successfully",
      201
    );
});
