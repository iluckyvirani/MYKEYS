import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';

/**
 * POST /api/reviews/[id]/helpful
 * Mark a review as helpful
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const review = await reviewService.markHelpful(id);
    return NextResponse.json(review);
  } catch (err: any) {
    console.error('POST /api/reviews/[id]/helpful error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}
