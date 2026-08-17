import { prisma } from '../prisma';
import { stripe, toPence, assertStripeMinAmount } from '../stripe';
import { withStripeCustomerForPayment } from '../stripe/customer';
import {
  InitiatePaymentRequest,
  PaymentDTO,
  PaymentDetailDTO,
  PaymentFilter,
  PaymentListResponse,
  PaymentVerificationResponse,
  RefundResponse,
  PaymentType,
  ConfirmPaymentRequest,
  ProcessRefundRequest,
} from '@/types/payment';
import { PaymentStatus, BookingStatus } from '@prisma/client';
import { confirmPaidBooking } from '@/lib/bookings/bookingAvailabilityQueries';

/**
 * Payment Service
 * Handles payment operations using Stripe and manages payment records.
 */
export const paymentService = {
  /**
   * Initiate a new payment — Create a Stripe PaymentIntent and a DB record.
   */
  async initiatePayment(data: InitiatePaymentRequest, userId: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe credentials not configured');
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error('Invalid amount');
    }

    assertStripeMinAmount(data.amount, data.currency || 'GBP');

    if (!data.bookingId && !data.packageId) {
      throw new Error('Either bookingId or packageId must be provided');
    }

    if (data.bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
      if (!booking) throw new Error('Booking not found');
    }

    if (data.packageId) {
      const pkg = await prisma.ownerPackage.findUnique({ where: { id: data.packageId } });
      if (!pkg) throw new Error('Package not found');
    }

    try {
      const amountInPence = toPence(data.amount);
      const currency = (data.currency || 'GBP').toLowerCase();

      // Check for an existing payment record for this booking/package
      const existingPayment = data.bookingId
        ? await prisma.payment.findUnique({ where: { bookingId: data.bookingId } })
        : data.packageId
        ? await prisma.payment.findFirst({ where: { packageId: data.packageId, userId } })
        : null;

      if (existingPayment) {
        // If already paid, reject
        if (existingPayment.status === PaymentStatus.PAID) {
          throw new Error('This booking has already been paid');
        }

        // Try to reuse the existing Stripe PaymentIntent
        if (existingPayment.stripePaymentIntentId) {
          const intent = await stripe.paymentIntents.retrieve(
            existingPayment.stripePaymentIntentId
          );
          if (intent.status === 'requires_payment_method' || intent.status === 'requires_confirmation') {
            return {
              payment: this.mapPaymentToDTO(existingPayment),
              clientSecret: intent.client_secret,
            };
          }
          // Intent is in a terminal/unusable state — cancel it and create a fresh one
          if (!['succeeded', 'canceled'].includes(intent.status)) {
            await stripe.paymentIntents.cancel(existingPayment.stripePaymentIntentId);
          }
        }

        // Create a new PaymentIntent and update the existing record
        const paymentIntent = await stripe.paymentIntents.create(
          await withStripeCustomerForPayment(userId, {
            amount: amountInPence,
            currency,
            automatic_payment_methods: { enabled: true },
            metadata: {
              bookingId: data.bookingId || '',
              packageId: data.packageId || '',
              userId,
              ...(data.metadata as Record<string, string> | undefined),
            },
          })
        );

        const updated = await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            stripePaymentIntentId: paymentIntent.id,
            status: PaymentStatus.PENDING,
            amount: data.amount,
            updatedAt: new Date(),
          },
        });

        return {
          payment: this.mapPaymentToDTO(updated),
          clientSecret: paymentIntent.client_secret,
        };
      }

      // No existing record — create Stripe PaymentIntent and DB row
      const paymentIntent = await stripe.paymentIntents.create(
        await withStripeCustomerForPayment(userId, {
          amount: amountInPence,
          currency,
          automatic_payment_methods: { enabled: true },
          metadata: {
            bookingId: data.bookingId || '',
            packageId: data.packageId || '',
            userId,
            ...(data.metadata as Record<string, string> | undefined),
          },
        })
      );

      // Persist payment record (guard against race-condition duplicate with P2002 catch)
      let payment;
      try {
        payment = await prisma.payment.create({
          data: {
            amount: data.amount,
            currency: data.currency || 'GBP',
            paymentMethod: data.paymentMethod,
            status: PaymentStatus.PENDING,
            stripePaymentIntentId: paymentIntent.id,
            bookingId: data.bookingId,
            packageId: data.packageId,
            userId,
            metadata: data.metadata || {},
          },
        });
      } catch (createErr: any) {
        // P2002 = unique constraint violation — another concurrent request already created it
        if (createErr?.code === 'P2002' && data.bookingId) {
          const existing = await prisma.payment.findUnique({
            where: { bookingId: data.bookingId },
          });
          if (existing?.stripePaymentIntentId) {
            // Cancel the orphaned intent we just created
            await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => null);
            const existingIntent = await stripe.paymentIntents.retrieve(
              existing.stripePaymentIntentId
            );
            return {
              payment: this.mapPaymentToDTO(existing),
              clientSecret: existingIntent.client_secret,
            };
          }
        }
        throw createErr;
      }

      return {
        payment: this.mapPaymentToDTO(payment),
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      const message = error?.raw?.message || error?.message || 'Unknown error occurred';
      throw new Error(`Failed to initiate payment: ${message}`);
    }
  },

  /**
   * Confirm a Stripe payment — retrieve the PaymentIntent and verify it succeeded.
   */
  async confirmPayment(
    paymentId: string,
    data: ConfirmPaymentRequest,
    userId: string
  ): Promise<PaymentVerificationResponse> {
    try {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new Error('Payment not found');
      if (payment.userId !== userId) throw new Error('Unauthorized');

      const intentId = data.stripePaymentIntentId || payment.stripePaymentIntentId;
      if (!intentId) throw new Error('Stripe PaymentIntent ID missing');

      const intent = await stripe.paymentIntents.retrieve(intentId);

      if (intent.status !== 'succeeded') {
        throw new Error(`Payment has not succeeded (status: ${intent.status})`);
      }

      const chargeId =
        typeof intent.latest_charge === 'string'
          ? intent.latest_charge
          : (intent.latest_charge as any)?.id ?? null;

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          stripeChargeId: chargeId,
          status: PaymentStatus.PAID,
          transactionId: chargeId,
          updatedAt: new Date(),
        },
      });

      if (updatedPayment.bookingId) {
        const result = await confirmPaidBooking(
          updatedPayment.bookingId,
          updatedPayment.amount
        );
        if (!result.ok) {
          throw new Error(result.reason);
        }

        // Short-stay auto-confirm emails (non-fatal)
        try {
          const booking = await prisma.booking.findUnique({
            where: { id: updatedPayment.bookingId },
            include: {
              property: { select: { title: true, ownerId: true, rentalType: true, listingType: true } },
              guest: { select: { email: true, firstName: true, lastName: true } },
            },
          });
          if (
            booking &&
            booking.property.listingType === 'RENT' &&
            booking.property.rentalType === 'SHORT_TERM'
          ) {
            const { emailService } = await import('@/lib/email/emailService');
            const guestName = `${booking.guest.firstName} ${booking.guest.lastName}`.trim();
            const checkIn = booking.checkIn.toISOString().split('T')[0];
            const checkOut = booking.checkOut.toISOString().split('T')[0];
            await emailService.sendBookingPaidConfirmedEmail(
              booking.guest.email,
              guestName || 'there',
              booking.property.title,
              checkIn,
              checkOut,
              updatedPayment.amount,
              booking.id
            );
            const owner = await prisma.user.findUnique({
              where: { id: booking.property.ownerId },
              select: { email: true, firstName: true, lastName: true },
            });
            if (owner?.email) {
              await emailService.sendBookingPaidConfirmedEmailToOwner(
                owner.email,
                `${owner.firstName} ${owner.lastName}`.trim() || 'there',
                guestName || 'Guest',
                booking.property.title,
                checkIn,
                checkOut,
                booking.id
              );
            }

            // Queue short-stay owner settle-up
            if (
              updatedPayment.ownerEarnings != null &&
              updatedPayment.ownerEarnings > 0
            ) {
              await prisma.payment.update({
                where: { id: updatedPayment.id },
                data: { settleStatus: 'PENDING' },
              });
              const { settlementService } = await import(
                '@/lib/services/settlementService'
              );
              await settlementService.ensureShortStaySettlement({
                paymentId: updatedPayment.id,
                beneficiaryUserId: booking.property.ownerId,
                amount: updatedPayment.ownerEarnings,
              });
            }
          }
        } catch (mailErr) {
          console.error('Post-payment booking emails failed (non-fatal):', mailErr);
        }
      }

      // Activate the OwnerPackage if this payment is for a package subscription
      if (updatedPayment.packageId) {
        const { packageService } = await import('@/lib/packages/packageService');
        await packageService.activateSubscription(updatedPayment.packageId, paymentId);
      }

      return {
        success: true,
        paymentId: updatedPayment.id,
        status: updatedPayment.status,
        message: 'Payment confirmed successfully',
      };
    } catch (error: any) {
      try {
        const failedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED },
        });
        if (failedPayment.bookingId) {
          await prisma.booking.update({
            where: { id: failedPayment.bookingId },
            data: {
              status: BookingStatus.CANCELLED,
              paymentStatus: PaymentStatus.FAILED,
              cancelledAt: new Date(),
            },
          });
        }
      } catch (dbErr) {
        console.error('Failed to mark payment/booking as failed:', dbErr);
      }
      return {
        success: false,
        paymentId,
        status: PaymentStatus.FAILED,
        message: error.message || 'Payment confirmation failed',
      };
    }
  },

  /**
   * Process a refund via Stripe.
   */
  async processRefund(
    paymentId: string,
    refundData: ProcessRefundRequest,
    userId: string
  ): Promise<RefundResponse> {
    try {
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new Error('Payment not found');
      if (payment.userId !== userId) throw new Error('Unauthorized');
      if (payment.status !== PaymentStatus.PAID) {
        throw new Error('Only paid payments can be refunded');
      }
      if (!payment.stripeChargeId && !payment.stripePaymentIntentId) {
        throw new Error('Cannot refund payment — no Stripe charge found');
      }

      const refundAmount = refundData.amount || payment.amount;

      const refund = await stripe.refunds.create({
        ...(payment.stripeChargeId
          ? { charge: payment.stripeChargeId }
          : { payment_intent: payment.stripePaymentIntentId! }),
        amount: toPence(refundAmount),
        reason: 'requested_by_customer',
        metadata: { reason: refundData.reason },
      });

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date(),
          metadata: {
            ...(payment.metadata as any),
            refundId: refund.id,
            refundReason: refundData.reason,
            refundAmount,
          },
        },
      });

      if (updatedPayment.bookingId) {
        await prisma.booking.update({
          where: { id: updatedPayment.bookingId },
          data: {
            paymentStatus: PaymentStatus.REFUNDED,
            paidAmount: 0,
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
          },
        });
      }

      return {
        refundId: refund.id,
        paymentId: updatedPayment.id,
        amount: refundAmount,
        status: refund.status ?? 'pending',
        message: 'Refund processed successfully',
      };
    } catch (error: any) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  },

  /**
   * Get all payments with filtering and pagination.
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

    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          booking: {
            select: {
              id: true,
              checkIn: true,
              checkOut: true,
              property: { select: { id: true, title: true, city: true, state: true } },
              guest: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          package: {
            select: { id: true, package: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p) => this.mapPaymentToDTO(p)),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Get a single payment by ID with related data.
   */
  async getPaymentById(paymentId: string, userId: string): Promise<PaymentDetailDTO> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        booking: {
          select: {
            id: true,
            guests: true,
            property: { select: { title: true } },
            checkIn: true,
            checkOut: true,
            totalAmount: true,
            guest: { select: { firstName: true, lastName: true } },
          },
        },
        package: {
          select: { id: true, package: { select: { id: true, name: true, price: true } } },
        },
      },
    });

    if (!payment) throw new Error('Payment not found');
    if (payment.userId !== userId) throw new Error('Unauthorized');

    const dto = this.mapPaymentToDTO(payment);

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
            checkIn: payment.booking.checkIn.toISOString(),
            checkOut: payment.booking.checkOut.toISOString(),
            checkInDate: payment.booking.checkIn.toISOString().split('T')[0],
            checkOutDate: payment.booking.checkOut.toISOString().split('T')[0],
            guestName: `${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`,
            propertyTitle: payment.booking.property.title,
            totalAmount: payment.booking.totalAmount,
            property: { id: '', title: payment.booking.property.title, city: '', state: '' },
            guest: {
              id: '',
              firstName: payment.booking.guest.firstName,
              lastName: payment.booking.guest.lastName,
              email: '',
            },
          }
        : undefined,
      package: payment.package
        ? {
            id: payment.package.id,
            name: payment.package.package.name,
            price: payment.package.package.price,
          }
        : undefined,
    };

    return detailDTO;
  },

  /**
   * Get payment by Stripe PaymentIntent ID.
   */
  async getPaymentByIntentId(intentId: string): Promise<PaymentDTO | null> {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: intentId },
    });
    return payment ? this.mapPaymentToDTO(payment) : null;
  },

  /**
   * Map Payment DB model to DTO.
   */
  mapPaymentToDTO(payment: any): PaymentDTO {
    return {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      stripeChargeId: payment.stripeChargeId,
      bookingId: payment.bookingId,
      packageId: payment.packageId,
      userId: payment.userId,
      metadata: payment.metadata,
      paymentType: payment.bookingId ? PaymentType.BOOKING : PaymentType.PACKAGE,
      // Commission / earnings (short-term rentals)
      commissionPercent: payment.commissionPercent ?? null,
      commissionAmount: payment.commissionAmount ?? null,
      ownerEarnings: payment.ownerEarnings ?? null,
      // Expanded relations (present when fetched with include)
      booking: payment.booking
        ? {
            id: payment.booking.id,
            checkIn: payment.booking.checkIn?.toISOString?.() ?? payment.booking.checkIn,
            checkOut: payment.booking.checkOut?.toISOString?.() ?? payment.booking.checkOut,
            property: payment.booking.property ?? null,
            guest: payment.booking.guest ?? null,
          }
        : undefined,
      package: payment.package
        ? {
            id: payment.package.id,
            name: payment.package.package?.name ?? null,
          }
        : undefined,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  },

  /**
   * Update payment status (internal use).
   */
  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return await prisma.payment.update({
      where: { id: paymentId },
      data: { status, updatedAt: new Date() },
    });
  },

  /**
   * Get payment summary for a user.
   */
  async getUserPaymentSummary(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      select: { status: true, amount: true },
    });

    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((s, p) => s + p.amount, 0),
      paidAmount: payments.filter((p) => p.status === PaymentStatus.PAID).reduce((s, p) => s + p.amount, 0),
      pendingAmount: payments.filter((p) => p.status === PaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0),
      failedAmount: payments.filter((p) => p.status === PaymentStatus.FAILED).reduce((s, p) => s + p.amount, 0),
      refundedAmount: payments.filter((p) => p.status === PaymentStatus.REFUNDED).reduce((s, p) => s + p.amount, 0),
    };
  },
};

