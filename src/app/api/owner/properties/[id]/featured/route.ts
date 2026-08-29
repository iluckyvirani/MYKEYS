import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { packageService } from "@/lib/packages/packageService";

/**
 * PATCH /api/owner/properties/[id]/featured
 * Toggle the featured status of a property.
 * Requires the owner's active package to have featuredLimit > 0.
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { id } = await context!.params;

    try {
      const body = await request.json();
      const isFeatured: boolean = Boolean(body?.isFeatured);

      const property = await prisma.property.findUnique({
        where: { id },
        select: { id: true, ownerId: true, isFeatured: true, listingType: true, rentalType: true },
      });

      if (!property) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      if (property.ownerId !== user.userId && user.role !== "ADMIN") {
        return errorResponse("You don't have permission to update this property", 403, ErrorCode.FORBIDDEN);
      }

      const category =
        property.listingType === "BUY"
          ? ("SALE" as const)
          : property.listingType === "RENT" && property.rentalType !== "SHORT_TERM"
            ? ("RENT" as const)
            : null;

      // ── Featuring: check package allows it ───────────────────────────────
      if (isFeatured && !property.isFeatured) {
        if (user.role !== "ADMIN") {
          if (!category) {
            return errorResponse(
              "Short stay listings cannot use package featured slots.",
              403,
              ErrorCode.FORBIDDEN
            );
          }
          const { allowed, reason } = await packageService.canFeature(property.ownerId, {
            listingType: property.listingType,
            rentalType: property.rentalType,
          });
          if (!allowed) {
            return errorResponse(reason!, 403, ErrorCode.FORBIDDEN);
          }
        }
        if (category) {
          await packageService.incrementFeaturedUsage(property.ownerId, category);
        }
      }

      // ── Unfeaturing: free up the slot ────────────────────────────────────
      if (!isFeatured && property.isFeatured && category) {
        await packageService.decrementFeaturedUsage(property.ownerId, category);
      }

      const updated = await prisma.property.update({
        where: { id },
        data: { isFeatured },
        select: { id: true, isFeatured: true, updatedAt: true },
      });

      return successResponse(
        updated,
        isFeatured ? "Property marked as featured" : "Property removed from featured"
      );
    } catch (error) {
      console.error("Toggle featured error:", error);
      return errorResponse(
        "Failed to update featured status",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER", "AGENT", "ADMIN"] }
);
