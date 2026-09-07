import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/auth/middleware";
import { ErrorCode } from "@/lib/auth/errors";
import { JWTPayload } from "@/lib/auth/jwt";

/**
 * GET /api/owner/dashboard/stats
 * Get owner dashboard statistics
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const ownerId = user.userId;

    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Properties with status breakdown
    const [totalProperties, activeProperties, pendingProperties, lastMonthProperties] = await Promise.all([
      prisma.property.count({
        where: { ownerId },
      }),
      prisma.property.count({
        where: { ownerId, status: "ACTIVE" },
      }),
      prisma.property.count({
        where: { ownerId, status: { in: ["PENDING_REVIEW", "DRAFT"] } },
      }),
      prisma.property.count({
        where: {
          ownerId,
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
    ]);

    // 2. Active Bookings with status breakdown
    const [
      totalActiveBookings,
      confirmedBookings,
      pendingBookings,
      checkedInBookings,
    ] = await Promise.all([
      prisma.booking.count({
        where: {
          ownerId,
          status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING"] },
          checkOut: { gte: now },
        },
      }),
      prisma.booking.count({
        where: {
          ownerId,
          status: "CONFIRMED",
          checkOut: { gte: now },
        },
      }),
      prisma.booking.count({
        where: {
          ownerId,
          status: "PENDING",
          checkOut: { gte: now },
        },
      }),
      prisma.booking.count({
        where: {
          ownerId,
          status: "CHECKED_IN",
        },
      }),
    ]);

    // Calculate occupancy rate
    const totalPropertyDays = totalProperties * 30; // Approximate for current month
    const bookedDays = await prisma.booking.aggregate({
      where: {
        ownerId,
        status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
        checkIn: { gte: currentMonthStart },
      },
      _sum: {
        nights: true,
      },
    });

    const occupancyRate = totalPropertyDays > 0 
      ? Math.round(((bookedDays._sum.nights || 0) / totalPropertyDays) * 100)
      : 0;

    // 3. Revenue Statistics
    const [currentMonthRevenue, lastMonthRevenue, collectedRevenue] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          ownerId,
          createdAt: { gte: currentMonthStart },
          paymentStatus: { in: ["PAID", "PARTIAL"] },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.aggregate({
        where: {
          ownerId,
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
          paymentStatus: { in: ["PAID", "PARTIAL"] },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.aggregate({
        where: {
          ownerId,
          createdAt: { gte: currentMonthStart },
          paymentStatus: "PAID",
        },
        _sum: {
          paidAmount: true,
        },
      }),
    ]);

    const currentRevenue = currentMonthRevenue._sum.totalAmount || 0;
    const lastRevenue = lastMonthRevenue._sum.totalAmount || 0;
    const revenueChange = lastRevenue > 0 
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0;

    // 4. Inquiries Statistics
    const [totalInquiries, highPriorityInquiries, newInquiries] = await Promise.all([
      prisma.inquiry.count({
        where: {
          property: { ownerId },
          status: { in: ["NEW", "READ"] },
        },
      }),
      prisma.inquiry.count({
        where: {
          property: { ownerId },
          status: "NEW",
        },
      }),
      prisma.inquiry.count({
        where: {
          property: { ownerId },
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Calculate average response time (in hours)
    const repliedInquiries = await prisma.inquiry.findMany({
      where: {
        property: { ownerId },
        status: { in: ["REPLIED", "CLOSED", "CONVERTED"] },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
      take: 50,
      orderBy: { updatedAt: "desc" },
    });

    const avgResponseTime = repliedInquiries.length > 0
      ? Math.round(
          repliedInquiries.reduce((sum, inquiry) => {
            const diff = inquiry.updatedAt.getTime() - inquiry.createdAt.getTime();
            return sum + diff / (1000 * 60 * 60); // Convert to hours
          }, 0) / repliedInquiries.length
        )
      : 0;

    // 5. Average Rating
    const reviewStats = await prisma.review.aggregate({
      where: {
        property: { ownerId },
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    const lastMonthReviews = await prisma.review.aggregate({
      where: {
        property: { ownerId },
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const currentRating = reviewStats._avg.rating || 0;
    const lastMonthRating = lastMonthReviews._avg.rating || 0;
    const ratingChange = currentRating - lastMonthRating;

    // 6. Conversion Rate (Inquiries to Bookings)
    const convertedInquiries = await prisma.inquiry.count({
      where: {
        property: { ownerId },
        status: "CONVERTED",
        createdAt: { gte: currentMonthStart },
      },
    });

    const totalInquiriesThisMonth = await prisma.inquiry.count({
      where: {
        property: { ownerId },
        createdAt: { gte: currentMonthStart },
      },
    });

    const conversionRate = totalInquiriesThisMonth > 0
      ? Math.round((convertedInquiries / totalInquiriesThisMonth) * 100)
      : 0;

    const lastMonthConversion = await prisma.inquiry.count({
      where: {
        property: { ownerId },
        status: "CONVERTED",
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    const lastMonthTotalInquiries = await prisma.inquiry.count({
      where: {
        property: { ownerId },
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    const lastMonthConversionRate = lastMonthTotalInquiries > 0
      ? Math.round((lastMonthConversion / lastMonthTotalInquiries) * 100)
      : 0;

    const conversionChange = conversionRate - lastMonthConversionRate;

    // Prepare response
    const stats = {
      properties: {
        total: totalProperties,
        active: activeProperties,
        pending: pendingProperties,
        newThisMonth: lastMonthProperties,
        change: lastMonthProperties > 0 ? `+${lastMonthProperties} this month` : "No new properties",
      },
      bookings: {
        total: totalActiveBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        checkedIn: checkedInBookings,
        occupancyRate,
        change: `${occupancyRate}% occupancy`,
      },
      revenue: {
        current: currentRevenue,
        collected: collectedRevenue._sum.paidAmount || 0,
        change: revenueChange,
        changeText: revenueChange >= 0 ? `+${revenueChange}% from last month` : `${revenueChange}% from last month`,
      },
      inquiries: {
        total: totalInquiries,
        highPriority: highPriorityInquiries,
        new: newInquiries,
        avgResponseTime,
        change: `${highPriorityInquiries} high priority`,
      },
      rating: {
        average: Math.round(currentRating * 10) / 10,
        total: reviewStats._count.id,
        change: ratingChange,
        changeText: ratingChange >= 0 ? `+${ratingChange.toFixed(1)} this month` : `${ratingChange.toFixed(1)} this month`,
      },
      conversion: {
        rate: conversionRate,
        change: conversionChange,
        changeText: conversionChange >= 0 ? `+${conversionChange}% from last month` : `${conversionChange}% from last month`,
      },
    };

    return successResponse(stats, "Owner dashboard statistics retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching owner dashboard stats:", error);
    return errorResponse(
      "Failed to fetch dashboard statistics",
      500,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
