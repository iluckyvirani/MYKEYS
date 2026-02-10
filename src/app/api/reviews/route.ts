import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';
import { getUserFromToken } from '@/lib/auth';
import { ReviewFilter } from '@/types/review';

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
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/reviews error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create review' },
      { status: err.message ? 400 : 500 }
    );
  }
}
