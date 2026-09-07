import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';
import { getUserFromToken } from '@/lib/auth';

/**
 * POST /api/reviews/[id]/response
 * Owner adds a response to a review
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    if (!data.response) {
      return NextResponse.json({ error: 'Response text is required' }, { status: 400 });
    }

    const review = await reviewService.addOwnerResponse(id, data, user.userId);
    return NextResponse.json(review);
  } catch (err: any) {
    console.error('POST /api/reviews/[id]/response error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to add response' },
      { status: err.message ? 400 : 500 }
    );
  }
}
