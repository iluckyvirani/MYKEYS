import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/reviews/user/[userId]
 * Get all reviews by a specific user
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);

    const filters = {
      userId,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: (searchParams.get('sortBy') as 'rating' | 'createdAt' | 'helpfulCount') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await reviewService.getByUserId(userId, filters);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('GET /api/reviews/user/[userId] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch user reviews' },
      { status: 500 }
    );
  }
}
