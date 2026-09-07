import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { getAllBids } from "@/lib/bids/bidService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/admin/bids
 * Returns all bids with optional filters.
 * Query params: status, zipCode, ownerId, page, limit
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const result = await getAllBids({
      status: searchParams.get("status") ?? undefined,
      zipCode: searchParams.get("zipCode") ?? undefined,
      ownerId: searchParams.get("ownerId") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1"),
      limit: parseInt(searchParams.get("limit") ?? "20"),
    });

    return successResponse(result, "Bids retrieved successfully");
  },
  { roles: [UserRole.ADMIN] }
);
