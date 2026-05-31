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
 * Place a new bid. Creates a Razorpay order for the total cost.
 * Body: { propertyId, zipCode, amount, startDate, endDate }
 */
export const POST = withAuth(async (req: NextRequest, user) => {
    const body = await req.json();
    const { propertyId, zipCode, amount, startDate, endDate } = body;

    if (!propertyId || !zipCode || !amount || !startDate || !endDate) {
      return errorResponse(
        "propertyId, zipCode, amount, startDate, and endDate are required",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return errorResponse("Invalid date format", 400, ErrorCode.VALIDATION_ERROR);
    }

    const settings = await getAdminSettings();

    const input: PlaceBidInput = {
      propertyId,
      ownerId: user.userId,
      zipCode: String(zipCode).trim(),
      amount: Number(amount),
      startDate: start,
      endDate: end,
    };

    const validationError = await validateBidInput(input, settings);
    if (validationError) {
      return errorResponse(validationError, 400, ErrorCode.VALIDATION_ERROR);
    }

    // Calculate total cost for Stripe PaymentIntent
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const totalCost = parseFloat((Number(amount) * days).toFixed(2));

    // Create Stripe PaymentIntent
    let stripeClientSecret: string | null = null;
    let stripePaymentIntentId: string | null = null;
    try {
      const { stripe, toPence } = await import("@/lib/stripe");
      const intent = await stripe.paymentIntents.create({
        amount: toPence(totalCost),
        currency: "gbp",
        automatic_payment_methods: { enabled: true },
        metadata: {
          propertyId,
          zipCode,
          ownerId: user.userId,
          bidType: "property_boost",
        },
      });
      stripeClientSecret = intent.client_secret;
      stripePaymentIntentId = intent.id;
    } catch {
      // Stripe unavailable in dev — proceed without intent
    }

    // Create bid record
    const bid = await createBid(input);

    // Store stripe intent id if we got one
    if (stripePaymentIntentId) {
      const { updateBidPayment } = await import("@/lib/bids/bidService");
      await updateBidPayment(bid.id, { stripePaymentIntentId });
    }

    // Also return the current highest bid for this zip for display
    const currentHighest = await getHighestBidForZip(input.zipCode);

    return successResponse(
      {
        bid: { ...bid, stripePaymentIntentId: stripePaymentIntentId ?? null },
        clientSecret: stripeClientSecret,
        currentHighest,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
      },
      "Bid placed successfully",
      201
    );
});
