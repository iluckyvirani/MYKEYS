import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { prisma } from "@/lib/prisma";
import { catalogService } from "@/lib/services/catalogService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

async function getProviderId(userId: string) {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId },
    select: { id: true },
  });
  return provider?.id ?? null;
}

/**
 * POST /api/service/offers
 * Body: { catalogServiceId, offer: boolean }
 */
export const POST = withAuth(
  async (req: NextRequest, user) => {
    try {
      const providerId = await getProviderId(user.userId);
      if (!providerId) {
        return errorResponse("Service provider profile not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      const body = await req.json();
      const catalogServiceId = body.catalogServiceId;
      const offer = body.offer !== false;
      if (!catalogServiceId) {
        return errorResponse("catalogServiceId is required", 400, ErrorCode.VALIDATION_ERROR);
      }
      const result = await catalogService.setOffer(providerId, catalogServiceId, offer);
      return successResponse(result, offer ? "Service offered" : "Offer removed");
    } catch (err: any) {
      return errorResponse(err.message || "Failed", 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.SERVICE, UserRole.ADMIN] }
);
