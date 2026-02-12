import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth/middleware';
import { ErrorCode } from '@/lib/auth/errors';
import { JWTPayload } from '@/lib/auth/jwt';
import { BookingStatus, PaymentStatus, BookingType, PaymentMethod, ShortBookingDTO } from '@/types/bookings';

/**
 * GET /api/owner/bookings
 * Fetch owner's property bookings with optional filters
 * Query params: propertyId, status, paymentStatus, from, to, page, pageSize, sortBy, search
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Build where clause for filters
    const where: any = {
      // Always filter by logged-in user as property owner
      ownerId: user.userId,
    };
    
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'checkIn';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      if (status === 'UPCOMING') {
        // Upcoming means CONFIRMED and check-in date is in the future
        where.status = BookingStatus.CONFIRMED;
        where.checkIn = { gt: new Date() };
      } else if (status === 'ACTIVE') {
        // Active means between check-in and check-out
        const now = new Date();
        where.status = BookingStatus.CONFIRMED;
        where.checkIn = { lte: now };
        where.checkOut = { gte: now };
      } else {
        where.status = status;
      }
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    if (from || to) {
      where.checkIn = where.checkIn || {};
      if (from) where.checkIn.gte = new Date(from);
      if (to) {
        where.checkOut = where.checkOut || {};
        where.checkOut.lte = new Date(to);
      }
    }

    // Search by guest name or property title
    if (search) {
      where.OR = [
        {
          guest: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          property: {
            title: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Fetch bookings from database
    const orderByMap: any = {
      checkIn: { checkIn: sortOrder },
      checkOut: { checkOut: sortOrder },
      createdAt: { createdAt: sortOrder },
      totalAmount: { totalAmount: sortOrder },
      status: { status: sortOrder },
    };

    const [bookingsData, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: orderByMap[sortBy] || { checkIn: sortOrder },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              ownerId: true,
            },
          },
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    // Transform database results to ShortBookingDTO format
    const bookings: ShortBookingDTO[] = bookingsData
      .filter((booking) => booking.property && booking.guest)
      .map((booking) => ({
        id: booking.id,
        bookingType: BookingType.SHORT_TERM,
        propertyId: booking.property.id,
        propertyTitle: booking.property.title,
        guestId: booking.guest.id,
        guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
        guestEmail: booking.guest.email,
        guestPhone: booking.guest.phone || '',
        checkInDate: booking.checkIn.toISOString().split('T')[0],
        checkOutDate: booking.checkOut.toISOString().split('T')[0],
        numberOfNights: booking.nights,
        numberOfGuests: booking.guests,
        pricePerNight: booking.basePrice,
        totalNights: booking.nights,
        subtotal: booking.basePrice * booking.nights,
        cleaningFee: booking.cleaningFee || 0,
        serviceFee: booking.serviceFee || 0,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus as PaymentStatus,
        paymentMethod: booking.paymentMethod as PaymentMethod | undefined,
        paidAmount: booking.paidAmount || 0,
        balanceAmount: booking.totalAmount - (booking.paidAmount || 0),
        status: booking.status as BookingStatus,
        specialRequests: booking.specialRequests || '',
        ownerId: booking.ownerId || '',
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }));

    return paginatedResponse(bookings, total, page, pageSize, 'Owner bookings retrieved successfully');
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return errorResponse('Failed to fetch owner bookings', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});
