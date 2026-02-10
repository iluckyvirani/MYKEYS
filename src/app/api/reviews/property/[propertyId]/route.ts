import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';

/**
 * GET /api/reviews/property/[propertyId]
 * Get all reviews for a specific property
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const { searchParams } = new URL(req.url);

    const filters = {
      propertyId,
      minRating: searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : undefined,
      maxRating: searchParams.get('maxRating') ? parseInt(searchParams.get('maxRating')!) : undefined,
      isVerified: searchParams.get('isVerified') === 'true' ? true : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: (searchParams.get('sortBy') as 'rating' | 'createdAt' | 'helpfulCount') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const result = await reviewService.getByPropertyId(propertyId, filters);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('GET /api/reviews/property/[propertyId] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch property reviews' },
      { status: 500 }
    );
  }
}
