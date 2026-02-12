import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@/types/bookings';

/**
 * GET /api/dashboard/stats
 * Get user dashboard statistics - bookings count, inquiries count, favorites count, payments
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!user || !user.userId) {
      return errorResponse('Invalid user session', 401, 'UNAUTHORIZED');
    }

    // Verify prisma client is available
    if (!prisma || typeof prisma.booking?.count !== 'function') {
      console.error('Prisma client not properly initialized');
      return errorResponse('Database connection failed', 500, 'DASHBOARD_STATS_ERROR');
    }

    // Calculate real statistics from database
    const [activeBookings, totalInquiries, totalSpent] = await Promise.all([
      // Count active bookings (PENDING or CONFIRMED status)
      prisma.booking.count({
        where: {
          guestId: user.userId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      }),
      // Count total inquiries made by user
      prisma.inquiry.count({
        where: {
          userId: user.userId,
        },
      }),
      // Calculate total spent on bookings (sum of PAID payments)
      prisma.payment
        .aggregate({
          where: {
            booking: {
              guestId: user.userId,
            },
            status: 'PAID',
          },
          _sum: {
            amount: true,
          },
        })
        .then((result) => result._sum?.amount || 0),
    ]);

    // Count favorite properties using raw query
    const favoriteResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM "Favorite" WHERE "userId" = ${user.userId}
    `;
    const favoriteProperties = Number(favoriteResult[0]?.count || 0);

    const stats = {
      activeBookings,
      totalInquiries,
      favoriteProperties,
      totalSpent: Number(totalSpent) || 0,
    };

    return successResponse(stats, 'Dashboard stats retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);

    if (error.message === 'UNAUTHORIZED') {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    return errorResponse(
      error.message || 'Failed to fetch dashboard stats',
      500,
      'DASHBOARD_STATS_ERROR'
    );
  }
}
