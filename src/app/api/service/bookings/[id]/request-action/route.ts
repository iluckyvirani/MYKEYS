import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";
import { serviceService } from "@/lib/services/serviceService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * POST /api/service/bookings/[id]/request-action
 * Body: { action: "COMPLETE" | "CANCEL" }
 */
export const POST = withAuth<{ id: string }>(
  async (req: NextRequest, user, ctx) => {
    try {
      const provider = await prisma.serviceProvider.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (!provider) {
        return errorResponse("Provider profile not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      const body = await req.json();
      const action = String(body.action || "").toUpperCase();
      if (action !== "COMPLETE" && action !== "CANCEL") {
        return errorResponse("action must be COMPLETE or CANCEL", 400, ErrorCode.VALIDATION_ERROR);
      }

      const result = await serviceService.requestBookingAction(
        ctx!.params.id,
        provider.id,
        action as "COMPLETE" | "CANCEL"
      );
      return successResponse(result, `OTP sent to client to confirm ${action.toLowerCase()}`);
    } catch (err: any) {
      return errorResponse(err.message || "Failed", 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.SERVICE, UserRole.ADMIN] }
);
