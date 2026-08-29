import { NextRequest } from "next/server";
import { PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { packageService } from "@/lib/packages/packageService";
import {
  getPropertyDocumentVerificationState,
  documentVerificationBlockMessage,
} from "@/lib/documents/documentService";
import { maybeNotifyNewListing } from "@/lib/newsletter/service";

/**
 * PATCH /api/owner/properties/[id]/status
 * Update property status (owner only for owned properties)
 * Enforces package limit for LONG_RENT and BUY properties.
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
        select: { id: true, ownerId: true, status: true, listingType: true, rentalType: true },
      });

      if (!existingProperty) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      if (existingProperty.ownerId !== user.userId && user.role !== "ADMIN") {
        return errorResponse("You don't have permission to update this property", 403, ErrorCode.FORBIDDEN);
      }

      // ── Package gate (LONG_RENT and BUY only, not applied to admins) ──────
      const isGated =
        existingProperty.listingType === "BUY" ||
        (existingProperty.listingType === "RENT" && existingProperty.rentalType !== "SHORT_TERM");

      if (statusRaw === "ACTIVE" && user.role !== "ADMIN") {
        const docState = await getPropertyDocumentVerificationState(
          id,
          existingProperty.listingType,
          existingProperty.rentalType
        );
        if (!docState.canActivate) {
          return errorResponse(
            documentVerificationBlockMessage(docState),
            403,
            ErrorCode.FORBIDDEN
          );
        }

        if (isGated) {
          const { allowed, reason } = await packageService.canPublish(
            existingProperty.ownerId,
            {
              listingType: existingProperty.listingType,
              rentalType: existingProperty.rentalType,
            }
          );
          if (!allowed) {
            return errorResponse(reason!, 403, ErrorCode.FORBIDDEN);
          }
          if (existingProperty.status !== "ACTIVE") {
            const category =
              existingProperty.listingType === "BUY" ? "SALE" : "RENT";
            await packageService.incrementPropertyUsage(
              existingProperty.ownerId,
              category
            );
          }
        }
      }

      // ── Decrement slot when deactivating a previously ACTIVE gated property ─
      if (
        statusRaw !== "ACTIVE" &&
        existingProperty.status === "ACTIVE" &&
        isGated &&
        user.role !== "ADMIN"
      ) {
        await packageService.decrementPropertyUsage(
          existingProperty.ownerId,
          existingProperty.listingType === "BUY" ? "SALE" : "RENT"
        );
      }

      const updated = await prisma.property.update({
        where: { id },
        data: { status: statusRaw as PropertyStatus },
        select: { id: true, status: true, updatedAt: true },
      });

      maybeNotifyNewListing({
        previousStatus: existingProperty.status,
        nextStatus: updated.status,
        propertyId: updated.id,
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
  { roles: ["OWNER", "AGENT", "ADMIN"] }
);

