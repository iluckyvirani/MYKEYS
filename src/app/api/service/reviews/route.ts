import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/service/reviews
 * Get reviews for the authenticated service provider
 * Query params: rating, page, limit
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.userId },
    });
    if (!provider) {
      return errorResponse('Service provider profile not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await serviceService.getReviews({
      providerId: provider.id,
      rating,
      page,
      limit,
    });

    // Also get rating stats
    const ratingStats = await prisma.serviceReview.groupBy({
      by: ['rating'],
      where: { providerId: provider.id },
      _count: { id: true },
    });

    const stats = {
      avgRating: provider.rating,
      totalReviews: provider.totalReviews,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
        ...Object.fromEntries(ratingStats.map(r => [r.rating, r._count.id])),
      },
    };

    return successResponse(
      { reviews: result.items, stats, pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: Math.ceil(result.total / result.limit) } },
      'Reviews retrieved successfully'
    );
  } catch (error) {
    console.error('Get service reviews error:', error);
    return errorResponse('Failed to get reviews', 500);
  }
});

/**
 * POST /api/service/reviews
 * Create a new service review (by client)
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body = await request.json();

    if (!body.bookingId || !body.providerId || !body.rating) {
      return errorResponse('Missing required fields: bookingId, providerId, rating', 400);
    }

    const review = await serviceService.createReview({
      bookingId: body.bookingId,
      userId: user.userId,
      providerId: body.providerId,
      rating: body.rating,
      comment: body.comment,
    });

    return successResponse(review, 'Review created successfully', 201);
  } catch (error) {
    console.error('Create service review error:', error);
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return errorResponse(message, 400);
  }
});
