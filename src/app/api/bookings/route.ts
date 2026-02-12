import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth/middleware';
import { ErrorCode } from '@/lib/auth/errors';
import { JWTPayload } from '@/lib/auth/jwt';
import { CreateShortBookingRequest, ShortBookingDTO, BookingStatus, PaymentStatus, BookingType, PaymentMethod } from '@/types/bookings';
import { notificationService } from '@/lib/notifications/notificationService';
import { emailService } from '@/lib/email/emailService';

/**
 * GET /api/bookings
 * Fetch bookings with optional filters
 * Query params: propertyId, guestId, ownerId, status, paymentStatus, from, to, page, pageSize
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const skip = (page - 1) * pageSize;

    // Build where clause for filters
    const where: any = {
      // Always filter by logged-in user's bookings
      guestId: user.userId,
    };
    
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    
    if (from || to) {
      where.checkIn = {};
      if (from) where.checkIn.gte = new Date(from);
      if (to) where.checkIn.lte = new Date(to);
    }

    // Fetch bookings from database
    const [bookingsData, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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

    return paginatedResponse(bookings, total, page, pageSize, 'Bookings retrieved successfully');
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return errorResponse('Failed to fetch bookings', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});

/**
 * POST /api/bookings
 * Create a new short-term booking
 * Body: CreateShortBookingRequest
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const body: CreateShortBookingRequest = await request.json();

    // Validate required fields
    if (!body.propertyId || !body.checkInDate || !body.checkOutDate || !body.numberOfGuests) {
      return errorResponse(
        'Missing required fields: propertyId, checkInDate, checkOutDate, numberOfGuests',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Validate dates
    const checkIn = new Date(body.checkInDate);
    const checkOut = new Date(body.checkOutDate);
    
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return errorResponse('Invalid date format', 400, ErrorCode.INVALID_INPUT);
    }

    if (checkOut <= checkIn) {
      return errorResponse(
        'Check-out date must be after check-in date',
        400,
        ErrorCode.INVALID_INPUT
      );
    }

    // Fetch property details from database
    const property = await prisma.property.findUnique({
      where: { id: body.propertyId },
      select: {
        id: true,
        title: true,
        price: true,
        cleaningFee: true,
        serviceFee: true,
        guests: true,
        ownerId: true,
      },
    });

    if (!property) {
      return errorResponse('Property not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Check if user is trying to book their own property
    if (property.ownerId === user.userId) {
      return errorResponse(
        'You cannot book your own property',
        403,
        ErrorCode.FORBIDDEN
      );
    }

    // Validate numberOfGuests <= property.maxGuests
    if (body.numberOfGuests > property.guests) {
      return errorResponse(
        `Maximum ${property.guests} guests allowed for this property`,
        400,
        ErrorCode.INVALID_INPUT
      );
    }

    // Fetch guest details from database
    const guest = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!guest) {
      return errorResponse('Guest details not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Calculate pricing
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = property.price;
    const subtotal = pricePerNight * numberOfNights;
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = property.serviceFee || 0;
    const totalAmount = subtotal + cleaningFee + serviceFee;

    // Check property availability (no overlapping bookings)
    const overlappingBookings = await prisma.booking.count({
      where: {
        propertyId: body.propertyId,
        status: {
          in: [BookingStatus.CONFIRMED],
        },
        OR: [
          {
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn },
          },
        ],
      },
    });

    if (overlappingBookings > 0) {
      return errorResponse(
        'Property is not available for the selected dates',
        400,
        ErrorCode.INVALID_INPUT
      );
    }

    // TODO:
    // 1. Process payment
    // 2. Send confirmation email
    
    // Create booking in database
    const bookingData: any = {
      checkIn,
      checkOut,
      nights: numberOfNights,
      guests: body.numberOfGuests,
      basePrice: pricePerNight,
      cleaningFee,
      serviceFee,
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      specialRequests: body.specialRequests || '',
      propertyId: property.id,
      guestId: guest.id,
      ownerId: property.ownerId,
    };

    if (body.paymentMethod) {
      bookingData.paymentMethod = body.paymentMethod;
    }

    const createdBooking = await prisma.booking.create({
      data: bookingData,
    });

    // Create notifications for guest and owner
    const guestName = `${guest.firstName} ${guest.lastName}`;
    
    // Notification to guest
    await notificationService.createBookingNotification(
      guest.id,
      {
        bookingId: createdBooking.id,
        propertyTitle: property.title,
        propertyId: property.id,
        guestName: guestName,
        checkIn: createdBooking.checkIn.toISOString().split('T')[0],
        checkOut: createdBooking.checkOut.toISOString().split('T')[0],
      },
      'created'
    );

    // Notification to property owner
    await notificationService.createBookingNotification(
      property.ownerId,
      {
        bookingId: createdBooking.id,
        propertyTitle: property.title,
        propertyId: property.id,
        guestName: guestName,
        checkIn: createdBooking.checkIn.toISOString().split('T')[0],
        checkOut: createdBooking.checkOut.toISOString().split('T')[0],
      },
      'created'
    );

    // Get owner details for email
    const owner = await prisma.user.findUnique({
      where: { id: property.ownerId },
      select: { firstName: true, lastName: true, email: true },
    });

    // Send confirmation email to guest
    await emailService.sendBookingConfirmationEmail(
      guest.email,
      guestName,
      property.title,
      createdBooking.checkIn.toISOString().split('T')[0],
      createdBooking.checkOut.toISOString().split('T')[0],
      createdBooking.totalAmount,
      createdBooking.id
    );

    // Send notification email to owner
    if (owner) {
      await emailService.sendBookingNotificationEmailToOwner(
        owner.email,
        `${owner.firstName} ${owner.lastName}`,
        guestName,
        property.title,
        createdBooking.checkIn.toISOString().split('T')[0],
        createdBooking.checkOut.toISOString().split('T')[0],
        createdBooking.id
      );
    }


    // Transform to DTO
    const booking: ShortBookingDTO = {
      id: createdBooking.id,
      bookingType: BookingType.SHORT_TERM,
      propertyId: property.id,
      propertyTitle: property.title,
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestEmail: guest.email,
      guestPhone: guest.phone || '',
      checkInDate: createdBooking.checkIn.toISOString().split('T')[0],
      checkOutDate: createdBooking.checkOut.toISOString().split('T')[0],
      numberOfNights: createdBooking.nights,
      numberOfGuests: createdBooking.guests,
      pricePerNight: createdBooking.basePrice,
      totalNights: createdBooking.nights,
      subtotal: createdBooking.basePrice * createdBooking.nights,
      cleaningFee: createdBooking.cleaningFee || 0,
      serviceFee: createdBooking.serviceFee || 0,
      totalAmount: createdBooking.totalAmount,
      paymentStatus: createdBooking.paymentStatus as PaymentStatus,
      paymentMethod: createdBooking.paymentMethod as PaymentMethod | undefined,
      paidAmount: createdBooking.paidAmount || 0,
      balanceAmount: createdBooking.totalAmount - (createdBooking.paidAmount || 0),
      status: createdBooking.status as BookingStatus,
      specialRequests: createdBooking.specialRequests || '',
      ownerId: createdBooking.ownerId || '',
      createdAt: createdBooking.createdAt.toISOString(),
      updatedAt: createdBooking.updatedAt.toISOString(),
    };

    return successResponse(booking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('Error creating booking:', error);
    return errorResponse('Failed to create booking', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});

