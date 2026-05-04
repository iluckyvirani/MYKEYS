import { NextRequest } from "next/server";
import { PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * PATCH /api/owner/properties/[id]/status
 * Update property status (owner only for owned properties)
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;

    try {
      const body = await request.json();
      const statusRaw = String(body?.status || "").toUpperCase();

      const allowedStatuses: PropertyStatus[] = [
        PropertyStatus.ACTIVE,
        PropertyStatus.INACTIVE,
        PropertyStatus.MAINTENANCE,
      ];

      if (!allowedStatuses.includes(statusRaw as PropertyStatus)) {
        return errorResponse(
          `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const existingProperty = await prisma.property.findUnique({
        where: { id },
        select: { id: true, ownerId: true, status: true },
      });

      if (!existingProperty) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      if (existingProperty.ownerId !== user.userId && user.role !== "ADMIN") {
        return errorResponse("You don't have permission to update this property", 403, ErrorCode.FORBIDDEN);
      }

      const updated = await prisma.property.update({
        where: { id },
        data: { status: statusRaw as PropertyStatus },
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });

      return successResponse(updated, "Property status updated successfully");
    } catch (error) {
      console.error("Update owner property status error:", error);
      return errorResponse(
        "Failed to update property status",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER" as any, "ADMIN" as any] }
);
