import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
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
export const GET = withAuth(
  async (_req: NextRequest, user) => {
    const bids = await getOwnerBids(user!.userId);
    return successResponse(bids, "Bids retrieved successfully");
  },
  { roles: [UserRole.OWNER] }
);

/**
 * POST /api/owner/bids
 * Place a new bid. Creates a Razorpay order for the total cost.
 * Body: { propertyId, zipCode, amount, startDate, endDate }
 */
export const POST = withAuth(
  async (req: NextRequest, user) => {
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
      ownerId: user!.userId,
      zipCode: String(zipCode).trim(),
      amount: Number(amount),
      startDate: start,
      endDate: end,
    };

    const validationError = await validateBidInput(input, settings);
    if (validationError) {
      return errorResponse(validationError, 400, ErrorCode.VALIDATION_ERROR);
    }

    // Calculate total cost for Razorpay order
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const totalCost = parseFloat((Number(amount) * days).toFixed(2));

    // Create Razorpay order
    let razorpayOrder: { id: string } | null = null;
    try {
      const { razorpayInstance } = await import("@/lib/razorpay");
      razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(totalCost * 100), // pence
        currency: "GBP",
        notes: {
          propertyId,
          zipCode,
          ownerId: user!.userId,
          bidType: "property_boost",
        },
      }) as { id: string };
    } catch {
      // Razorpay unavailable in dev — proceed without order
    }

    // Create bid record
    const bid = await createBid(input);

    // Store razorpay order id if we got one
    if (razorpayOrder) {
      const { updateBidPayment } = await import("@/lib/bids/bidService");
      await updateBidPayment(bid.id, { razorpayOrderId: razorpayOrder.id });
    }

    // Also return the current highest bid for this zip for display
    const currentHighest = await getHighestBidForZip(input.zipCode);

    return successResponse(
      {
        bid: { ...bid, razorpayOrderId: razorpayOrder?.id ?? null },
        razorpayOrder,
        currentHighest,
        keyId: process.env.RAZORPAY_KEY_ID ?? "",
      },
      "Bid placed successfully",
      201
    );
  },
  { roles: [UserRole.OWNER] }
);
