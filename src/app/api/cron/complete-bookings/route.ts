import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { BookingStatus } from '@prisma/client';

/**
 * GET /api/cron/complete-bookings
 * Auto-complete bookings where checkout date has passed.
 * Call this from a cron job (e.g., Vercel Cron, GitHub Actions, external scheduler).
 * Secured by a CRON_SECRET env var.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse('Unauthorized', 401);
    }

    const now = new Date();

    // Find all CONFIRMED/CHECKED_IN/CHECKED_OUT bookings where checkout date has passed
    const overdueBookings = await prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT] },
        checkOut: { lt: now },
      },
      select: { id: true, status: true },
    });

    if (overdueBookings.length === 0) {
      return successResponse({ completed: 0 }, 'No bookings to complete');
    }

    const ids = overdueBookings.map((b) => b.id);

    const result = await prisma.booking.updateMany({
      where: { id: { in: ids } },
      data: { status: BookingStatus.COMPLETED, updatedAt: now },
    });

    console.log(`[cron/complete-bookings] Completed ${result.count} bookings:`, ids);

    return successResponse(
      { completed: result.count, bookingIds: ids },
      `${result.count} booking(s) marked as COMPLETED`
    );
  } catch (error: any) {
    console.error('[cron/complete-bookings] Error:', error);
    return errorResponse('Failed to complete bookings', 500);
  }
}
