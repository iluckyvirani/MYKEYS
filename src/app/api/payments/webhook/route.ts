import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, BookingStatus } from '@prisma/client';
import { confirmPaidBooking } from '@/lib/bookings/bookingAvailabilityQueries';

/**
 * POST /api/payments/webhook
 * Stripe webhook handler — receives payment lifecycle events and keeps the DB in sync.
 *
 * Register this URL in your Stripe dashboard:
 *   https://dashboard.stripe.com/webhooks
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET — signing secret from the Stripe webhook dashboard entry
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as any;
        const chargeId =
          typeof intent.latest_charge === 'string' ? intent.latest_charge : intent.latest_charge?.id ?? null;

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: intent.id },
        });

        if (payment && payment.status !== PaymentStatus.PAID) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.PAID,
              stripeChargeId: chargeId,
              transactionId: chargeId,
              updatedAt: new Date(),
            },
          });

          if (payment.bookingId) {
            const result = await confirmPaidBooking(payment.bookingId, payment.amount);
            if (!result.ok) {
              console.warn(
                `Booking ${payment.bookingId} not confirmed after payment: ${result.reason}`
              );
            } else {
              // Queue short-stay owner settle-up when applicable
              try {
                const booking = await prisma.booking.findUnique({
                  where: { id: payment.bookingId },
                  include: {
                    property: {
                      select: {
                        ownerId: true,
                        rentalType: true,
                        listingType: true,
                      },
                    },
                  },
                });
                if (
                  booking &&
                  booking.property.listingType === 'RENT' &&
                  booking.property.rentalType === 'SHORT_TERM' &&
                  payment.ownerEarnings != null &&
                  payment.ownerEarnings > 0
                ) {
                  await prisma.payment.update({
                    where: { id: payment.id },
                    data: { settleStatus: 'PENDING' },
                  });
                  const { settlementService } = await import(
                    '@/lib/services/settlementService'
                  );
                  await settlementService.ensureShortStaySettlement({
                    paymentId: payment.id,
                    beneficiaryUserId: booking.property.ownerId,
                    amount: payment.ownerEarnings,
                  });
                }
              } catch (settleErr) {
                console.error('Short-stay settlement queue failed (non-fatal):', settleErr);
              }
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;

        const payment = await prisma.payment.findFirst({
          where: { stripePaymentIntentId: intent.id },
        });

        if (payment && payment.status === PaymentStatus.PENDING) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED, updatedAt: new Date() },
          });

          if (payment.bookingId) {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: {
                status: BookingStatus.CANCELLED,
                paymentStatus: PaymentStatus.FAILED,
                cancelledAt: new Date(),
              },
            });
          }
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as any;

        const payment = await prisma.payment.findFirst({
          where: { stripeChargeId: charge.id },
        });

        if (payment && payment.status !== PaymentStatus.REFUNDED) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.REFUNDED, updatedAt: new Date() },
          });

          if (payment.bookingId) {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: {
                paymentStatus: PaymentStatus.REFUNDED,
                paidAmount: 0,
                status: BookingStatus.CANCELLED,
                cancelledAt: new Date(),
              },
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type — acknowledged, no action needed
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
