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
    const category = searchParams.get('category');
    const serviceArea = searchParams.get('serviceArea');
    const instantOnly = searchParams.get('instantOnly') === 'true';

    // Build where clause
    const where: any = {
      documentVerified: true, // Only show verified providers
    };

    if (category) {
      // Convert frontend format (kebab-case) to Prisma enum (SNAKE_CASE)
      // e.g., 'ac-repair' → 'AC_REPAIR', 'painting' → 'PAINTING'
      where.category = category.replace(/-/g, '_').toUpperCase();
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
      category: provider.category.toLowerCase().replace('_', '-'),
      subcategories: provider.subcategories,
      rating: provider.rating,
      reviews: provider.totalReviews,
      completedBookings: provider.completedBookings,
      location: `${provider.user.city || ''}, ${provider.user.state || ''}`.trim().replace(/^,\s*/, ''),
      avatar: provider.user.avatar || '/api/placeholder/100/100',
      bio: provider.bio || '',
      serviceAreas: provider.serviceAreas as string[],
      instantBooking: provider.instantBookingEnabled,
      instantPrice: provider.instantBookingPrice,
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
