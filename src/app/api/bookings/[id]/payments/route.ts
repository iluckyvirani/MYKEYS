import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { prisma } from '@/lib/prisma';
import { InitiateBookingPaymentRequest } from '@/types/payment';

/**
 * GET /api/bookings/:id/payments
 * Get all payments for a specific booking
 */
export const GET = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;

      if (!id) {
        return errorResponse('Booking ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      // Verify booking exists and user has access
      const booking = await prisma.booking.findUnique({
        where: { id },
        select: {
          id: true,
          guestId: true,
          ownerId: true,
        },
      });

      if (!booking) {
        return errorResponse('Booking not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Check if user is guest or owner
      if (booking.guestId !== user.userId && booking.ownerId !== user.userId) {
        return errorResponse('Unauthorized', 403, ErrorCode.UNAUTHORIZED);
      }

      // Get all payments for this booking
      const payments = await prisma.payment.findMany({
        where: { bookingId: id },
        orderBy: { createdAt: 'desc' },
      });

      const paymentDTOs = payments.map((p) => paymentService.mapPaymentToDTO(p));

      return successResponse(paymentDTOs, 'Booking payments retrieved successfully');
    } catch (error: any) {
      console.error('GET /api/bookings/:id/payments error:', error);
      return errorResponse(error.message || 'Failed to fetch booking payments', 500);
    }
  }
);

/**
 * POST /api/bookings/:id/payments
 * Initiate a payment for a booking
 * Body: { amount: number, paymentMethod: PaymentMethod, currency?: string }
 */
export const POST = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const data = await request.json();

      if (!id) {
        return errorResponse('Booking ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      // Verify booking exists and user is guest
      const booking = await prisma.booking.findUnique({
        where: { id },
        select: {
          id: true,
          guestId: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
        },
      });

      if (!booking) {
        return errorResponse('Booking not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Only guest can pay for booking
      if (booking.guestId !== user.userId) {
        return errorResponse('Only booking guest can pay', 403, ErrorCode.UNAUTHORIZED);
      }

      // Validate payment amount
      if (!data.amount || data.amount <= 0) {
        return errorResponse('Amount must be greater than 0', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Check if payment amount exceeds remaining balance
      const remainingBalance = booking.totalAmount - (booking.paidAmount || 0);
      if (data.amount > remainingBalance) {
        return errorResponse(
          `Payment amount cannot exceed remaining balance of ${remainingBalance}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Validate payment method
      if (!data.paymentMethod) {
        return errorResponse('Payment method is required', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Initiate payment
      const result = await paymentService.initiatePayment(
        {
          amount: data.amount,
          currency: data.currency || 'INR',
          paymentMethod: data.paymentMethod,
          bookingId: id,
          metadata: {
            bookingId: id,
            totalBookingAmount: booking.totalAmount,
            remainingBalance,
          },
        },
        user.userId
      );

      return successResponse(
        {
          payment: result.payment,
          clientSecret: result.clientSecret,
          booking: {
            id: booking.id,
            totalAmount: booking.totalAmount,
            paidAmount: booking.paidAmount || 0,
            remainingBalance,
          },
        },
        'Booking payment initiated successfully',
        201
      );
    } catch (error: any) {
      console.error('POST /api/bookings/:id/payments error:', {
        error,
        message: error?.message,
        stack: error?.stack,
      });
      
      // Extract better error message
      const errorMessage = error?.message || 'Failed to initiate booking payment';
      return errorResponse(errorMessage, 400);
    }
  }
);
