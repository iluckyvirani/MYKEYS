import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { RoleType, PaymentStatus, BookingStatus, ServiceBookingStatus, InquiryStatus, PropertyStatus } from "@prisma/client";

/**
 * GET /api/admin/stats
 * Get comprehensive admin dashboard statistics
 * Roles: ADMIN only
 */
export const GET = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      // Build date range filters
      const dateFilter: any = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);

      // Parallel queries for all stats
      const [
        totalUsers,
        totalOwners,
        totalServiceProviders,
        activeProperties,
        totalProperties,
        totalBookings,
        completedBookings,
        pendingBookings,
        totalPayments,
        paidPayments,
        failedPayments,
        totalRevenue,
        averageBookingValue,
        totalInquiries,
        newInquiries,
        totalServiceRequests,
        activeServiceBookings,
        usersByRole,
        paymentsByMethod,
        bookingsTrend,
      ] = await Promise.all([
        // Users stats
        prisma.user.count({ where: { roles: { some: { role: RoleType.USER } } } }),

        // Owners stats
        prisma.user.count({ where: { roles: { some: { role: RoleType.OWNER } } } }),

        // Service providers stats
        prisma.user.count({ where: { roles: { some: { role: RoleType.SERVICE } } } }),

        // Properties stats
        prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
        prisma.property.count(),

        // Bookings stats
        prisma.booking.count(),
        prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
        prisma.booking.count({ where: { status: BookingStatus.PENDING } }),

        // Payments stats
        prisma.payment.count(),
        prisma.payment.count({ where: { status: PaymentStatus.PAID } }),
        prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),

        // Revenue
        prisma.payment
          .aggregate({
            where: { status: PaymentStatus.PAID },
            _sum: { amount: true },
          })
          .then((result) => result._sum?.amount || 0),

        // Average booking value
        prisma.booking
          .aggregate({
            _avg: { totalAmount: true },
          })
          .then((result) => result._avg?.totalAmount || 0),

        // Inquiries stats
        prisma.inquiry.count(),
        prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),

        // Service requests
        prisma.serviceRequest.count(),
        prisma.serviceBooking.count({ where: { status: ServiceBookingStatus.CONFIRMED } }),

        // Users by role
        prisma.userRoleAssignment.groupBy({
          by: ["role"],
          _count: true,
        }),

        // Payments by method
        prisma.payment.groupBy({
          by: ["paymentMethod"],
          _count: true,
        }),

        // Bookings trend (last 30 days by week)
        prisma.booking.groupBy({
          by: ["createdAt"],
          _count: true,
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      // Calculate derived metrics
      const conversionRate =
        totalInquiries > 0
          ? ((completedBookings / totalInquiries) * 100).toFixed(2)
          : "0.00";

      const avgPaymentValue =
        totalPayments > 0 ? Number(totalRevenue) / totalPayments : 0;

      const occupancyRate =
        totalProperties > 0
          ? ((completedBookings / totalProperties) * 100).toFixed(2)
          : "0.00";

      // Format response
      const stats = {
        summary: {
          totalUsers,
          totalOwners,
          totalServiceProviders,
          totalProperties,
          activeProperties,
          conversionRate: `${conversionRate}%`,
          occupancyRate: `${occupancyRate}%`,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          completionRate: totalBookings > 0
            ? ((completedBookings / totalBookings) * 100).toFixed(2)
            : "0.00",
        },
        payments: {
          total: totalPayments,
          paid: paidPayments,
          failed: failedPayments,
          totalRevenue: Number(totalRevenue),
          averageValue: avgPaymentValue.toFixed(2),
          successRate: totalPayments > 0
            ? ((paidPayments / totalPayments) * 100).toFixed(2)
            : "0.00",
        },
        inquiries: {
          total: totalInquiries,
          new: newInquiries,
          unresolved: totalInquiries - newInquiries,
        },
        services: {
          totalRequests: totalServiceRequests,
          activeBookings: activeServiceBookings,
        },
        averages: {
          avgBookingValue: averageBookingValue.toFixed(2),
          avgPaymentValue: avgPaymentValue.toFixed(2),
        },
        distributions: {
          usersByRole: usersByRole.map((u: any) => ({
            role: u.role,
            count: u._count,
          })),
          paymentsByMethod: paymentsByMethod.map((p: any) => ({
            method: p.paymentMethod,
            count: p._count,
          })),
        },
      };

      return successResponse(stats, "Admin stats retrieved successfully");
    } catch (error) {
      console.error("Get admin stats error:", error);
      return errorResponse(
        "Failed to retrieve stats",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);

/**
 * GET /api/admin/reports
 * Get detailed reports with filtering options
 * Query params: type (users, properties, bookings, revenue), period (day, week, month, year)
 * Roles: ADMIN only
 */
export const PATCH = withAuth(
  async (request: NextRequest, user: JWTPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get("type") || "summary";
      const period = searchParams.get("period") || "month";

      // Calculate date range based on period
      const now = new Date();
      let dateFrom = new Date();

      switch (period) {
        case "day":
          dateFrom.setDate(dateFrom.getDate() - 1);
          break;
        case "week":
          dateFrom.setDate(dateFrom.getDate() - 7);
          break;
        case "month":
          dateFrom.setMonth(dateFrom.getMonth() - 1);
          break;
        case "year":
          dateFrom.setFullYear(dateFrom.getFullYear() - 1);
          break;
      }

      const dateFilter = {
        gte: dateFrom,
        lte: now,
      };

      let reportData: any = {};

      switch (reportType) {
        case "users":
          const newUsers = await prisma.user.groupBy({
            by: ["createdAt"],
            _count: true,
            where: { createdAt: dateFilter },
          });

          const userStats = await prisma.userRoleAssignment.groupBy({
            by: ["role"],
            _count: true,
          });

          reportData = { newUsers, userStats };
          break;

        case "properties":
          const propertyStats = await prisma.property.groupBy({
            by: ["status", "propertyType"],
            _count: true,
          });

          const topProperties = await prisma.property.findMany({
            orderBy: { views: "desc" },
            take: 10,
            select: {
              id: true,
              title: true,
              views: true,
              city: true,
              price: true,
            },
          });

          reportData = { propertyStats, topProperties };
          break;

        case "bookings":
          const bookingStats = await prisma.booking.groupBy({
            by: ["status"],
            _count: true,
            where: { createdAt: dateFilter },
          });

          const bookingsByOwner = await prisma.booking.groupBy({
            by: ["propertyId"],
            _count: true,
            where: { createdAt: dateFilter },
          });

          reportData = { bookingStats, bookingsByOwner };
          break;

        case "revenue":
          const revenueByMethod = await prisma.payment.groupBy({
            by: ["paymentMethod"],
            _sum: { amount: true },
            _count: true,
            where: {
              status: PaymentStatus.PAID,
              createdAt: dateFilter,
            },
          });

          const revenueByDay = await prisma.payment.groupBy({
            by: ["createdAt"],
            _sum: { amount: true },
            where: {
              status: PaymentStatus.PAID,
              createdAt: dateFilter,
            },
          });

          reportData = { revenueByMethod, revenueByDay };
          break;

        default:
          return errorResponse("Invalid report type", 400);
      }

      return successResponse(reportData, "Report retrieved successfully");
    } catch (error) {
      console.error("Generate report error:", error);
      return errorResponse(
        "Failed to generate report",
        500,
        ErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  },
  { roles: ["ADMIN" as any] }
);
