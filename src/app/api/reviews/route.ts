import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';
import { getUserFromToken } from '@/lib/auth';
import { ReviewFilter } from '@/types/review';
import { notificationService } from '@/lib/notifications/notificationService';
import { emailService } from '@/lib/email/emailService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reviews
 * Get all reviews with optional filtering
 * Query params: propertyId, userId, bookingId, minRating, maxRating, isVerified, page, limit, sortBy, sortOrder
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters: ReviewFilter = {
      propertyId: searchParams.get('propertyId') || undefined,
      userId: searchParams.get('userId') || undefined,
      bookingId: searchParams.get('bookingId') || undefined,
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined,
      maxRating: searchParams.get('maxRating') ? parseInt(searchParams.get('maxRating')!) : undefined,
      isVerified: searchParams.get('isVerified') === 'true' ? true : searchParams.get('isVerified') === 'false' ? false : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: (searchParams.get('sortBy') as 'rating' | 'createdAt' | 'helpfulCount') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await reviewService.getAll(filters);
    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * Create a new review (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    
    // Ensure userId matches the authenticated user
    data.userId = user.userId;
    
    const review = await reviewService.create(data);

    // Get property details to notify owner
    if (review.propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: review.propertyId },
        select: {
          title: true,
          ownerId: true,
        },
      });

      if (property) {
        // Get reviewer name
        const reviewer = await prisma.user.findUnique({
          where: { id: review.userId },
          select: { firstName: true, lastName: true, email: true },
        });

        const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : 'A guest';

        // Send notification to property owner
        await notificationService.createReviewNotification(
          property.ownerId,
          {
            reviewId: review.id,
            propertyId: review.propertyId,
            propertyTitle: property.title,
            reviewerName: reviewerName,
            rating: review.rating,
          }
        );

        // Get owner details for email
        const owner = await prisma.user.findUnique({
          where: { id: property.ownerId },
          select: { firstName: true, lastName: true, email: true },
        });

        // Send email to owner about the review
        if (owner && reviewer) {
          await emailService.sendNewReviewNotificationEmail(
            owner.email,
            `${owner.firstName} ${owner.lastName}`,
            reviewerName,
            property.title,
            review.rating,
            review.comment || 'No comment provided',
            review.propertyId
          );
        }

        // Create notification for the reviewer (user) that their review was posted
        await notificationService.createSystemNotification(
          review.userId,
          'Review Posted Successfully!',
          `Your review for "${property.title}" has been posted successfully.`
        );
      }
    }

    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create review' },
      { status: err.message ? 400 : 500 }
    );
  }
}
