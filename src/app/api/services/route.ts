import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/services
 * Public endpoint to browse all available service providers and their listings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category'); // legacy kebab-case support
    const serviceArea = searchParams.get('serviceArea');
    const instantOnly = searchParams.get('instantOnly') === 'true';

    // Build where clause
    const where: any = {
      isActive: true, // Only show active providers (verified check moved to response flag)
    };

    if (categoryId) {
      // Direct match: ServiceProvider.category now stores ServiceCategoryInfo.id
      where.category = categoryId;
    } else if (category) {
      // Legacy: kebab-case slug passed directly
      where.category = category;
    }

    if (serviceArea) {
      where.serviceAreas = {
        has: serviceArea,
      };
    }

    if (instantOnly) {
      where.instantBookingEnabled = true;
    }

    // Get all providers with their services and user info
    const providers = await prisma.serviceProvider.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            city: true,
            state: true,
          },
        },
        services: {
          where: {
            status: 'active',
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { totalReviews: 'desc' },
      ],
    });

    // Transform to frontend format
    const results = providers.map((provider) => ({
      id: provider.id,
      name: `${provider.user.firstName} ${provider.user.lastName}`,
      category: provider.category,
      subcategories: provider.subcategories,
      rating: provider.rating,
      reviews: provider.totalReviews,
      completedBookings: provider.completedBookings,
      location: `${provider.user.city || ''}, ${provider.user.state || ''}`.trim().replace(/^,\s*/, ''),
      avatar: provider.user.avatar || '/api/placeholder/100/100',
      bio: provider.bio || '',
      serviceAreas: (provider.serviceAreas as string[]) || [],
      instantBooking: provider.instantBookingEnabled,
      instantPrice: provider.instantBookingPrice,
      verified: provider.documentVerified,
      services: provider.services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description,
        basePrice: s.basePrice,
        rating: s.rating,
        reviews: s.reviews,
        image: s.image,
      })),
    }));

    return successResponse(results, 'Service providers fetched successfully');
  } catch (error: any) {
    console.error('Failed to fetch services:', error);
    return errorResponse('Failed to fetch services', 500);
  }
}
