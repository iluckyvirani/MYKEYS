import { NextRequest } from "next/server";
import { withAuth, UserRole } from "@/lib/auth/middleware";
import { catalogService } from "@/lib/services/catalogService";
import { successResponse, errorResponse } from "@/lib/response";
import { ErrorCode } from "@/lib/auth/errors";

/**
 * PATCH /api/admin/catalog-services/[id]
 */
export const PATCH = withAuth<{ id: string }>(
  async (req: NextRequest, _user, ctx) => {
    try {
      const id = ctx!.params.id;
      const body = await req.json();
      const updated = await catalogService.update(id, {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.price !== undefined ? { price: Number(body.price) } : {}),
        ...(body.commissionPercent !== undefined
          ? { commissionPercent: Number(body.commissionPercent) }
          : {}),
        ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      });
      return successResponse(updated, "Catalog service updated");
    } catch (err: any) {
      return errorResponse(err.message || "Failed to update", 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);

/**
 * DELETE /api/admin/catalog-services/[id]
 */
export const DELETE = withAuth<{ id: string }>(
  async (_req, _user, ctx) => {
    try {
      const result = await catalogService.remove(ctx!.params.id);
      return successResponse(result, "Catalog service removed");
    } catch (err: any) {
      return errorResponse(err.message || "Failed to delete", 400, ErrorCode.VALIDATION_ERROR);
    }
  },
  { roles: [UserRole.ADMIN] }
);
