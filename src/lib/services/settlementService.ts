import { prisma } from "@/lib/prisma";
import { Prisma, SettlementStatus, SettlementType } from "@prisma/client";
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

    const bookingInclude = {
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
    } as const;

    const query = (beneficiarySelect: Record<string, boolean>) =>
      Promise.all([
        prisma.settlement.findMany({
          where,
          include: {
            beneficiary: { select: beneficiarySelect },
            ...bookingInclude,
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.settlement.count({ where }),
      ]);

    const [items, total] = await query({
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    });

    const beneficiaryIds = [
      ...new Set(items.map((item) => item.beneficiaryUserId).filter(Boolean)),
    ];
    const emptyBank = {
      bankAccountHolder: null as string | null,
      bankSortCode: null as string | null,
      bankAccountNumber: null as string | null,
      bankName: null as string | null,
    };
    const bankByUser = new Map<string, typeof emptyBank>();
    if (beneficiaryIds.length > 0) {
      try {
        const rows = await prisma.$queryRaw<
          ({ id: string } & typeof emptyBank)[]
        >`
          SELECT id, "bankAccountHolder", "bankSortCode", "bankAccountNumber", "bankName"
          FROM "User"
          WHERE id IN (${Prisma.join(beneficiaryIds)})
        `;
        for (const row of rows) {
          bankByUser.set(row.id, {
            bankAccountHolder: row.bankAccountHolder,
            bankSortCode: row.bankSortCode,
            bankAccountNumber: row.bankAccountNumber,
            bankName: row.bankName,
          });
        }
      } catch {
        // Columns not migrated yet
      }
    }

    return {
      items: items.map((item) => ({
        ...item,
        beneficiary: {
          ...item.beneficiary,
          ...(bankByUser.get(item.beneficiaryUserId) ?? emptyBank),
        },
      })),
      total,
      page,
      limit,
    };
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

  async queuePaidShortStayByPaymentId(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            ownerId: true,
            property: {
              select: { ownerId: true, rentalType: true, listingType: true },
            },
          },
        },
      },
    });
    if (!payment) return null;
    return this.queuePaidShortStayPayment(payment);
  },

  /**
   * Create / backfill a short-stay settlement from a paid booking payment.
   * Computes ownerEarnings from AdminSettings.shortRentCommissionPercent when missing.
   */
  async queuePaidShortStayPayment(payment: {
    id: string;
    amount: number;
    status: string;
    ownerEarnings?: number | null;
    commissionAmount?: number | null;
    commissionPercent?: number | null;
    settleStatus?: string | null;
    booking?: {
      ownerId?: string | null;
      property: { ownerId: string; rentalType?: string | null; listingType?: string | null };
    } | null;
  }) {
    if (payment.status !== "PAID") return null;
    if (payment.settleStatus === "SETTLED") return null;
    const booking = payment.booking;
    if (!booking?.property) return null;
    if (
      booking.property.listingType !== "RENT" ||
      booking.property.rentalType !== "SHORT_TERM"
    ) {
      return null;
    }

    const ownerId = booking.ownerId || booking.property.ownerId;
    if (!ownerId) return null;

    let ownerEarnings = payment.ownerEarnings ?? null;
    let commissionAmount = payment.commissionAmount ?? null;
    let commissionPercent = payment.commissionPercent ?? null;

    if (ownerEarnings == null || ownerEarnings <= 0) {
      if (commissionAmount != null) {
        ownerEarnings = Math.max(0, parseFloat((payment.amount - commissionAmount).toFixed(2)));
      } else {
        if (commissionPercent == null) {
          try {
            const settings = await prisma.adminSettings.findUnique({
              where: { id: "singleton" },
              select: { shortRentCommissionPercent: true },
            });
            commissionPercent = settings?.shortRentCommissionPercent ?? 0;
          } catch {
            commissionPercent = 0;
          }
        }
        const pct = Math.min(100, Math.max(0, Number(commissionPercent) || 0));
        commissionPercent = pct;
        commissionAmount = parseFloat(((payment.amount * pct) / 100).toFixed(2));
        ownerEarnings = parseFloat((payment.amount - commissionAmount).toFixed(2));
      }

      try {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            ownerEarnings,
            commissionAmount,
            commissionPercent,
            settleStatus: "PENDING",
          },
        });
      } catch {
        await prisma.payment
          .update({
            where: { id: payment.id },
            data: { ownerEarnings, commissionAmount, commissionPercent },
          })
          .catch(() => undefined);
      }
    } else if (payment.settleStatus !== "PENDING") {
      await prisma.payment
        .update({
          where: { id: payment.id },
          data: { settleStatus: "PENDING" },
        })
        .catch(() => undefined);
    }

    if (!ownerEarnings || ownerEarnings <= 0) return null;

    return this.ensureShortStaySettlement({
      paymentId: payment.id,
      beneficiaryUserId: ownerId,
      amount: ownerEarnings,
    });
  },

  /** Sync pending short-stay settlements from paid booking payments. */
  async syncShortStayPendings() {
    const include = {
      booking: {
        select: {
          ownerId: true,
          property: { select: { ownerId: true, rentalType: true, listingType: true } },
        },
      },
    } as const;

    let payments;
    try {
      payments = await prisma.payment.findMany({
        where: {
          status: "PAID",
          bookingId: { not: null },
          packageId: null,
          settleStatus: { not: "SETTLED" },
          settlements: { none: {} },
        },
        include,
        take: 500,
      });
    } catch {
      payments = await prisma.payment.findMany({
        where: {
          status: "PAID",
          bookingId: { not: null },
          packageId: null,
          settlements: { none: {} },
        },
        include,
        take: 500,
      });
    }

    let created = 0;
    for (const payment of payments) {
      const row = await this.queuePaidShortStayPayment(payment);
      if (row) created += 1;
    }
    return { created, scanned: payments.length };
  },
};
