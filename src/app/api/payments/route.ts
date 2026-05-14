import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { InitiatePaymentRequest, PaymentFilter } from '@/types/payment';
import { notificationService } from '@/lib/notifications/notificationService';
import { emailService } from '@/lib/email/emailService';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments
 * Fetch payments for authenticated user with optional filters
 * Query params: status, paymentMethod, bookingId, packageId, fromDate, toDate, page, limit, sortBy, sortOrder
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);

    const filters: PaymentFilter = {
      userId: user.userId,
      status: (searchParams.get('status') as any) || undefined,
      paymentMethod: (searchParams.get('paymentMethod') as any) || undefined,
      bookingId: searchParams.get('bookingId') || undefined,
      packageId: searchParams.get('packageId') || undefined,
      fromDate: searchParams.get('fromDate')
        ? new Date(searchParams.get('fromDate')!)
        : undefined,
      toDate: searchParams.get('toDate')
        ? new Date(searchParams.get('toDate')!)
        : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const result = await paymentService.getPayments(filters);
    return paginatedResponse(
      result.payments,
      result.pagination.total,
      result.pagination.page,
      result.pagination.limit,
      'Payments retrieved successfully'
    );
  } catch (error: any) {
    console.error('GET /api/payments error:', error);
    return errorResponse(error.message || 'Failed to fetch payments', 500);
  }
});

/**
 * POST /api/payments
 * Initiate a new payment (requires authentication)
 * Body: InitiatePaymentRequest
 */
export const POST = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const data: InitiatePaymentRequest = await request.json();

    // Validate required fields
    if (!data.amount || data.amount <= 0) {
      return errorResponse('Amount must be greater than 0', 400);
    }

    if (!data.bookingId && !data.packageId) {
      return errorResponse('Either bookingId or packageId must be provided', 400);
    }

    if (!data.paymentMethod) {
      return errorResponse('Payment method is required', 400);
    }

    // Initiate payment
    const result = await paymentService.initiatePayment(data, user.userId);

    // Send pending payment notification to user
    try {
      await notificationService.createPaymentNotification(
        user.userId,
        {
          paymentId: result.payment.id,
          bookingId: data.bookingId,
          amount: data.amount,
          currency: 'INR',
          status: 'pending',
        },
        'pending'
      );
    } catch (e) { console.error('Payment notification failed (non-fatal):', e); }

    return successResponse(
      {
        payment: result.payment,
        razorpayOrder: result.razorpayOrder,
      },
      'Payment initiated successfully',
      201
    );
  } catch (error: any) {
    console.error('POST /api/payments error:', error);
    return errorResponse(error.message || 'Failed to initiate payment', 400);
  }
});
