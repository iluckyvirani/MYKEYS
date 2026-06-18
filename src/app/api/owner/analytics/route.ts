import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";
import { BookingStatus, PaymentStatus } from "@prisma/client";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function periodMonthsFromParam(value: string | null): number {
  switch (value) {
    case "1m":
      return 1;
    case "3m":
      return 3;
    case "1y":
      return 12;
    case "6m":
    default:
      return 6;
  }
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function pctChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function paymentOwnerAmount(
  amount: number,
  ownerEarnings: number | null,
  commissionAmount: number | null
): number {
  if (ownerEarnings != null && ownerEarnings > 0) return ownerEarnings;
  if (commissionAmount != null) return Math.max(0, amount - commissionAmount);
  return amount;
}

/**
 * GET /api/owner/analytics?period=6m
 * Owner analytics — bookings, revenue, guests, boosts, packages.
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const ownerId = user.userId;
    const { searchParams } = new URL(request.url);
    const periodMonths = periodMonthsFromParam(searchParams.get("period"));

    const now = new Date();
    const currentStart = addMonths(startOfMonth(now), -(periodMonths - 1));
    const previousStart = addMonths(currentStart, -periodMonths);
    const previousEnd = new Date(currentStart.getTime() - 1);

    const paidStatuses: PaymentStatus[] = [PaymentStatus.PAID, PaymentStatus.PARTIAL];
    const completedBookingStatuses: BookingStatus[] = [
      BookingStatus.CONFIRMED,
      BookingStatus.CHECKED_IN,
      BookingStatus.CHECKED_OUT,
      BookingStatus.COMPLETED,
    ];

    const [
      totalProperties,
      currentBookings,
      previousBookings,
      currentPayments,
      previousPayments,
      allOwnerBookings,
      properties,
      reviewAgg,
      activeBoosts,
      allBids,
      activePackage,
      packagePayments,
      packageHistoryCount,
    ] = await Promise.all([
      prisma.property.count({ where: { ownerId } }),
      prisma.booking.findMany({
        where: { ownerId, createdAt: { gte: currentStart } },
        select: {
          id: true,
          guestId: true,
          propertyId: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          nights: true,
          createdAt: true,
          checkIn: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          ownerId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        select: {
          id: true,
          guestId: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          nights: true,
          status: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.PAID,
          booking: { ownerId },
          createdAt: { gte: currentStart },
        },
        select: {
          amount: true,
          ownerEarnings: true,
          commissionAmount: true,
          createdAt: true,
          booking: { select: { propertyId: true, guestId: true } },
        },
      }),
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.PAID,
          booking: { ownerId },
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        select: { amount: true, ownerEarnings: true, commissionAmount: true },
      }),
      prisma.booking.findMany({
        where: { ownerId },
        select: { guestId: true, status: true, createdAt: true, checkIn: true, checkOut: true },
      }),
      prisma.property.findMany({
        where: { ownerId },
        select: {
          id: true,
          title: true,
          bookings: {
            where: { createdAt: { gte: currentStart } },
            select: {
              totalAmount: true,
              paidAmount: true,
              paymentStatus: true,
              nights: true,
              status: true,
            },
          },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.review.aggregate({
        where: { property: { ownerId } },
        _avg: { rating: true },
        _count: { id: true },
      }),
      prisma.propertyBid.findMany({
        where: { ownerId, status: "ACTIVE", endDate: { gte: now } },
        include: { property: { select: { title: true, zipCode: true } } },
        orderBy: { endDate: "asc" },
        take: 5,
      }),
      prisma.propertyBid.findMany({
        where: { ownerId, createdAt: { gte: currentStart } },
        select: { totalCost: true, status: true },
      }),
      prisma.ownerPackage.findFirst({
        where: { ownerId, status: "ACTIVE", endDate: { gt: now } },
        include: { package: { select: { name: true, price: true, propertyLimit: true } } },
        orderBy: { endDate: "desc" },
      }),
      prisma.payment.aggregate({
        where: {
          userId: ownerId,
          packageId: { not: null },
          status: PaymentStatus.PAID,
          createdAt: { gte: currentStart },
        },
        _sum: { amount: true },
      }),
      prisma.ownerPackage.count({ where: { ownerId } }),
    ]);

    const sumBookingRevenue = (
      bookings: Array<{
        paymentStatus: PaymentStatus | string;
        paidAmount: number | null;
        totalAmount: number;
      }>
    ) =>
      bookings
        .filter((b) => paidStatuses.includes(b.paymentStatus as PaymentStatus))
        .reduce((sum, b) => sum + (b.paidAmount || b.totalAmount || 0), 0);

    const sumOwnerEarnings = (
      payments: Array<{
        amount: number;
        ownerEarnings: number | null;
        commissionAmount: number | null;
      }>
    ) =>
      payments.reduce(
        (sum, p) => sum + paymentOwnerAmount(p.amount, p.ownerEarnings, p.commissionAmount),
        0
      );

    const currentBookingRevenue = sumBookingRevenue(currentBookings);
    const previousBookingRevenue = sumBookingRevenue(previousBookings);
    const currentOwnerEarnings = sumOwnerEarnings(currentPayments);
    const previousOwnerEarnings = sumOwnerEarnings(previousPayments);

    const currentPaidBookings = currentBookings.filter((b) =>
      paidStatuses.includes(b.paymentStatus as PaymentStatus)
    ).length;
    const previousPaidBookings = previousBookings.filter((b) =>
      paidStatuses.includes(b.paymentStatus as PaymentStatus)
    ).length;

    const guestCounts = new Map<string, number>();
    for (const booking of allOwnerBookings) {
      guestCounts.set(booking.guestId, (guestCounts.get(booking.guestId) || 0) + 1);
    }
    const uniqueGuests = guestCounts.size;
    const repeatGuests = [...guestCounts.values()].filter((c) => c > 1).length;
    const repeatGuestRate = uniqueGuests > 0 ? Math.round((repeatGuests / uniqueGuests) * 100) : 0;

    const periodGuestIds = new Set(currentBookings.map((b) => b.guestId));
    const previousPeriodGuestIds = new Set(previousBookings.map((b) => b.guestId));

    const bookedNightsCurrent = currentBookings
      .filter((b) => completedBookingStatuses.includes(b.status as BookingStatus))
      .reduce((sum, b) => sum + b.nights, 0);
    const daysInPeriod = Math.max(
      1,
      Math.ceil((now.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24))
    );
    const occupancyRate =
      totalProperties > 0
        ? Math.min(100, Math.round((bookedNightsCurrent / (totalProperties * daysInPeriod)) * 100))
        : 0;

    const bookedNightsPrevious = previousBookings
      .filter((b) => completedBookingStatuses.includes(b.status as BookingStatus))
      .reduce((sum, b) => sum + b.nights, 0);
    const previousOccupancy =
      totalProperties > 0
        ? Math.min(100, Math.round((bookedNightsPrevious / (totalProperties * daysInPeriod)) * 100))
        : 0;

    const monthlyTrend = Array.from({ length: periodMonths }, (_, i) => {
      const monthDate = addMonths(currentStart, i);
      const monthEnd = addMonths(monthDate, 1);
      const monthBookings = currentBookings.filter(
        (b) => b.createdAt >= monthDate && b.createdAt < monthEnd
      );
      const monthPayments = currentPayments.filter(
        (p) => p.createdAt >= monthDate && p.createdAt < monthEnd
      );
      const revenue = sumBookingRevenue(monthBookings);
      const earnings = sumOwnerEarnings(monthPayments);
      const nights = monthBookings
        .filter((b) => completedBookingStatuses.includes(b.status as BookingStatus))
        .reduce((sum, b) => sum + b.nights, 0);
      const monthDays = Math.max(
        1,
        Math.ceil(
          (Math.min(monthEnd.getTime(), now.getTime()) - monthDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const occupancy =
        totalProperties > 0
          ? Math.min(100, Math.round((nights / (totalProperties * monthDays)) * 100))
          : 0;

      return {
        month: MONTH_LABELS[monthDate.getMonth()],
        label: monthDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        bookings: monthBookings.length,
        revenue,
        ownerEarnings: earnings,
        occupancy,
      };
    });

    const propertyPerformance = properties
      .map((property) => {
        const revenue = property.bookings
          .filter((b) => paidStatuses.includes(b.paymentStatus as PaymentStatus))
          .reduce((sum, b) => sum + (b.paidAmount || b.totalAmount || 0), 0);
        const nights = property.bookings
          .filter((b) => completedBookingStatuses.includes(b.status as BookingStatus))
          .reduce((sum, b) => sum + b.nights, 0);
        const occupancy =
          totalProperties > 0
            ? Math.min(100, Math.round((nights / daysInPeriod) * 100))
            : 0;
        const rating =
          property.reviews.length > 0
            ? Math.round(
                (property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length) * 10
              ) / 10
            : 0;

        return {
          id: property.id,
          title: property.title,
          revenue,
          bookings: property.bookings.length,
          occupancy,
          rating,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const statusCounts = currentBookings.reduce<Record<string, number>>((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});

    const bookingStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    const leadTimeBookings = currentBookings.filter((b) => b.checkIn && b.createdAt);
    const avgLeadTimeDays =
      leadTimeBookings.length > 0
        ? Math.round(
            leadTimeBookings.reduce((sum, b) => {
              const diff = b.checkIn.getTime() - b.createdAt.getTime();
              return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / leadTimeBookings.length
          )
        : 0;

    const avgBookingValue =
      currentPaidBookings > 0 ? Math.round(currentBookingRevenue / currentPaidBookings) : 0;

    const cancelledCount = currentBookings.filter((b) => b.status === BookingStatus.CANCELLED).length;
    const cancellationRate =
      currentBookings.length > 0 ? Math.round((cancelledCount / currentBookings.length) * 100) : 0;

    const reviewsWithResponse = await prisma.review.count({
      where: { property: { ownerId }, response: { not: null } },
    });
    const totalReviews = reviewAgg._count.id;
    const reviewResponseRate =
      totalReviews > 0 ? Math.round((reviewsWithResponse / totalReviews) * 100) : 0;

    const convertedInquiries = await prisma.inquiry.count({
      where: { property: { ownerId }, status: "CONVERTED", createdAt: { gte: currentStart } },
    });
    const totalInquiries = await prisma.inquiry.count({
      where: { property: { ownerId }, createdAt: { gte: currentStart } },
    });
    const conversionRate =
      totalInquiries > 0 ? Math.round((convertedInquiries / totalInquiries) * 100) : 0;

    const boostSpend = allBids.reduce((sum, b) => sum + b.totalCost, 0);

    const analytics = {
      updatedAt: now.toISOString(),
      periodMonths,
      stats: {
        totalBookings: currentBookings.length,
        bookingsChange: pctChange(currentBookings.length, previousBookings.length),
        paidBookings: currentPaidBookings,
        bookingRevenue: currentBookingRevenue,
        bookingRevenueChange: pctChange(currentBookingRevenue, previousBookingRevenue),
        ownerEarnings: currentOwnerEarnings,
        ownerEarningsChange: pctChange(currentOwnerEarnings, previousOwnerEarnings),
        uniqueGuests: periodGuestIds.size,
        uniqueGuestsChange: pctChange(periodGuestIds.size, previousPeriodGuestIds.size),
        repeatGuests,
        repeatGuestRate,
        occupancyRate,
        occupancyChange: occupancyRate - previousOccupancy,
        avgRating: Math.round((reviewAgg._avg.rating || 0) * 10) / 10,
        reviewCount: totalReviews,
        activeBoosts: activeBoosts.length,
        boostSpend,
        packageSpend: packagePayments._sum.amount || 0,
      },
      monthlyTrend,
      propertyPerformance,
      bookingStatusBreakdown,
      boostAnalytics: {
        totalBids: allBids.length,
        activeBids: activeBoosts.length,
        totalSpend: boostSpend,
        recent: activeBoosts.map((bid) => ({
          id: bid.id,
          propertyTitle: bid.property?.title || "Property",
          zipCode: bid.zipCode,
          totalCost: bid.totalCost,
          status: bid.status,
          daysRemaining: Math.max(
            0,
            Math.ceil((bid.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          ),
        })),
      },
      packageAnalytics: {
        current: activePackage
          ? {
              name: activePackage.package.name,
              status: activePackage.status,
              startDate: activePackage.startDate.toISOString(),
              endDate: activePackage.endDate.toISOString(),
              propertiesUsed: activePackage.propertiesUsed,
              propertyLimit: activePackage.package.propertyLimit,
              price: activePackage.package.price,
            }
          : null,
        totalSpent: packagePayments._sum.amount || 0,
        historyCount: packageHistoryCount,
      },
      keyMetrics: {
        avgBookingValue,
        avgLeadTimeDays,
        conversionRate,
        repeatGuestRate,
        reviewResponseRate,
        cancellationRate,
      },
    };

    return successResponse(analytics, "Owner analytics retrieved successfully");
  } catch (error) {
    console.error("Error fetching owner analytics:", error);
    return errorResponse(
      "Failed to fetch owner analytics",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
