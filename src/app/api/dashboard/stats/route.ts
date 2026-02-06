import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/stats
 * Get user dashboard statistics - bookings count, inquiries count, favorites count, payments
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Calculate real statistics from database
    const [activeBookings, totalInquiries, favoriteProperties] = await Promise.all([
      // Count active bookings (PENDING or CONFIRMED status)
      prisma.booking.count({
        where: {
          guestId: user.userId,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      }),
      // Count total inquiries made by user
      prisma.inquiry.count({
        where: {
          userId: user.userId,
        },
      }),
      // Count favorite properties
      prisma.favorite.count({
        where: {
          userId: user.userId,
        },
      }),
    ]);

    const stats = {
      activeBookings,
      totalInquiries,
      favoriteProperties,
      upcomingPayments: 45500, // Static data for upcoming payments
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
