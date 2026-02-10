import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';

/**
 * POST /api/reviews/[id]/report
 * Report a review as inappropriate
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const review = await reviewService.reportReview(id);
    return NextResponse.json({ message: 'Review reported successfully', review });
  } catch (err: any) {
    console.error('POST /api/reviews/[id]/report error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to report review' },
      { status: 500 }
    );
  }
}
