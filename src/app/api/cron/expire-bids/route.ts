import { NextRequest } from "next/server";
import { processBidExpiry } from "@/lib/bids/bidService";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";

/**
 * GET /api/cron/expire-bids
 * Daily cron job:
 *  1. Marks bids whose endDate has passed as EXPIRED.
 *  2. Sends notifications to owners whose bids expire within 2 days.
 *
 * Secured by CRON_SECRET env var.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const { expiredCount, expiringSoon } = await processBidExpiry();

    // Notifications for bids expiring within 2 days
    for (const { bid, ownerEmail: _email } of expiringSoon) {
      const expiryStr = new Date(bid.endDate).toLocaleDateString("en-GB");
      await prisma.notification
        .create({
          data: {
            userId: bid.ownerId,
            type: "BID_EXPIRY_WARNING",
            title: "Boost Expiring Soon",
            message: `Your boost for "${bid.propertyTitle}" in ${bid.zipCode} expires on ${expiryStr}. Place a new bid to keep your top placement.`,
            data: {
              bidId: bid.id,
              propertyId: bid.propertyId,
              zipCode: bid.zipCode,
              expiryDate: bid.endDate,
            },
            actionUrl: `/owner/dashboard/properties/${bid.propertyId}/boost`,
          },
        })
        .catch(() => {
          /* non-fatal */
        });
    }

    return successResponse(
      { expiredCount, expiringSoonCount: expiringSoon.length },
      "Bid expiry job completed"
    );
  } catch (err: unknown) {
    console.error("[cron/expire-bids]", err);
    return errorResponse("Internal server error", 500);
  }
}
