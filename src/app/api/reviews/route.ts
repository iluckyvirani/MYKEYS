import { NextRequest, NextResponse } from 'next/server';
import { reviewService } from '@/lib/reviews/reviewService';

export async function GET() {
  try {
    const reviews = await reviewService.getAll();
    return NextResponse.json(reviews);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const review = await reviewService.create(data);
    return NextResponse.json(review, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Failed to create review' }, { status: 500 });
  }
}
