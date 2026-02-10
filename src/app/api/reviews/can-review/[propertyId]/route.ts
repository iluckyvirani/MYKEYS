import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/reviews/can-review/[propertyId]
 * Check if the authenticated user can review a property
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await params;
    const canReview = await reviewService.canUserReview(user.userId, propertyId);
    
    return NextResponse.json({ canReview });
  } catch (err: any) {
    console.error('GET /api/reviews/can-review/[propertyId] error:', err);
    return NextResponse.json(
      { error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}
