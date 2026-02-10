import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';

/**
 * GET /api/reviews/property/[propertyId]/stats
 * Get rating statistics for a property
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const { propertyId } = await params;
    const stats = await reviewService.getPropertyStats(propertyId);
    return NextResponse.json(stats);
  } catch (err: any) {
    console.error('GET /api/reviews/property/[propertyId]/stats error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch property statistics' },
      { status: 500 }
    );
  }
}
