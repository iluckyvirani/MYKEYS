import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/admin/bookings
 * Get all bookings for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, paymentStatus, propertyId, guestId, ownerId, from, to, searchTerm, sortBy, sortOrder
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const pageSize = parseInt(searchParams.get("pageSize") || "10");
      const skip = (page - 1) * pageSize;

      // Sorting
      const sortBy = searchParams.get("sortBy") || "createdAt";
      const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

      // Filters
      const status = searchParams.get("status");
      const paymentStatus = searchParams.get("paymentStatus");
      const propertyId = searchParams.get("propertyId");
      const guestId = searchParams.get("guestId");
      const ownerId = searchParams.get("ownerId");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const searchTerm = searchParams.get("searchTerm");

      // Build where clause
      const where: any = {};

      if (status && status !== "ALL") where.status = status;
      if (paymentStatus && paymentStatus !== "ALL") where.paymentStatus = paymentStatus;
      if (propertyId) where.propertyId = propertyId;
      if (guestId) where.guestId = guestId;
      if (ownerId) {
        where.property = {
          ownerId,
        };
      }

      if (from || to) {
        where.checkIn = {};
        if (from) where.checkIn.gte = new Date(from);
        if (to) where.checkIn.lte = new Date(to);
      }

      // Search by booking ID, property title, or guest name
      if (searchTerm) {
        where.OR = [
          { id: { contains: searchTerm, mode: "insensitive" } },
          { property: { title: { contains: searchTerm, mode: "insensitive" } } },
          {
            guest: {
              OR: [
                { firstName: { contains: searchTerm, mode: "insensitive" } },
                { lastName: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === "checkIn") {
        orderBy.checkIn = sortOrder;
      } else if (sortBy === "amount") {
        orderBy.totalAmount = sortOrder;
      } else if (sortBy === "status") {
        orderBy.status = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get bookings with pagination
      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            property: {
              select: {
                id: true,
                title: true,
                ownerId: true,
              },
            },
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        prisma.booking.count({ where }),
      ]);

      // Transform data to DTO format
      const bookingDTOs = bookings.map((b: any) => {
        const nights = Math.ceil(
          (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          id: b.id,
          propertyId: b.property?.id,
          propertyTitle: b.property?.title,
          guestId: b.guest?.id,
          guestName: `${b.guest?.firstName} ${b.guest?.lastName}`,
          guestEmail: b.guest?.email,
          guestPhone: b.guest?.phone,
          ownerId: b.property?.ownerId,
          ownerName: b.owner ? `${b.owner.firstName} ${b.owner.lastName}` : "N/A",
          checkInDate: b.checkIn.toISOString().split("T")[0],
          checkOutDate: b.checkOut.toISOString().split("T")[0],
          nights,
          numberOfGuests: b.guests,
          basePrice: b.basePrice,
          cleaningFee: b.cleaningFee || 0,
          serviceFee: b.serviceFee || 0,
          totalAmount: b.totalAmount,
          paidAmount: b.paidAmount || 0,
          balanceAmount: b.totalAmount - (b.paidAmount || 0),
          status: b.status,
          paymentStatus: b.paymentStatus,
          paymentMethod: b.paymentMethod,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      });

      return paginatedResponse(
        bookingDTOs,
        total,
        page,
        pageSize,
        "Bookings retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin bookings error:", error);
      return errorResponse(
        "Failed to retrieve bookings",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/bookings
 * Update booking status (for admin actions)
 * Body: { bookingId: string, status?: string, paymentStatus?: string, notes?: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { bookingId, status, paymentStatus, notes } = await request.json();

      if (!bookingId) {
        return errorResponse("bookingId is required", 400);
      }

      const updateData: any = {};
      if (notes) updateData.adminNotes = notes;
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      if (Object.keys(updateData).length === 0) {
        return errorResponse("At least one field to update is required", 400);
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
        include: {
          property: { select: { title: true } },
          guest: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      return successResponse(updatedBooking, "Booking updated successfully");
    } catch (error: any) {
      console.error("Update booking error:", error);
      if (error.code === "P2025") {
        return errorResponse("Booking not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update booking",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
