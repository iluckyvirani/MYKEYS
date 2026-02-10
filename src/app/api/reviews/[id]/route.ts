import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/reviews/[id]
 * Get a single review by ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const review = await reviewService.getById(id);
    
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    return NextResponse.json(review);
  } catch (err) {
    console.error('GET /api/reviews/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

/**
 * PATCH /api/reviews/[id]
 * Update a review (user can only update their own review)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    
    const review = await reviewService.update(id, data, user.userId);
    return NextResponse.json(review);
  } catch (err: any) {
    console.error('PATCH /api/reviews/[id] error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update review' },
      { status: err.message ? 400 : 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete a review (user can only delete their own review)
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const review = await reviewService.delete(id, user.userId);
    return NextResponse.json({ message: 'Review deleted successfully', review });
  } catch (err: any) {
    console.error('DELETE /api/reviews/[id] error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete review' },
      { status: err.message ? 400 : 500 }
    );
  }
}
