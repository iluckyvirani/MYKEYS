import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const review = await reviewService.getById(params.id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json(review);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const review = await reviewService.update(params.id, data);
    return NextResponse.json(review);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const review = await reviewService.delete(params.id);
    return NextResponse.json(review);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
