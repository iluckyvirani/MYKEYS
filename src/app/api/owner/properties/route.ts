import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/owner/properties
 * Get all properties for the authenticated owner with booking and revenue stats
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      // Get owner's properties with related data
      const properties = await prisma.property.findMany({
        where: {
          ownerId: user.userId,
        },
        include: {
          images: {
            select: {
              url: true,
              isPrimary: true,
            },
          },
          bookings: {
            select: {
              id: true,
              status: true,
              totalPrice: true,
              checkIn: true,
              checkOut: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculate statistics for each property
      const propertiesWithStats = properties.map((property) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter bookings for current month
        const currentMonthBookings = property.bookings.filter((booking) => {
          const bookingDate = new Date(booking.checkIn);
          return (
            bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear
          );
        });

        // Calculate total bookings count
        const totalBookings = property.bookings.length;
        const confirmedBookings = property.bookings.filter(
          (b) => b.status === "CONFIRMED"
        ).length;

        // Calculate revenue for current month
        const monthlyRevenue = currentMonthBookings.reduce(
          (sum, booking) => sum + (booking.totalPrice || 0),
          0
        );

        // Calculate occupancy rate for current month (simplified)
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const bookedDays = currentMonthBookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          const days = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0);
        const occupancyRate = Math.round((bookedDays / daysInMonth) * 100);

        // Calculate average rating
        const avgRating =
          property.reviews.length > 0
            ? property.reviews.reduce((sum, r) => sum + r.rating, 0) /
              property.reviews.length
            : 0;

        // Get last booking date
        const lastBooking =
          property.bookings.length > 0
            ? new Date(
                Math.max(...property.bookings.map((b) => new Date(b.checkIn).getTime()))
              )
            : null;

        // Get primary image
        const primaryImage =
          property.images.find((img) => img.isPrimary)?.url ||
          property.images[0]?.url ||
          null;

        return {
          id: property.id,
          name: property.title,
          location: `${property.city}, ${property.state}`,
          type: property.propertyType,
          status: property.status.toLowerCase(),
          price: property.price,
          priceType: property.priceType,
          occupancy: Math.max(0, Math.min(100, occupancyRate)), // Ensure 0-100 range
          rating: Math.round(avgRating * 10) / 10,
          reviews: property.reviews.length,
          bookings: totalBookings,
          revenue: monthlyRevenue,
          lastBooking: lastBooking ? lastBooking.toISOString() : null,
          image: primaryImage,
          // Include full property data for detail view
          fullData: {
            ...property,
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: property.reviews.length,
            totalBookings,
            confirmedBookings,
          },
        };
      });

      return successResponse(
        propertiesWithStats,
        "Owner properties retrieved successfully"
      );
    } catch (error) {
      console.error("Get owner properties error:", error);
      return errorResponse(
        "Failed to retrieve owner properties",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
);
