import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { paymentService } from '@/lib/payments/paymentService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/bookings
 * Get bookings for the authenticated service provider
 * Query params: status, page, limit
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    await paymentService.expireStalePendingTransactions().catch((e) =>
      console.error("expireStalePendingTransactions:", e)
    );

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const result = await serviceService.getBookings({
      providerId: provider.id,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return paginatedResponse(result.items, result.total, result.page, result.limit, 'Bookings retrieved successfully');
  } catch (error) {
    console.error('Get service bookings error:', error);
    return errorResponse('Failed to get bookings', 500);
  }
});

/**
 * POST /api/service/bookings
 * Create a new service booking (by client)
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.providerId || !body.service || !body.totalAmount) {
      return errorResponse('Missing required fields: providerId, service, totalAmount', 400);
    }

    const booking = await serviceService.createBooking({
      clientId: user.userId,
      providerId: body.providerId,
      serviceListingId: body.serviceListingId,
      service: body.service,
      category: body.category || 'plumbing',
      subcategory: body.subcategory,
      serviceArea: body.serviceArea,
      bookingType: body.bookingType,
      description: body.description,
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
      scheduledTime: body.scheduledTime,
      location: body.location,
      totalAmount: body.totalAmount,
    });

    return successResponse(booking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('Create service booking error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create booking';
    return errorResponse(message, 400);
  }
});
