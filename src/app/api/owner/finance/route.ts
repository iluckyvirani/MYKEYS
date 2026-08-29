import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { withAuth } from '@/lib/auth/middleware';
import { JWTPayload } from '@/lib/auth/jwt';

/**
 * GET /api/owner/finance
 * Returns owner-specific financial data — strictly separated from tenant activity.
 *
 * type=booking_income  (default)
 *   Payments from TENANTS for bookings on the owner's properties.
 *   Where: booking.ownerId = owner.userId
 *   This intentionally EXCLUDES payments the owner made AS a tenant.
 *
 * type=packages
 *   Package subscription payments the owner paid.
 *   Where: payment.userId = owner.userId AND payment.packageId IS NOT NULL
 *
 * Query params:
 *   type, status, fromDate, toDate, page, limit, sortOrder
 */
export const GET = withAuth(async (request: NextRequest, user: JWTPayload) => {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'booking_income';
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // ── Booking Income ─────────────────────────────────────────────────────────
    if (type === 'booking_income') {
      const where: any = {
        booking: { ownerId: user.userId },
        bookingId: { not: null },
      };
      if (status) where.status = status;
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: sortOrder },
          include: {
            booking: {
              select: {
                id: true,
                checkIn: true,
                checkOut: true,
                nights: true,
                status: true,
                paymentStatus: true,
                property: {
                  select: { id: true, title: true, city: true, state: true },
                },
                guest: {
                  select: { id: true, firstName: true, lastName: true, email: true },
                },
              },
            },
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      // Aggregate stats over ALL matching (not just current page)
      const allPaid = await prisma.payment.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { amount: true, commissionAmount: true, ownerEarnings: true },
      });
      const allPending = await prisma.payment.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
      });

      const items = payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        commissionPercent: p.commissionPercent,
        commissionAmount: p.commissionAmount,
        ownerEarnings: p.ownerEarnings,
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId,
        stripePaymentIntentId: p.stripePaymentIntentId,
        createdAt: p.createdAt.toISOString(),
        booking: p.booking
          ? {
              id: p.booking.id,
              checkIn: p.booking.checkIn.toISOString(),
              checkOut: p.booking.checkOut.toISOString(),
              nights: p.booking.nights,
              status: p.booking.status,
              property: p.booking.property,
              guest: p.booking.guest,
            }
          : null,
        paidBy: p.user
          ? { id: p.user.id, name: `${p.user.firstName} ${p.user.lastName}`, email: p.user.email }
          : null,
      }));

      return successResponse({
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        stats: {
          totalEarned: allPaid._sum.amount ?? 0,
          totalCommission: allPaid._sum.commissionAmount ?? 0,
          netEarnings: allPaid._sum.ownerEarnings ?? 0,
          pendingAmount: allPending._sum.amount ?? 0,
        },
      }, 'Booking income retrieved');
    }

    // ── Package Subscriptions ──────────────────────────────────────────────────
    if (type === 'packages') {
      const audienceParam = searchParams.get('audience');
      const where: any = {
        userId: user.userId,
        packageId: { not: null },
      };
      if (audienceParam === 'AGENT' || audienceParam === 'OWNER') {
        where.package = { package: { audience: audienceParam } };
      }
      if (status) where.status = status;
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: sortOrder },
          include: {
            package: {
              select: {
                id: true,
                status: true,
                startDate: true,
                endDate: true,
                package: { select: { id: true, name: true, price: true } },
              },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      const allPaid = await prisma.payment.aggregate({
        where: { ...where, status: 'PAID' },
        _sum: { amount: true },
      });

      const items = payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        currency: p.currency,
        paymentMethod: p.paymentMethod,
        transactionId: p.transactionId,
        stripePaymentIntentId: p.stripePaymentIntentId,
        createdAt: p.createdAt.toISOString(),
        package: p.package
          ? {
              ownerPackageId: p.package.id,
              subscriptionStatus: p.package.status,
              startDate: p.package.startDate?.toISOString() ?? null,
              endDate: p.package.endDate?.toISOString() ?? null,
              name: p.package.package?.name ?? null,
              price: p.package.package?.price ?? null,
            }
          : null,
      }));

      return successResponse({
        items,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        stats: { totalSpent: allPaid._sum.amount ?? 0 },
      }, 'Package payments retrieved');
    }

    return errorResponse('Invalid type parameter. Use: booking_income | packages', 400);
  } catch (error: any) {
    console.error('GET /api/owner/finance error:', error);
    return errorResponse(error.message || 'Failed to fetch financial data', 500);
  }
});
