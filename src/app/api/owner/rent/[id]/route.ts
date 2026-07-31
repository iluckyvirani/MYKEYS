import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { rentManagementService } from "@/lib/rent/rentManagementService";

/**
 * PATCH /api/owner/rent/[id]
 * End an active tenancy (property stays draft until owner republishes).
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;
    try {
      const body = await request.json().catch(() => ({}));
      const action = String(body?.action || "end").toLowerCase();

      if (action !== "end") {
        return errorResponse(
          "Unsupported action. Use action: end",
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const tenancy = await rentManagementService.endTenancy(user.userId, id);
      return successResponse(tenancy, "Tenancy ended");
    } catch (error: any) {
      console.error("Owner rent PATCH error:", error);
      const status = error.status || 500;
      return errorResponse(
        error.message || "Failed to update tenancy",
        status,
        status === 400
          ? ErrorCode.VALIDATION_ERROR
          : status === 404
            ? ErrorCode.RESOURCE_NOT_FOUND
            : ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER" as any, "ADMIN" as any] }
);
