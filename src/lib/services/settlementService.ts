import { prisma } from "@/lib/prisma";
import { SettlementStatus, SettlementType } from "@prisma/client";
import { notificationService } from "@/lib/notifications/notificationService";
import {
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from "@/types/notification";

export const settlementService = {
  async ensureServiceSettlement(opts: {
    serviceBookingId: string;
    beneficiaryUserId: string;
    amount: number;
  }) {
    const existing = await prisma.settlement.findFirst({
      where: { serviceBookingId: opts.serviceBookingId, type: SettlementType.SERVICE },
    });
    if (existing) return existing;

    return prisma.settlement.create({
      data: {
        type: SettlementType.SERVICE,
        amount: opts.amount,
        status: SettlementStatus.PENDING,
        beneficiaryUserId: opts.beneficiaryUserId,
        serviceBookingId: opts.serviceBookingId,
      },
    });
  },

  async ensureShortStaySettlement(opts: {
    paymentId: string;
    beneficiaryUserId: string;
    amount: number;
  }) {
    const existing = await prisma.settlement.findFirst({
      where: { paymentId: opts.paymentId, type: SettlementType.SHORT_STAY },
    });
    if (existing) return existing;

    return prisma.settlement.create({
      data: {
        type: SettlementType.SHORT_STAY,
        amount: opts.amount,
        status: SettlementStatus.PENDING,
        beneficiaryUserId: opts.beneficiaryUserId,
        paymentId: opts.paymentId,
      },
    });
  },

  async list(opts: {
    type?: SettlementType;
    status?: SettlementStatus;
    page?: number;
    limit?: number;
  }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 50;
    const where = {
      ...(opts.type ? { type: opts.type } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.settlement.findMany({
        where,
        include: {
          beneficiary: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          serviceBooking: {
            select: {
              id: true,
              service: true,
              totalAmount: true,
              providerEarnings: true,
              completedAt: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              ownerEarnings: true,
              commissionAmount: true,
              bookingId: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.settlement.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async markSettled(opts: {
    settlementId: string;
    adminId: string;
    note?: string;
  }) {
    const settlement = await prisma.settlement.findUnique({
      where: { id: opts.settlementId },
    });
    if (!settlement) throw new Error("Settlement not found");
    if (settlement.status === SettlementStatus.SETTLED) {
      throw new Error("Already settled");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.settlement.update({
        where: { id: opts.settlementId },
        data: {
          status: SettlementStatus.SETTLED,
          settledAt: new Date(),
          settledByAdminId: opts.adminId,
          note: opts.note?.trim() || settlement.note,
        },
      });

      if (settlement.serviceBookingId) {
        await tx.serviceBooking.update({
          where: { id: settlement.serviceBookingId },
          data: {
            settleStatus: "SETTLED",
            settledAt: new Date(),
            settledByAdminId: opts.adminId,
          },
        });
      }

      if (settlement.paymentId) {
        await tx.payment.update({
          where: { id: settlement.paymentId },
          data: {
            settleStatus: "SETTLED",
            settledAt: new Date(),
            settledByAdminId: opts.adminId,
          },
        });
      }

      return row;
    });

    await notificationService
      .create({
        userId: settlement.beneficiaryUserId,
        type: NotificationType.PAYMENT,
        title: "Payout settled",
        message: `MYKEYS marked your £${settlement.amount.toFixed(2)} payout as settled.`,
        priority: NotificationPriority.NORMAL,
        category: NotificationCategory.INFORMATIONAL,
        actionUrl:
          settlement.type === SettlementType.SERVICE
            ? "/service/dashboard/earnings"
            : "/owner/dashboard",
        data: { settlementId: settlement.id },
      })
      .catch(() => undefined);

    return updated;
  },

  /** Sync pending short-stay settlements from paid payments missing a settlement row */
  async syncShortStayPendings() {
    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        bookingId: { not: null },
        ownerEarnings: { gt: 0 },
        OR: [
          { settleStatus: "PENDING" },
          { settleStatus: "NOT_APPLICABLE" },
        ],
        settlements: { none: {} },
      },
      include: {
        booking: {
          select: {
            ownerId: true,
            property: { select: { ownerId: true, rentalType: true, listingType: true } },
          },
        },
      },
      take: 200,
    });

    let created = 0;
    for (const p of payments) {
      const booking = p.booking;
      if (!booking) continue;
      if (
        booking.property.listingType !== "RENT" ||
        booking.property.rentalType !== "SHORT_TERM"
      ) {
        continue;
      }

      const ownerId = booking.ownerId || booking.property.ownerId;
      if (!ownerId || !p.ownerEarnings) continue;

      await prisma.payment.update({
        where: { id: p.id },
        data: { settleStatus: "PENDING" },
      });

      await this.ensureShortStaySettlement({
        paymentId: p.id,
        beneficiaryUserId: ownerId,
        amount: p.ownerEarnings,
      });
      created += 1;
    }
    return { created };
  },
};
