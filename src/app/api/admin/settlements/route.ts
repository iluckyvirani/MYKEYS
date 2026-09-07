import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { settlementService } from "@/lib/services/settlementService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";
import { SettlementStatus, SettlementType } from "@prisma/client";

/**
 * GET /api/admin/settlements?type=SERVICE|SHORT_STAY&status=PENDING|SETTLED
 * Syncs short-stay pendings when type is SHORT_STAY.
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const typeParam = req.nextUrl.searchParams.get("type");
      const statusParam = req.nextUrl.searchParams.get("status") || "PENDING";
      const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
      const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);

      const type =
        typeParam === "SERVICE" || typeParam === "SHORT_STAY"
          ? (typeParam as SettlementType)
          : undefined;
      const status =
        statusParam === "SETTLED" || statusParam === "PENDING"
          ? (statusParam as SettlementStatus)
          : undefined;

      const sync = await settlementService.syncShortStayPendings().catch((err) => {
        console.error("syncShortStayPendings failed:", err);
        return { created: 0 };
      });
      if (sync.created > 0) {
        console.log(`Synced ${sync.created} short-stay settlements`);
      }

      const result = await settlementService.list({ type, status, page, limit });
      return successResponse(result, "Settlements retrieved");
    } catch (err: any) {
      return errorResponse(
        err.message || "Failed to list settlements",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
