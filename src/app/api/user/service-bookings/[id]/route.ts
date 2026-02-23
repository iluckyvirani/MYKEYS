import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/service-bookings/[id]
 * Get a single service booking by ID
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;

      const booking = await prisma.serviceBooking.findUnique({
        where: { id },
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
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
      });

      if (!booking) {
        return errorResponse('Booking not found', 404);
      }

      // Ensure user owns this booking
      if (booking.clientId !== user.userId) {
        return errorResponse('Unauthorized to access this booking', 403);
      }

      const providerName = `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;

      const response = {
        id: booking.id,
        serviceId: booking.serviceListingId || booking.service,
        serviceName: booking.serviceListing?.name || booking.service,
        category: booking.category,
        providerName,
        providerId: booking.providerId,
        providerImage: booking.provider.user.avatar || '/api/placeholder/100/100',
        providerPhone: booking.provider.user.phone,
        status: booking.status.toLowerCase().replace('_', '-'),
        bookingType: booking.bookingType.toLowerCase(),
        scheduledDate: booking.scheduledDate
          ? booking.scheduledDate.toISOString().split('T')[0]
          : undefined,
        scheduledTime: booking.scheduledTime || undefined,
        location: booking.location,
        description: booking.description,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus.toLowerCase().replace('_', '-'),
        createdAt: booking.createdAt.toISOString(),
        completedAt: booking.completedAt
          ? booking.completedAt.toISOString()
          : undefined,
        rating: booking.review?.rating || undefined,
        review: booking.review?.comment || undefined,
      };

      return successResponse(response, 'Booking retrieved successfully');
    } catch (error) {
      console.error('Get service booking error:', error);
      return errorResponse('Failed to get booking', 500);
    }
  }
);

/**
 * PATCH /api/user/service-bookings/[id]
 * Update service booking details (reschedule)
 */
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const body = await request.json();

      // Find the booking
      const booking = await prisma.serviceBooking.findUnique({
        where: { id },
      });

      if (!booking) {
        return errorResponse('Booking not found', 404);
      }

      // Ensure user owns this booking
      if (booking.clientId !== user.userId) {
        return errorResponse('Unauthorized to modify this booking', 403);
      }

      // Check if booking can be modified
      if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
        return errorResponse(
          'Cannot modify a completed or cancelled booking',
          400
        );
      }

      // Validate scheduled date/time if provided
      const updates: any = {};

      if (body.scheduledDate !== undefined) {
        if (body.scheduledDate) {
          const newDate = new Date(body.scheduledDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (newDate < today) {
            return errorResponse('Scheduled date cannot be in the past', 400);
          }
          updates.scheduledDate = newDate;
        } else {
          updates.scheduledDate = null;
        }
      }

      if (body.scheduledTime !== undefined) {
        updates.scheduledTime = body.scheduledTime || null;
      }

      if (body.location !== undefined) {
        updates.location = body.location;
      }

      if (body.description !== undefined) {
        updates.description = body.description;
      }

      // Update booking
      const updatedBooking = await prisma.serviceBooking.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
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
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
      });

      const providerName = `${updatedBooking.provider.user.firstName} ${updatedBooking.provider.user.lastName}`;

      const response = {
        id: updatedBooking.id,
        serviceId: updatedBooking.serviceListingId || updatedBooking.service,
        serviceName: updatedBooking.serviceListing?.name || updatedBooking.service,
        category: updatedBooking.category,
        providerName,
        providerId: updatedBooking.providerId,
        providerImage: updatedBooking.provider.user.avatar || '/api/placeholder/100/100',
        providerPhone: updatedBooking.provider.user.phone,
        status: updatedBooking.status.toLowerCase().replace('_', '-'),
        bookingType: updatedBooking.bookingType.toLowerCase(),
        scheduledDate: updatedBooking.scheduledDate
          ? updatedBooking.scheduledDate.toISOString().split('T')[0]
          : undefined,
        scheduledTime: updatedBooking.scheduledTime || undefined,
        location: updatedBooking.location,
        description: updatedBooking.description,
        totalAmount: updatedBooking.totalAmount,
        paymentStatus: updatedBooking.paymentStatus.toLowerCase().replace('_', '-'),
        createdAt: updatedBooking.createdAt.toISOString(),
        completedAt: updatedBooking.completedAt
          ? updatedBooking.completedAt.toISOString()
          : undefined,
        rating: updatedBooking.review?.rating || undefined,
        review: updatedBooking.review?.comment || undefined,
      };

      return successResponse(response, 'Booking updated successfully');
    } catch (error) {
      console.error('Update service booking error:', error);
      return errorResponse('Failed to update booking', 500);
    }
  }
);

/**
 * DELETE /api/user/service-bookings/[id]
 * Cancel a service booking
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;

      // Find the booking
      const booking = await prisma.serviceBooking.findUnique({
        where: { id },
      });

      if (!booking) {
        return errorResponse('Booking not found', 404);
      }

      // Ensure user owns this booking
      if (booking.clientId !== user.userId) {
        return errorResponse('Unauthorized to cancel this booking', 403);
      }

      // Check if booking can be cancelled
      if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
        return errorResponse(
          'Cannot cancel a booking that is already completed or cancelled',
          400
        );
      }

      // Update booking status to CANCELLED
      const cancelledBooking = await prisma.serviceBooking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return successResponse(
        { id: cancelledBooking.id, status: 'cancelled' },
        'Booking cancelled successfully'
      );
    } catch (error) {
      console.error('Cancel service booking error:', error);
      return errorResponse('Failed to cancel booking', 500);
    }
  }
);
