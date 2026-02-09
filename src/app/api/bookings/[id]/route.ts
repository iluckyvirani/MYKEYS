import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth/middleware';
import { ErrorCode } from '@/lib/auth/errors';
import { JWTPayload } from '@/lib/auth/jwt';
import { UpdateBookingStatusRequest, ShortBookingDTO, BookingType, PaymentStatus, PaymentMethod, BookingStatus } from '@/types/bookings';

/**
 * GET /api/bookings/{id}
 * Fetch a specific booking by ID
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload, context?: any) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return errorResponse('Booking ID is required', 400, ErrorCode.INVALID_INPUT);
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
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
    });

    if (!booking) {
      return errorResponse('Booking not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Transform to DTO
    const bookingDTO: ShortBookingDTO = {
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
    };

    return successResponse(bookingDTO, 'Booking retrieved successfully');
  } catch (error) {
    console.error('Error fetching booking:', error);
    return errorResponse('Failed to fetch booking', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});

/**
 * PATCH /api/bookings/{id}
 * Update booking status (owner action)
 * Only owner can accept/cancel bookings
 * Body: UpdateBookingStatusRequest
 */
export const PATCH = withAuth(async (request: NextRequest, user: JWTPayload, context?: any) => {
  try {
    const { id } = await context.params;
    const body: UpdateBookingStatusRequest = await request.json();

    if (!id) {
      return errorResponse('Booking ID is required', 400, ErrorCode.INVALID_INPUT);
    }

    if (!body.status) {
      return errorResponse('Status is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Fetch booking from database
    const booking = await prisma.booking.findUnique({
      where: { id },
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
    });

    if (!booking) {
      return errorResponse('Booking not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Verify user is the property owner
    if (booking.property.ownerId !== user.userId) {
      return errorResponse('Only property owner can update booking status', 403, ErrorCode.UNAUTHORIZED);
    }

    // TODO:
    // 1. Validate status transition
    // 2. If CANCELLED, process refund
    // 3. Send notification email

    // Update booking in database
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: body.status as BookingStatus,
        updatedAt: new Date(),
      },
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
    });

    // Transform to DTO
    const bookingDTO: ShortBookingDTO = {
      id: updatedBooking.id,
      bookingType: BookingType.SHORT_TERM,
      propertyId: updatedBooking.property.id,
      propertyTitle: updatedBooking.property.title,
      guestId: updatedBooking.guest.id,
      guestName: `${updatedBooking.guest.firstName} ${updatedBooking.guest.lastName}`,
      guestEmail: updatedBooking.guest.email,
      guestPhone: updatedBooking.guest.phone || '',
      checkInDate: updatedBooking.checkIn.toISOString().split('T')[0],
      checkOutDate: updatedBooking.checkOut.toISOString().split('T')[0],
      numberOfNights: updatedBooking.nights,
      numberOfGuests: updatedBooking.guests,
      pricePerNight: updatedBooking.basePrice,
      totalNights: updatedBooking.nights,
      subtotal: updatedBooking.basePrice * updatedBooking.nights,
      cleaningFee: updatedBooking.cleaningFee || 0,
      serviceFee: updatedBooking.serviceFee || 0,
      totalAmount: updatedBooking.totalAmount,
      paymentStatus: updatedBooking.paymentStatus as PaymentStatus,
      paymentMethod: updatedBooking.paymentMethod as PaymentMethod | undefined,
      paidAmount: updatedBooking.paidAmount || 0,
      balanceAmount: updatedBooking.totalAmount - (updatedBooking.paidAmount || 0),
      status: updatedBooking.status as BookingStatus,
      specialRequests: updatedBooking.specialRequests || '',
      ownerId: updatedBooking.ownerId || '',
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString(),
    };

    return successResponse(bookingDTO, `Booking status updated to ${body.status}`);
  } catch (error) {
    console.error('Error updating booking:', error);
    return errorResponse('Failed to update booking', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});

/**
 * DELETE /api/bookings/{id}
 * Cancel a booking (guest action)
 * Only guest who created the booking can delete
 */
export const DELETE = withAuth(async (request: NextRequest, user: JWTPayload, context?: any) => {
  try {
    const { id } = await context.params;

    if (!id) {
      return errorResponse('Booking ID is required', 400, ErrorCode.INVALID_INPUT);
    }

    // Fetch booking from database
    const booking = await prisma.booking.findUnique({
      where: { id },
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
    });

    if (!booking) {
      return errorResponse('Booking not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
    }

    // Verify user is the guest who created the booking
    if (booking.guestId !== user.userId) {
      return errorResponse('Only the guest who created this booking can cancel it', 403, ErrorCode.UNAUTHORIZED);
    }

    // Check if booking can be cancelled
    if ([BookingStatus.CANCELLED, BookingStatus.COMPLETED, BookingStatus.CHECKED_OUT].includes(booking.status as BookingStatus)) {
      return errorResponse('This booking cannot be cancelled in its current status', 400, ErrorCode.INVALID_INPUT);
    }

    // TODO:
    // 1. Check if cancellation is allowed (based on cancellation policy)
    // 2. Process refund if applicable
    // 3. Send cancellation email

    // Update booking status to CANCELLED
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      },
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
    });

    // Transform to DTO
    const bookingDTO: ShortBookingDTO = {
      id: cancelledBooking.id,
      bookingType: BookingType.SHORT_TERM,
      propertyId: cancelledBooking.property.id,
      propertyTitle: cancelledBooking.property.title,
      guestId: cancelledBooking.guest.id,
      guestName: `${cancelledBooking.guest.firstName} ${cancelledBooking.guest.lastName}`,
      guestEmail: cancelledBooking.guest.email,
      guestPhone: cancelledBooking.guest.phone || '',
      checkInDate: cancelledBooking.checkIn.toISOString().split('T')[0],
      checkOutDate: cancelledBooking.checkOut.toISOString().split('T')[0],
      numberOfNights: cancelledBooking.nights,
      numberOfGuests: cancelledBooking.guests,
      pricePerNight: cancelledBooking.basePrice,
      totalNights: cancelledBooking.nights,
      subtotal: cancelledBooking.basePrice * cancelledBooking.nights,
      cleaningFee: cancelledBooking.cleaningFee || 0,
      serviceFee: cancelledBooking.serviceFee || 0,
      totalAmount: cancelledBooking.totalAmount,
      paymentStatus: cancelledBooking.paymentStatus as PaymentStatus,
      paymentMethod: cancelledBooking.paymentMethod as PaymentMethod | undefined,
      paidAmount: cancelledBooking.paidAmount || 0,
      balanceAmount: cancelledBooking.totalAmount - (cancelledBooking.paidAmount || 0),
      status: cancelledBooking.status as BookingStatus,
      specialRequests: cancelledBooking.specialRequests || '',
      ownerId: cancelledBooking.ownerId || '',
      createdAt: cancelledBooking.createdAt.toISOString(),
      updatedAt: cancelledBooking.updatedAt.toISOString(),
    };

    return successResponse(bookingDTO, 'Booking cancelled successfully');
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return errorResponse('Failed to cancel booking', 500, ErrorCode.INTERNAL_SERVER_ERROR);
  }
});
