import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const bookingId = request.nextUrl.pathname.split("/").pop();

      if (!bookingId) {
        return errorResponse("Booking ID is required", 400, ErrorCode.VALIDATION_ERROR);
      }

      // Get booking with detailed information
      const bookingData = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              address: true,
              city: true,
              state: true,
              propertyType: true,
              bedrooms: true,
              bathrooms: true,
              price: true,
              priceType: true,
              images: {
                take: 5,
                select: { url: true, isPrimary: true },
              },
              amenities: {
                include: {
                  amenity: {
                    select: { id: true, name: true, icon: true },
                  },
                },
              },
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              address: true,
              city: true,
            },
          },
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
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentMethod: true,
              transactionId: true,
              createdAt: true,
            },
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
            },
          },
        },
      });

      if (!bookingData) {
        return errorResponse("Booking not found", 404, ErrorCode.VALIDATION_ERROR);
      }

      // Calculate number of nights
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      return successResponse(
        {
          booking: {
            id: bookingData.id,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            nights: nights,
            guests: bookingData.guests,
            children: bookingData.children,
            pets: bookingData.pets,
            basePrice: bookingData.basePrice,
            cleaningFee: bookingData.cleaningFee,
            serviceFee: bookingData.serviceFee,
            totalAmount: bookingData.totalAmount,
            paidAmount: bookingData.paidAmount,
            balanceAmount: bookingData.balanceAmount,
            status: bookingData.status,
            paymentStatus: bookingData.paymentStatus,
            paymentMethod: bookingData.paymentMethod,
            specialRequests: bookingData.specialRequests,
            notes: bookingData.notes,
            createdAt: bookingData.createdAt,
            updatedAt: bookingData.updatedAt,
            cancelledAt: bookingData.cancelledAt,
          },
          property: bookingData.property,
          guest: bookingData.guest
            ? {
                id: bookingData.guest.id,
                firstName: bookingData.guest.firstName,
                lastName: bookingData.guest.lastName,
                fullName: `${bookingData.guest.firstName} ${bookingData.guest.lastName}`,
                email: bookingData.guest.email,
                phone: bookingData.guest.phone,
                avatar: bookingData.guest.avatar,
                address: bookingData.guest.address,
                city: bookingData.guest.city,
              }
            : null,
          owner: bookingData.owner
            ? {
                id: bookingData.owner.id,
                firstName: bookingData.owner.firstName,
                lastName: bookingData.owner.lastName,
                fullName: `${bookingData.owner.firstName} ${bookingData.owner.lastName}`,
                email: bookingData.owner.email,
                phone: bookingData.owner.phone,
                avatar: bookingData.owner.avatar,
              }
            : null,
          payment: bookingData.payment,
          review: bookingData.review,
        },
        "Booking details fetched successfully"
      );
    } catch (error: any) {
      console.error("Error fetching booking details:", error);
      return errorResponse(
        error.message || "Failed to fetch booking details",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN"] }
);
