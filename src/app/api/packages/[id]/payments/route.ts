import { NextRequest } from 'next/server';
import { paymentService } from '@/lib/payments/paymentService';
import { withAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/response';
import { JWTPayload } from '@/lib/auth/jwt';
import { ErrorCode } from '@/lib/auth/errors';
import { prisma } from '@/lib/prisma';
import { InitiatePackagePaymentRequest } from '@/types/payment';

/**
 * GET /api/packages/:id/payments
 * Get all payments for a specific package (owner only)
 */
export const GET = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;

      if (!id) {
        return errorResponse('Package ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      // Verify package exists and user is owner
      const pkg = await prisma.ownerPackage.findUnique({
        where: { id },
        select: {
          id: true,
          ownerId: true,
        },
      });

      if (!pkg) {
        return errorResponse('Package not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Only owner can view their package payments
      if (pkg.ownerId !== user.userId) {
        return errorResponse('Unauthorized', 403, ErrorCode.UNAUTHORIZED);
      }

      // Get all payments for this package
      const payments = await prisma.payment.findMany({
        where: { packageId: id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      const paymentDTOs = payments.map((p) => ({
        ...paymentService.mapPaymentToDTO(p),
        user: p.user,
      }));

      return successResponse(paymentDTOs, 'Package payments retrieved successfully');
    } catch (error: any) {
      console.error('GET /api/packages/:id/payments error:', error);
      return errorResponse(error.message || 'Failed to fetch package payments', 500);
    }
  }
);

/**
 * POST /api/packages/:id/payments
 * Initiate a payment for a package (owner purchase)
 * Body: { amount: number, paymentMethod: PaymentMethod, currency?: string }
 */
export const POST = withAuth<{ id: string }>(
  async (request: NextRequest, user: JWTPayload, context) => {
    try {
      const { id } = await context!.params;
      const data = await request.json();

      if (!id) {
        return errorResponse('Package ID is required', 400, ErrorCode.INVALID_INPUT);
      }

      // Verify package exists
      const pkg = await prisma.ownerPackage.findUnique({
        where: { id },
        select: {
          id: true,
          ownerId: true,
          package: {
            select: {
              id: true,
              name: true,
              price: true,
              durationValue: true,
              durationUnit: true,
              propertyLimit: true,
            },
          },
        },
      });

      if (!pkg) {
        return errorResponse('Package not found', 404, ErrorCode.RESOURCE_NOT_FOUND);
      }

      // Owner can only buy for themselves
      if (pkg.ownerId !== user.userId) {
        return errorResponse(
          'Owners can only purchase their own packages',
          403,
          ErrorCode.UNAUTHORIZED
        );
      }

      // Validate payment amount matches package price
      if (!data.amount || data.amount <= 0) {
        return errorResponse('Amount must be greater than 0', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Verify the amount matches the package price
      if (data.amount !== pkg.package.price) {
        return errorResponse(
          `Payment amount must match package price of ${pkg.package.price}`,
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Validate payment method
      if (!data.paymentMethod) {
        return errorResponse('Payment method is required', 400, ErrorCode.VALIDATION_ERROR);
      }

      // Check for any existing pending or paid subscription for this owner
      const existingPayment = await prisma.payment.findFirst({
        where: {
          packageId: id,
          userId: user.userId,
          status: {
            in: ['PENDING', 'PAID'],
          },
        },
      });

      if (existingPayment?.status === 'PAID') {
        return errorResponse(
          'You already have an active subscription for this package',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      // Initiate payment
      const result = await paymentService.initiatePayment(
        {
          amount: data.amount,
          currency: data.currency || 'INR',
          paymentMethod: data.paymentMethod,
          packageId: id,
          metadata: {
            packageId: id,
            packageName: pkg.package.name,
            propertyLimit: pkg.package.propertyLimit,
            durationValue: pkg.package.durationValue,
            durationUnit: pkg.package.durationUnit,
          },
        },
        user.userId
      );

      return successResponse(
        {
          payment: result.payment,
          razorpayOrder: result.razorpayOrder,
          package: {
            id: pkg.package.id,
            name: pkg.package.name,
            price: pkg.package.price,
            propertyLimit: pkg.package.propertyLimit,
            durationValue: pkg.package.durationValue,
            durationUnit: pkg.package.durationUnit,
          },
        },
        'Package payment initiated successfully',
        201
      );
    } catch (error: any) {
      console.error('POST /api/packages/:id/payments error:', error);
      return errorResponse(error.message || 'Failed to initiate package payment', 400);
    }
  }
);
