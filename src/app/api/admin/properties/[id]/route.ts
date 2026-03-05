import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const propertyId = request.nextUrl.pathname.split("/").pop();

      if (!propertyId) {
        return errorResponse("Property ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Get property with detailed information
      const propertyData = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          images: true,
          amenities: {
            include: {
              amenity: {
                select: {
                  id: true,
                  name: true,
                  icon: true,
                },
              },
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              inquiries: true,
              favorites: true,
            },
          },
        },
      });

      if (!propertyData) {
        return errorResponse("Property not found", 404, ErrorCode.VALIDATION_ERROR);
      }

      // Get property bookings
      const bookings = await prisma.booking.findMany({
        where: { propertyId: propertyId },
        include: {
          guest: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get property reviews
      const reviews = await prisma.review.findMany({
        where: { propertyId: propertyId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Get property inquiries
      const inquiries = await prisma.inquiry.findMany({
        where: { propertyId: propertyId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      // Calculate average rating
      const avgRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;

      return successResponse(
        {
          property: {
            id: propertyData.id,
            title: propertyData.title,
            slug: propertyData.slug,
            description: propertyData.description,
            address: propertyData.address,
            city: propertyData.city,
            state: propertyData.state,
            country: propertyData.country,
            zipCode: propertyData.zipCode,
            latitude: propertyData.latitude,
            longitude: propertyData.longitude,
            propertyType: propertyData.propertyType,
            listingType: propertyData.listingType,
            rentalType: propertyData.rentalType,
            price: propertyData.price,
            priceType: propertyData.priceType,
            originalPrice: propertyData.originalPrice,
            cleaningFee: propertyData.cleaningFee,
            serviceFee: propertyData.serviceFee,
            securityDeposit: propertyData.securityDeposit,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            sqft: propertyData.sqft,
            guests: propertyData.guests,
            minStay: propertyData.minStay,
            maxStay: propertyData.maxStay,
            yearBuilt: propertyData.yearBuilt,
            checkInTime: propertyData.checkInTime,
            checkOutTime: propertyData.checkOutTime,
            selfCheckIn: propertyData.selfCheckIn,
            parking: propertyData.parking,
            status: propertyData.status,
            isFeatured: propertyData.isFeatured,
            isVerified: propertyData.isVerified,
            views: propertyData.views,
            saves: propertyData.saves,
            occupancy: propertyData.occupancy,
            revenue: propertyData.revenue,
            createdAt: propertyData.createdAt,
            updatedAt: propertyData.updatedAt,
          },
          owner: {
            id: propertyData.owner.id,
            firstName: propertyData.owner.firstName,
            lastName: propertyData.owner.lastName,
            fullName: `${propertyData.owner.firstName} ${propertyData.owner.lastName}`,
            email: propertyData.owner.email,
            phone: propertyData.owner.phone,
            avatar: propertyData.owner.avatar,
          },
          counts: propertyData._count,
          avgRating: parseFloat(avgRating.toFixed(1)),
          images: propertyData.images || [],
          amenities: propertyData.amenities || [],
          bookings,
          reviews,
          inquiries,
        },
        "Property details fetched successfully"
      );
    } catch (error: any) {
      console.error("Error fetching property details:", error);
      return errorResponse(
        error.message || "Failed to fetch property details",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN"] }
);
