import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { catalogService } from "@/lib/services/catalogService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * GET /api/admin/catalog-services
 */
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const categoryId = req.nextUrl.searchParams.get("categoryId") || undefined;
      const activeOnly = req.nextUrl.searchParams.get("activeOnly") === "true";
      const items = await catalogService.list({ categoryId, activeOnly });
      return successResponse(items, "Catalog services retrieved");
    } catch (err: any) {
      return errorResponse(err.message || "Failed to list services", 500, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * POST /api/admin/catalog-services
 */
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const created = await catalogService.create({
        name: body.name,
        description: body.description,
        image: body.image,
        price: Number(body.price),
        commissionPercent: Number(body.commissionPercent ?? 10),
        morningSurcharge: Number(body.morningSurcharge ?? 0),
        afternoonSurcharge: Number(body.afternoonSurcharge ?? 0),
        eveningSurcharge: Number(body.eveningSurcharge ?? 0),
        categoryId: body.categoryId,
        isActive: body.isActive,
        sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
      });
      return successResponse(created, "Catalog service created", 201);
    } catch (err: any) {
      return errorResponse(err.message || "Failed to create service", 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
