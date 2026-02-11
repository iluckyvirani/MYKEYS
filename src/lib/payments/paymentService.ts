import { prisma } from '../prisma';
import { razorpayInstance } from '../razorpay';
import crypto from 'crypto';
import {
  InitiatePaymentRequest,
  PaymentDTO,
  PaymentDetailDTO,
  PaymentFilter,
  PaymentListResponse,
  PaymentVerificationResponse,
  RefundResponse,
  PaymentType,
  VerifyPaymentRequest,
  ProcessRefundRequest,
} from '@/types/payment';
import { PaymentStatus } from '@prisma/client';

/**
 * Payment Service
 * Handles payment operations, Razorpay integration, and refunds
 */
export const paymentService = {
  /**
   * Initiate a new payment - Create payment record and Razorpay order
   */
  async initiatePayment(data: InitiatePaymentRequest, userId: string) {
    // Validate Razorpay configuration
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    // Validate input
    if (!data.amount || data.amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!data.bookingId && !data.packageId) {
      throw new Error('Either bookingId or packageId must be provided');
    }

    // Validate booking/package exists if provided
    if (data.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
      });
      if (!booking) {
        throw new Error('Booking not found');
      }
    }

    if (data.packageId) {
      const pkg = await prisma.ownerPackage.findUnique({
        where: { id: data.packageId },
      });
      if (!pkg) {
        throw new Error('Package not found');
      }
    }

    try {
      const amountInPaise = Math.round(data.amount * 100);
      
      console.log('Creating Razorpay order:', {
        amount: data.amount,
        amountInPaise,
        currency: data.currency || 'INR',
        bookingId: data.bookingId,
        packageId: data.packageId,
      });

      // Create Razorpay order
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: amountInPaise, // Convert to paise
        currency: data.currency || 'INR',
        receipt: `${data.bookingId || data.packageId}-${Date.now()}`,
        notes: {
          bookingId: data.bookingId || null,
          packageId: data.packageId || null,
          userId,
          ...data.metadata,
        },
      }) as any;

      console.log('Razorpay order created successfully:', {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        status: razorpayOrder.status,
      });

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          amount: data.amount,
          currency: data.currency || 'INR',
          paymentMethod: data.paymentMethod,
          status: PaymentStatus.PENDING,
          razorpayOrderId: razorpayOrder.id,
          bookingId: data.bookingId,
          packageId: data.packageId,
          userId,
          metadata: data.metadata || {},
        },
      });

      return {
        payment: this.mapPaymentToDTO(payment),
        razorpayOrder: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      };
    } catch (error: any) {
      console.error('Razorpay order creation error:', {
        error,
        errorMessage: error?.message,
        errorResponse: error?.response,
        errorDescription: error?.description,
      });
      
      // Extract error message from various error object structures
      const errorMessage = 
        error?.message || 
        error?.description || 
        error?.response?.data?.error?.description || 
        error?.response?.message ||
        'Unknown error occurred';
      
      throw new Error(`Failed to initiate payment: ${errorMessage}`);
    }
  },

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(
    paymentId: string,
    data: VerifyPaymentRequest,
    userId: string
  ): Promise<PaymentVerificationResponse> {
    try {
      // Fetch payment from database
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify user owns this payment
      if (payment.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Verify signature
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (signature !== data.razorpaySignature) {
        throw new Error('Invalid payment signature');
      }

      // Update payment record with verification details
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          status: PaymentStatus.PAID,
          transactionId: data.razorpayPaymentId,
          updatedAt: new Date(),
        },
      });

      // Update related booking/package status if applicable
      if (updatedPayment.bookingId) {
        await prisma.booking.update({
          where: { id: updatedPayment.bookingId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAmount: updatedPayment.amount,
          },
        });
      }

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        message: 'Payment verified successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        paymentId,
        status: PaymentStatus.FAILED,
        message: error.message || 'Payment verification failed',
      };
    }
  },

  /**
   * Process refund for a payment
   */
  async processRefund(
    paymentId: string,
    refundData: ProcessRefundRequest,
    userId: string
  ): Promise<RefundResponse> {
    try {
      // Fetch payment
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Verify user owns this payment
      if (payment.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Check if payment can be refunded
      if (payment.status !== PaymentStatus.PAID) {
        throw new Error('Only paid payments can be refunded');
      }

      if (!payment.razorpayPaymentId) {
        throw new Error('Cannot refund payment without Razorpay payment ID');
      }

      // Process refund via Razorpay
      const refundAmount = refundData.amount || payment.amount;
      const refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(refundAmount * 100), // Convert to paise
        notes: {
          reason: refundData.reason,
          refundedAt: new Date().toISOString(),
        },
      }) as any;

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date(),
          metadata: {
            ...(payment.metadata as any),
            refundId: refund.id,
            refundReason: refundData.reason,
            refundAmount: refundAmount,
          },
        },
      });

      // Update related booking if applicable
      if (updatedPayment.bookingId) {
        await prisma.booking.update({
          where: { id: updatedPayment.bookingId },
          data: {
            paymentStatus: PaymentStatus.REFUNDED,
            paidAmount: 0,
          },
        });
      }

      return {
        refundId: refund.id,
        paymentId: updatedPayment.id,
        amount: refundAmount,
        status: refund.status,
        message: 'Refund processed successfully',
      };
    } catch (error: any) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  },

  /**
   * Get all payments with filtering and pagination
   */
  async getPayments(filters: PaymentFilter = {}): Promise<PaymentListResponse> {
    const {
      userId,
      status,
      paymentMethod,
      bookingId,
      packageId,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (bookingId) where.bookingId = bookingId;
    if (packageId) where.packageId = packageId;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = fromDate;
      if (toDate) where.createdAt.lte = toDate;
    }

    // Fetch payments and total count
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p) => this.mapPaymentToDTO(p)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get single payment by ID with related data
   */
  async getPaymentById(paymentId: string, userId: string): Promise<PaymentDetailDTO> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            guests: true,
            property: {
              select: {
                title: true,
              },
            },
            checkIn: true,
            checkOut: true,
            totalAmount: true,
            guest: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        package: {
          select: {
            id: true,
            package: {
              select: {
                id: true,
                name: true,
                price: true,
                tier: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Verify user owns this payment
    if (payment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const dto = this.mapPaymentToDTO(payment);

    // Add related data if exists
    const detailDTO: PaymentDetailDTO = {
      ...dto,
      user: payment.user
        ? {
            id: payment.user.id,
            firstName: payment.user.firstName,
            lastName: payment.user.lastName,
            email: payment.user.email,
          }
        : undefined,
      booking: payment.booking
        ? {
            id: payment.booking.id,
            guestName: `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`,
            propertyTitle: payment.booking.property.title,
            totalAmount: payment.booking.totalAmount,
            checkInDate: payment.booking.checkIn.toISOString().split('T')[0],
            checkOutDate: payment.booking.checkOut.toISOString().split('T')[0],
          }
        : undefined,
      package: payment.package
        ? {
            id: payment.package.id,
            name: payment.package.package.name,
            price: payment.package.package.price,
            tier: payment.package.package.tier,
          }
        : undefined,
    };

    return detailDTO;
  },

  /**
   * Get payment by Razorpay Order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentDTO | null> {
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: orderId },
    });

    return payment ? this.mapPaymentToDTO(payment) : null;
  },

  /**
   * Map Payment DB model to DTO
   */
  mapPaymentToDTO(payment: any): PaymentDTO {
    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      razorpaySignature: payment.razorpaySignature,
      bookingId: payment.bookingId,
      packageId: payment.packageId,
      userId: payment.userId,
      metadata: payment.metadata,
      paymentType: payment.bookingId ? PaymentType.BOOKING : PaymentType.PACKAGE,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  },

  /**
   * Update payment status (internal use)
   */
  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status, updatedAt: new Date() },
    });
  },

  /**
   * Get payment summary for user
   */
  async getUserPaymentSummary(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      select: {
        status: true,
        amount: true,
      },
    });

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments
        .filter((p) => p.status === PaymentStatus.PENDING)
        .reduce((sum, p) => sum + p.amount, 0),
      failedAmount: payments
        .filter((p) => p.status === PaymentStatus.FAILED)
        .reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: payments
        .filter((p) => p.status === PaymentStatus.REFUNDED)
        .reduce((sum, p) => sum + p.amount, 0),
    };

    return summary;
  },
};
