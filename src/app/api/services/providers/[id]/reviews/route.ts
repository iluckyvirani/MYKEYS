import { NextRequest, NextResponse } from 'next/server';
import { serviceService } from '@/lib/services/serviceService';

/**
 * GET /api/services/providers/[id]/reviews
 * Public endpoint — fetch reviews for a service provider by their ServiceProvider.id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await serviceService.getReviews({
      providerId: params.id,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: { reviews: result.items, total: result.total },
    });
  } catch (error) {
    console.error('GET /api/services/providers/[id]/reviews error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
