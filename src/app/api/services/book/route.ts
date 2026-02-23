import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { serviceService } from '@/lib/services/serviceService';

/**
 * POST /api/services/book
 * Create a new service booking (user side)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('accessToken')?.value;

    if (!token) {
      return errorResponse('Authentication required', 401);
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return errorResponse('Invalid or expired token', 401);
    }

    const userId = payload.userId;

    // Get request body
    const body = await request.json();
    const {
      providerId,
      serviceListingId,
      service,
      category,
      bookingType,
      description,
      scheduledDate,
      scheduledTime,
      location,
      totalAmount,
    } = body;

    // Validate required fields
    if (!providerId || !service || !category || !totalAmount) {
      return errorResponse('Missing required fields', 400);
    }

    // Verify provider exists
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return errorResponse('Service provider not found', 404);
    }

    // Create booking
    const booking = await serviceService.createBooking({
      clientId: userId,
      providerId,
      serviceListingId,
      service,
      category,
      bookingType,
      description,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      scheduledTime,
      location,
      totalAmount,
    });

    return successResponse(booking, 'Booking created successfully', 201);
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return errorResponse(error.message || 'Failed to create booking', 500);
  }
}
