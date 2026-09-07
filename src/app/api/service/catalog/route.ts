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
 * GET /api/service/catalog
 * Catalog services for the provider's categories + offer flags
 */
export const GET = withAuth(
  async (_req: NextRequest, user) => {
    try {
      const providerId = await getProviderId(user.userId);
      if (!providerId) {
        return errorResponse("Service provider profile not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
      const items = await catalogService.listForProvider(providerId);
      return successResponse(items, "Catalog retrieved");
    } catch (err: any) {
      return errorResponse(err.message || "Failed", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.SERVICE, UserRole.ADMIN] }
);
