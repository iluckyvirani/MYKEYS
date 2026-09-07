import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/services/categories
 * Public endpoint to get all active service categories
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.serviceCategoryInfo.findMany({
      where: { status: 'active' },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
      },
    });

    return successResponse(categories, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get public categories error:', error);
    return errorResponse('Failed to retrieve categories', 500);
  }
}
