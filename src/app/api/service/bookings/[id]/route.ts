import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/bookings/[id]
 * Get a single booking by ID
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;

    const booking = await serviceService.getBookingById(id);
    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    return successResponse(booking, 'Booking retrieved successfully');
  } catch (error) {
    console.error('Get service booking error:', error);
    return errorResponse('Failed to get booking', 500);
  }
});

/**
 * PATCH /api/service/bookings/[id]
 * Update booking status (by provider)
 */
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(async (request: NextRequest, user: JWTPayload, context) => {
  try {
    const { id } = await context!.params;
    const body = await request.json();

    if (!body.status) {
      return errorResponse('Status is required', 400);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const updated = await serviceService.updateBookingStatus(id, provider.id, body.status);

    return successResponse(updated, 'Booking status updated successfully');
  } catch (error) {
    console.error('Update booking status error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update booking';
    return errorResponse(message, 400);
  }
});
