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
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
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
export const PATCH = withAuth<{ params: { id: string } }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { params } = context!;
    try {
      // Check if property exists and user owns it
      const existingProperty = await prisma.property.findUnique({
        where: { id: params.id },
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
        where: { id: params.id },
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
          ...(body.propertyType && { propertyType: body.propertyType }),
          ...(body.listingType && { listingType: body.listingType }),
          ...(body.rentalType && { rentalType: body.rentalType }),
          ...(body.bedrooms !== undefined && { bedrooms: body.bedrooms }),
          ...(body.bathrooms !== undefined && { bathrooms: body.bathrooms }),
          ...(body.area !== undefined && { area: body.area }),
          ...(body.furnished !== undefined && { furnished: body.furnished }),
          ...(body.parking !== undefined && { parking: body.parking }),
          ...(body.petFriendly !== undefined && { petFriendly: body.petFriendly }),
          ...(body.status && { status: body.status }),
          ...(body.availableFrom && { availableFrom: new Date(body.availableFrom) }),
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
export const DELETE = withAuth<{ params: { id: string } }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    const { params } = context!;
    try {
      // Check if property exists and user owns it
      const existingProperty = await prisma.property.findUnique({
        where: { id: params.id },
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
        where: { id: params.id },
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
