import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { cancelBid } from "@/lib/bids/bidService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * PATCH /api/admin/bids/[id]/cancel
 * Admin cancels a bid (bypasses the 1-hour grace window).
 */
export const PATCH = withAuth<{ id: string }>(
  async (_req: NextRequest, _user, ctx) => {
    try {
      const bid = await cancelBid(ctx!.params.id, null); // null = admin
      return successResponse(bid, "Bid cancelled by admin");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel bid";
      return errorResponse(msg, 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
