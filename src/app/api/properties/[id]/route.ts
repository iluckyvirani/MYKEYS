import { NextRequest } from "next/server";
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
import { getBlockedDateRanges } from "@/lib/bookings/bookingAvailabilityQueries";

/**
 * GET /api/properties/[id]
 * Get property by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
            avatar: true,
            website: true,
            city: true,
            address: true,
            listingSellerType: true,
            agentLogo: true,
          },
        },
        images: {
          orderBy: {
            isPrimary: "desc",
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!property) {
      return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Align with list API: ACTIVE listings stay publicly viewable unless docs were rejected.
    // Pending verification should not blank the detail page after a search result click.
    if (property.status === "ACTIVE") {
      const docState = await getPropertyDocumentVerificationState(
        property.id,
        property.listingType,
        property.rentalType
      );
      if (docState.hasRejected) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }
    } else {
      // Non-active listings are not publicly viewable
      return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Fetch owner's active package to determine contact visibility
    const ownerSub = await prisma.ownerPackage.findFirst({
      where: { ownerId: property.ownerId, status: 'ACTIVE', endDate: { gt: new Date() } },
      select: { package: { select: { showOwnerName: true, showOwnerPhone: true } } },
    });

    const ownerVisibility = {
      showName:  ownerSub?.package?.showOwnerName  ?? false,
      showPhone: ownerSub?.package?.showOwnerPhone ?? false,
    };

    // Mask owner fields based on package flags
    const isAgent = property.owner?.listingSellerType === "AGENT";
    const maskedOwner = property.owner
      ? {
          id: property.owner.id,
          avatar: property.owner.avatar,
          agentLogo: property.owner.agentLogo,
          listingSellerType: property.owner.listingSellerType,
          companyName: property.owner.companyName,
          website: property.owner.website,
          city: property.owner.city,
          address: property.owner.address,
          // Names when package allows, or always show company for agents
          firstName: ownerVisibility.showName ? property.owner.firstName : undefined,
          lastName: ownerVisibility.showName ? property.owner.lastName : undefined,
          email: ownerVisibility.showName ? property.owner.email : undefined,
          // Agents always show phone when set; otherwise package gate
          phone:
            ownerVisibility.showPhone || isAgent
              ? property.owner.phone
              : undefined,
        }
      : null;

    // Calculate average rating
    const avgRating =
      property.reviews.length > 0
        ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          property.reviews.length
        : 0;

    const blockedDateRanges = await getBlockedDateRanges(id);

    const propertyWithRating = {
      ...property,
      owner: maskedOwner,
      ownerVisibility,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: property.reviews.length,
      blockedDateRanges,
    };

    return successResponse(propertyWithRating, "Property retrieved successfully");
  } catch (error) {
    console.error("Get property error:", error);
    return errorResponse(
      "Failed to retrieve property",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * PATCH /api/properties/[id]
 * Update property (Owner/Admin only)
 */
