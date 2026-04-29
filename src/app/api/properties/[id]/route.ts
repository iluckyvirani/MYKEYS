import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

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
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "CHECKED_IN"],
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!property) {
      return errorResponse("Property not found", 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Calculate average rating
    const avgRating =
      property.reviews.length > 0
        ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          property.reviews.length
        : 0;

    const propertyWithRating = {
      ...property,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: property.reviews.length,
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
    const { id } = await context!.params;
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
    const { id } = await context!.params;
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
