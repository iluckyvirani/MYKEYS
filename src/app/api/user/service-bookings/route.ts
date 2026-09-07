import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { paginatedResponse, errorResponse } from '@/lib/response';
import { serviceService } from '@/lib/services/serviceService';
import { paymentService } from '@/lib/payments/paymentService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/service-bookings
 * Get service bookings for the authenticated user
 * Query params: status, page, limit, search
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    await paymentService.expireStalePendingTransactions().catch((e) =>
      console.error("expireStalePendingTransactions:", e)
    );

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const search = searchParams.get('search') || undefined;
    const bookingType = searchParams.get('bookingType') || undefined;
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;

    // Get user's service bookings with enhanced data
    const where: any = {
      clientId: user.userId,
    };

    if (status && status !== 'all') {
      where.status = status.toUpperCase().replace(/-/g, '_');
    }

    if (bookingType && bookingType !== 'all') {
      where.bookingType = bookingType.toUpperCase();
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  phone: true,
                },
              },
            },
          },
          serviceListing: {
            select: {
              id: true,
              name: true,
              category: true,
              basePrice: true,
              image: true,
            },
          },
          catalogService: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
      }),
      prisma.serviceBooking.count({ where }),
    ]);

    // Map to frontend format
    const items = bookings.map((booking: any) => {
      const providerName = `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;
      
      return {
        id: booking.id,
        serviceId: booking.catalogServiceId || booking.serviceListingId || booking.service,
        serviceName:
          booking.catalogService?.name ||
          booking.serviceListing?.name ||
          booking.service,
        category: booking.category,
        providerName,
        providerId: booking.providerId,
        providerImage: booking.provider.user.avatar || '/api/placeholder/100/100',
        providerPhone: booking.provider.user.phone,
        status: booking.status.toLowerCase().replace('_', '-'),
        bookingType: booking.bookingType.toLowerCase(),
        scheduledDate: booking.scheduledDate ? booking.scheduledDate.toISOString().split('T')[0] : undefined,
        scheduledTime: booking.scheduledTime || undefined,
        location: booking.location,
        description: booking.description,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus.toLowerCase().replace('_', '-'),
        pendingAction: booking.pendingAction || null,
        settleStatus: booking.settleStatus || null,
        createdAt: booking.createdAt.toISOString(),
        completedAt: booking.completedAt ? booking.completedAt.toISOString() : undefined,
        rating: booking.review?.rating || undefined,
        review: booking.review?.comment || undefined,
      };
    });

    // Filter by search if provided
    let filteredItems = items;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = items.filter((item: any) =>
        item.serviceName.toLowerCase().includes(searchLower) ||
        item.providerName.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }

    return paginatedResponse(
      filteredItems,
      search ? filteredItems.length : total,
      page,
      limit,
      'Service bookings retrieved successfully'
    );
  } catch (error) {
    console.error('Get user service bookings error:', error);
    return errorResponse('Failed to get service bookings', 500);
  }
});

