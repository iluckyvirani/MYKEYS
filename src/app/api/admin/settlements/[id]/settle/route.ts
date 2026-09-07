import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { settlementService } from "@/lib/services/settlementService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * POST /api/admin/settlements/[id]/settle
 * Body: { note?: string }
 */
export const POST = withAuth<{ id: string }>(
  async (req, user, ctx) => {
    try {
      const body = await req.json().catch(() => ({}));
      const updated = await settlementService.markSettled({
        settlementId: ctx!.params.id,
        adminId: user.userId,
        note: body.note,
      });
      return successResponse(updated, "Marked as settled");
    } catch (err: any) {
      return errorResponse(
        err.message || "Failed to settle",
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
  },
  { roles: [UserRole.ADMIN] }
);
