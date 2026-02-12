import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * GET /api/owner/reviews
 * Fetch reviews for owner's properties
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const propertyId = searchParams.get('propertyId');
    const hasResponse = searchParams.get('hasResponse');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      property: {
        ownerId: user.userId,
      },
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (hasResponse !== null) {
      if (hasResponse === 'true') {
        where.response = { isNot: null };
      } else if (hasResponse === 'false') {
        where.response = null;
      }
    }

    // Fetch reviews
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        items: reviews,
        total,
        page,
        limit,
        totalPages,
      },
      message: 'Reviews fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching owner reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
});