export const PATCH = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const id = context!.params.id;
    try {
      // Check if property exists and user owns it
      const existingProperty = await prisma.property.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Check ownership (unless admin)
      if (
        user.role !== "ADMIN" &&
        existingProperty.ownerId !== user.userId
      ) {
        return errorResponse(
          "You don't have permission to update this property",
          403,
          ErrorCode.FORBIDDEN
        );
      }

      const body = await request.json();

      // ─── Publishing gate ────────────────────────────────────────────────
      // LONG_RENT and BUY properties require an active package to go ACTIVE.
      // SHORT_TERM (rentalType = SHORT_TERM) can publish freely.
      if (body.status === 'ACTIVE' && user.role !== 'ADMIN') {
        const effectiveListingType = body.listingType ?? existingProperty.listingType;
        const effectiveRentalType  = body.rentalType  ?? existingProperty.rentalType;

        const docState = await getPropertyDocumentVerificationState(
          id,
          effectiveListingType,
          effectiveRentalType
        );
        if (!docState.canActivate) {
          return errorResponse(
            documentVerificationBlockMessage(docState),
            403,
            ErrorCode.FORBIDDEN
          );
        }

        const needsPackage =
          effectiveListingType === 'BUY' ||
          (effectiveListingType === 'RENT' && effectiveRentalType !== 'SHORT_TERM');

        if (needsPackage) {
          const { allowed, reason } = await packageService.canPublish(existingProperty.ownerId);
          if (!allowed) {
            return errorResponse(reason!, 403, ErrorCode.FORBIDDEN);
          }
          if (existingProperty.status !== 'ACTIVE') {
            await packageService.incrementPropertyUsage(existingProperty.ownerId);
          }
        }
      }

      // If an ACTIVE property is being deactivated, decrement package usage
      if (
        body.status &&
        body.status !== 'ACTIVE' &&
        existingProperty.status === 'ACTIVE' &&
        user.role !== 'ADMIN'
      ) {
        const effectiveListingType = existingProperty.listingType;
        const effectiveRentalType  = existingProperty.rentalType;
        const hadPackageGate =
          effectiveListingType === 'BUY' ||
          (effectiveListingType === 'RENT' && effectiveRentalType !== 'SHORT_TERM');
        if (hadPackageGate) {
          await packageService.decrementPropertyUsage(existingProperty.ownerId);
        }
      }
      // ────────────────────────────────────────────────────────────────────

      // Update property
      const property = await prisma.property.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.address && { address: body.address }),
          ...(body.city && { city: body.city }),
          ...(body.state && { state: body.state }),
          ...(body.country && { country: body.country }),
          ...(body.zipCode && { zipCode: body.zipCode }),
          ...(body.latitude && { latitude: body.latitude }),
          ...(body.longitude && { longitude: body.longitude }),
          ...(body.price !== undefined && { price: body.price }),
          ...(body.originalPrice !== undefined && { originalPrice: body.originalPrice }),
          ...(body.priceType && { priceType: body.priceType }),
          ...(body.propertyType && { propertyType: body.propertyType }),
          ...(body.listingType && { listingType: body.listingType }),
          ...(body.rentalType && { rentalType: body.rentalType }),
          ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms }),
          ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms }),
          ...(body.sqft !== undefined && { sqft: body.sqft }),
          ...(body.guests !== undefined && { guests: body.guests }),
          ...(body.minStay !== undefined && { minStay: body.minStay }),
          ...(body.maxStay !== undefined && { maxStay: body.maxStay }),
          ...(body.parking !== undefined && { parking: body.parking }),
          ...(body.cleaningFee !== undefined && { cleaningFee: body.cleaningFee }),
          ...(body.serviceFee !== undefined && { serviceFee: body.serviceFee }),
          ...(body.securityDeposit !== undefined && { securityDeposit: body.securityDeposit }),
          ...(body.yearBuilt !== undefined && { yearBuilt: body.yearBuilt }),
          ...(body.checkInTime !== undefined && { checkInTime: body.checkInTime }),
          ...(body.checkOutTime !== undefined && { checkOutTime: body.checkOutTime }),
          ...(body.selfCheckIn !== undefined && { selfCheckIn: body.selfCheckIn }),
          ...(body.availableFrom !== undefined && {
            availableFrom: body.availableFrom ? new Date(body.availableFrom) : null,
          }),
          ...(body.minTerm !== undefined && { minTerm: body.minTerm }),
          ...(body.maxTerm !== undefined && { maxTerm: body.maxTerm }),
          ...(body.billsIncluded !== undefined && { billsIncluded: body.billsIncluded }),
          ...(body.occupancyType !== undefined && {
            occupancyType:
              body.occupancyType === "ROOM"
                ? "ROOM"
                : body.occupancyType === "WHOLE_PROPERTY"
                ? "WHOLE_PROPERTY"
                : null,
          }),
          ...(body.councilTaxBand !== undefined && { councilTaxBand: body.councilTaxBand || null }),
          ...(body.epcRating !== undefined && { epcRating: body.epcRating || null }),
          ...(body.epcCurrentScore !== undefined && {
            epcCurrentScore:
              body.epcCurrentScore === "" || body.epcCurrentScore == null
                ? null
                : parseInt(body.epcCurrentScore, 10),
          }),
          ...(body.epcPotentialScore !== undefined && {
            epcPotentialScore:
              body.epcPotentialScore === "" || body.epcPotentialScore == null
                ? null
                : parseInt(body.epcPotentialScore, 10),
          }),
          ...(body.furnishType !== undefined && { furnishType: body.furnishType || null }),
          ...(body.garden !== undefined && { garden: body.garden || null }),
          ...(body.parkingType !== undefined && { parkingType: body.parkingType || null }),
          ...(body.accessibility !== undefined && { accessibility: body.accessibility || null }),
          ...(body.keyFeatures !== undefined && {
            keyFeatures: Array.isArray(body.keyFeatures)
              ? body.keyFeatures.filter((f: string) => String(f).trim())
              : [],
          }),
          ...(body.utilities !== undefined && { utilities: body.utilities }),
          ...(body.broadbandSpeed !== undefined && {
            broadbandSpeed: body.broadbandSpeed || null,
          }),
          ...(body.floodRisk !== undefined && { floodRisk: body.floodRisk || null }),
          ...(body.propertyPrice !== undefined && { propertyPrice: body.propertyPrice }),
          ...(body.propertyTax !== undefined && { propertyTax: body.propertyTax }),
          ...(body.hoaFee !== undefined && { hoaFee: body.hoaFee }),
          ...(body.leasehold !== undefined && { leasehold: body.leasehold }),
          ...(body.leaseYears !== undefined && { leaseYears: body.leaseYears }),
          ...(body.groundRent !== undefined && { groundRent: body.groundRent }),
          ...(body.occupancy !== undefined && { occupancy: body.occupancy }),
          ...(body.revenue !== undefined && { revenue: body.revenue }),
          ...(body.status && { status: body.status }),
        },
        include: {
          images: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      return successResponse(property, "Property updated successfully");
    } catch (error) {
      console.error("Update property error:", error);
      return errorResponse(
        "Failed to update property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER" as any, "ADMIN" as any] }
);

/**
 * DELETE /api/properties/[id]
 * Delete property (Owner/Admin only)
 */
export const DELETE = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const id = context!.params.id;
    try {
      // Check if property exists and user owns it
      const existingProperty = await prisma.property.findUnique({
        where: { id },
      });

      if (!existingProperty) {
        return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Check ownership (unless admin)
      if (
        user.role !== "ADMIN" &&
        existingProperty.ownerId !== user.userId
      ) {
        return errorResponse(
          "You don't have permission to delete this property",
          403,
          ErrorCode.FORBIDDEN
        );
      }

      // Delete property (cascade will delete related records)
      await prisma.property.delete({
        where: { id },
      });

      return successResponse(null, "Property deleted successfully");
    } catch (error) {
      console.error("Delete property error:", error);
      return errorResponse(
        "Failed to delete property",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["OWNER" as any, "ADMIN" as any] }
);
