import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';

/**
 * GET /api/dashboard/trends
 * Get user booking and inquiry trends for the past 5-6 months
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // TODO: Replace with actual database queries
    // Calculate booking and inquiry counts per month for past 5 months
    const trendData = [
      { month: 'Sep', bookings: 2, inquiries: 5 },
      { month: 'Oct', bookings: 3, inquiries: 7 },
      { month: 'Nov', bookings: 4, inquiries: 9 },
      { month: 'Dec', bookings: 5, inquiries: 12 },
      { month: 'Jan', bookings: 3, inquiries: 15 },
      { month: 'Feb', bookings: 4, inquiries: 10 },
    ];

    return successResponse(trendData, 'Booking trends retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching booking trends:', error);

    if (error.message === 'UNAUTHORIZED') {
      return errorResponse('Unauthorized', 401, 'UNAUTHORIZED');
    }

    return errorResponse(
      error.message || 'Failed to fetch booking trends',
      500,
      'TRENDS_ERROR'
    );
  }
}
