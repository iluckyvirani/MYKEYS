import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { paymentService } from "@/lib/payments/paymentService";

/**
 * GET /api/admin/payments
 * Get all payments for admin dashboard with filters and pagination
 * Roles: ADMIN only
 * Query params: page, pageSize, status, paymentMethod, from, to, userId, bookingId, search, sortBy, sortOrder
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      await paymentService.expireStalePendingTransactions().catch((e) =>
        console.error("expireStalePendingTransactions:", e)
      );

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
      const paymentMethod = searchParams.get("paymentMethod");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const userId = searchParams.get("userId");
      const bookingId = searchParams.get("bookingId");
      const search = searchParams.get("search");

      // Build where clause
      const where: any = {};

      if (status && status !== "ALL") where.status = status;
      if (paymentMethod && paymentMethod !== "ALL")
        where.paymentMethod = paymentMethod;
      if (userId) where.userId = userId;
      if (bookingId) where.bookingId = bookingId;

      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      if (search) {
        where.OR = [
          { transactionId: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      if (sortBy === "amount") {
        orderBy.amount = sortOrder;
      } else if (sortBy === "status") {
        orderBy.status = sortOrder;
      } else if (sortBy === "method") {
        orderBy.paymentMethod = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Get payments with pagination
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: pageSize,
          orderBy,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            booking: {
              select: {
                id: true,
                checkIn: true,
                checkOut: true,
                nights: true,
                status: true,
                property: {
                  select: { id: true, title: true, city: true, state: true },
                },
                guest: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
                owner: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
            package: {
              select: {
                id: true,
                status: true,
                package: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      // Transform data to DTO format
      const paymentDTOs = payments.map((p: any) => ({
        id: p.id,
        transactionId: p.transactionId,
        stripePaymentIntentId: p.stripePaymentIntentId,
        stripeChargeId: p.stripeChargeId,
        userId: p.userId,
        userName: p.user ? `${p.user.firstName} ${p.user.lastName}` : "Unknown",
        userEmail: p.user?.email ?? null,
        // Booking details
        bookingId: p.bookingId,
        bookingStatus: p.booking?.status ?? null,
        checkIn: p.booking?.checkIn ?? null,
        checkOut: p.booking?.checkOut ?? null,
        nights: p.booking?.nights ?? null,
        propertyId: p.booking?.property?.id ?? null,
        propertyTitle: p.booking?.property?.title ?? null,
        propertyCity: p.booking?.property?.city ?? null,
        guestId: p.booking?.guest?.id ?? null,
        guestName: p.booking?.guest ? `${p.booking.guest.firstName} ${p.booking.guest.lastName}` : null,
        guestEmail: p.booking?.guest?.email ?? null,
        ownerId: p.booking?.owner?.id ?? null,
        ownerName: p.booking?.owner ? `${p.booking.owner.firstName} ${p.booking.owner.lastName}` : null,
        ownerEmail: p.booking?.owner?.email ?? null,
        // Package details
        packageId: p.packageId,
        packageName: p.package?.package?.name ?? null,
        subscriptionStatus: p.package?.status ?? null,
        // Payment data
        amount: p.amount,
        currency: p.currency || "GBP",
        commissionPercent: p.commissionPercent ?? null,
        commissionAmount: p.commissionAmount ?? null,
        ownerEarnings: p.ownerEarnings ?? null,
        status: p.status,
        paymentMethod: p.paymentMethod,
        paymentType: p.bookingId ? "BOOKING" : "PACKAGE",
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      // Stats over the full filtered set (not just the current page).
      // If a status filter is already applied, only that bucket has values.
      const whereWithoutStatus = { ...where } as Record<string, unknown>;
      delete whereWithoutStatus.status;
      const statusFilter = (where as { status?: string }).status;

      const emptyAgg = {
        _sum: { amount: 0 },
        _count: 0,
        _avg: { amount: 0 },
      };

      const aggForStatus = async (status: "PAID" | "PENDING" | "FAILED") => {
        if (statusFilter && statusFilter !== status) return emptyAgg;
        return prisma.payment.aggregate({
          where: { ...whereWithoutStatus, status },
          _sum: { amount: true },
          _count: true,
          _avg: { amount: true },
        });
      };

      const [paidAgg, pendingAgg, failedAgg, allAgg] = await Promise.all([
        aggForStatus("PAID"),
        aggForStatus("PENDING"),
        aggForStatus("FAILED"),
        prisma.payment.aggregate({
          where,
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      const stats = {
        totalPayments: allAgg._count || total,
        totalAmount: allAgg._sum.amount || 0,
        completedCount: paidAgg._count || 0,
        completedAmount: paidAgg._sum.amount || 0,
        pendingCount: pendingAgg._count || 0,
        pendingAmount: pendingAgg._sum.amount || 0,
        failedCount: failedAgg._count || 0,
        failedAmount: failedAgg._sum.amount || 0,
        avgTransaction: paidAgg._avg.amount || 0,
      };

      const totalPages = Math.ceil(total / pageSize);

      return successResponse(
        {
          items: paymentDTOs,
          total,
          page,
          pageSize,
          totalPages,
          stats,
        },
        "Payments retrieved successfully"
      );
    } catch (error) {
      console.error("Get admin payments error:", error);
      return errorResponse(
        "Failed to retrieve payments",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * PATCH /api/admin/payments
 * Update payment status (refund, mark as paid, etc.)
 * Body: { paymentId: string, status?: string, notes?: string }
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { paymentId, status, notes } = await request.json();

      if (!paymentId) {
        return errorResponse("paymentId is required", 400);
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes) updateData.adminNotes = notes;

      if (Object.keys(updateData).length === 0) {
        return errorResponse("At least one field to update is required", 400);
      }

      const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIAL"];
      if (status && !validStatuses.includes(status)) {
        return errorResponse(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: updateData,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          booking: {
            select: {
              property: { select: { title: true } },
            },
          },
        },
      });

      return successResponse(updatedPayment, "Payment updated successfully");
    } catch (error: any) {
      console.error("Update payment error:", error);
      if (error.code === "P2025") {
        return errorResponse("Payment not found", 404);
      }
      return errorResponse(
        error.message || "Failed to update payment",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
