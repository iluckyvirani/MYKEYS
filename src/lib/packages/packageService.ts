import { prisma } from '../prisma';
import {
  PackageInput,
  OwnerPackageWithUsage,
  OwnerActivePackages,
  DurationUnit,
  PackageCategory,
  PackageAudience,
} from '@/types/package';
import { addDays, addMonths, addYears } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcEndDate(startDate: Date, durationValue: number, durationUnit: DurationUnit): Date {
  switch (durationUnit) {
    case 'days':   return addDays(startDate, durationValue);
    case 'months': return addMonths(startDate, durationValue);
    case 'years':  return addYears(startDate, durationValue);
  }
}

function daysRemaining(endDate: Date): number {
  return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86_400_000));
}

/** Which package category a listing needs, or null if ungated (short stay). */
export function packageCategoryForListing(
  listingType: string | null | undefined,
  rentalType?: string | null
): PackageCategory | null {
  const lt = (listingType || '').toUpperCase();
  const rt = (rentalType || '').toUpperCase();
  if (lt === 'BUY') return 'SALE';
  if (lt === 'RENT' && rt !== 'SHORT_TERM') return 'RENT';
  return null;
}

function categoryLabel(category: PackageCategory): string {
  return category === 'SALE' ? 'Sale' : 'Rent';
}

async function getSubscriberAudiences(userId: string): Promise<PackageAudience[]> {
  const roles = await prisma.userRoleAssignment.findMany({
    where: { userId },
    select: { role: true },
  });
  const audiences: PackageAudience[] = [];
  if (roles.some((r) => r.role === 'OWNER')) audiences.push('OWNER');
  if (roles.some((r) => r.role === 'AGENT')) audiences.push('AGENT');
  return audiences.length > 0 ? audiences : ['OWNER'];
}

function resolveAudiences(
  requested: PackageAudience | undefined,
  fallback: PackageAudience[]
): PackageAudience[] {
  return requested ? [requested] : fallback;
}

// ─── Package CRUD (admin) ─────────────────────────────────────────────────────

export const packageService = {
  async create(data: PackageInput) {
    const category = data.category === 'SALE' ? 'SALE' : 'RENT';
    const audience = data.audience === 'AGENT' ? 'AGENT' : 'OWNER';
    return prisma.package.create({
      data: {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        durationValue: data.durationValue,
        durationUnit: data.durationUnit,
        isActive: data.isActive ?? true,
        category,
        audience,
        propertyLimit: data.propertyLimit ?? 1,
        featuredLimit: data.featuredLimit ?? 0,
        showOwnerName: data.showOwnerName ?? false,
        showOwnerPhone: data.showOwnerPhone ?? false,
        directInquiryToOwner: data.directInquiryToOwner ?? false,
        adminCCOnInquiry: data.adminCCOnInquiry ?? false,
        fullAdminSupport: data.fullAdminSupport ?? false,
        docExpiryAlert: data.docExpiryAlert ?? false,
      },
    });
  },

  async getAll(
    activeOnly = false,
    category?: PackageCategory,
    audience?: PackageAudience
  ) {
    return prisma.package.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(category ? { category } : {}),
        ...(audience ? { audience } : {}),
      },
      orderBy: [{ audience: 'asc' }, { category: 'asc' }, { price: 'asc' }],
    });
  },

  async getById(id: string) {
    return prisma.package.findUnique({ where: { id } });
  },

  async update(id: string, data: Partial<PackageInput>) {
    const payload: Record<string, unknown> = { ...data };
    if (data.category !== undefined) {
      payload.category = data.category === 'SALE' ? 'SALE' : 'RENT';
    }
    if (data.audience !== undefined) {
      payload.audience = data.audience === 'AGENT' ? 'AGENT' : 'OWNER';
    }
    return prisma.package.update({ where: { id }, data: payload });
  },

  async delete(id: string) {
    const activeCount = await prisma.ownerPackage.count({
      where: { packageId: id, status: 'ACTIVE' },
    });
    if (activeCount > 0) {
      throw new Error('Cannot delete a package that has active subscribers.');
    }
    return prisma.package.delete({ where: { id } });
  },

  // ─── Owner subscription ───────────────────────────────────────────────────

  /**
   * Create a PENDING subscription — the OwnerPackage is created but not yet active.
   * Call activateSubscription() after payment succeeds.
   */
  async createPendingSubscription(
    ownerId: string,
    packageId: string,
    opts?: { audience?: PackageAudience }
  ): Promise<{ ownerPackageId: string; price: number }> {
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error('Package not found');
    if (!pkg.isActive) throw new Error('Package is not available for purchase');

    const allowedAudiences = await getSubscriberAudiences(ownerId);
    const pkgAudience = pkg.audience as PackageAudience;
    if (opts?.audience && pkgAudience !== opts.audience) {
      throw new Error('This package is not available for your account type');
    }
    if (!allowedAudiences.includes(pkgAudience)) {
      throw new Error('This package is not available for your account type');
    }

    // Clean up stale PENDING subscriptions for the same package/owner pair
    await prisma.ownerPackage.deleteMany({
      where: { ownerId, packageId, status: 'PENDING' },
    });

    const placeholder = new Date();
    const sub = await prisma.ownerPackage.create({
      data: {
        packageId,
        ownerId,
        status: 'PENDING',
        startDate: placeholder,
        endDate: placeholder,
      },
    });

    return { ownerPackageId: sub.id, price: pkg.price };
  },

  /**
   * Activate an OwnerPackage after a successful payment.
   * Cancels any previously active subscription in the *same category* only.
   */
  async activateSubscription(ownerPackageId: string, paymentId: string): Promise<void> {
    const ownerPkg = await prisma.ownerPackage.findUnique({
      where: { id: ownerPackageId },
      include: { package: true },
    });
    if (!ownerPkg) return;

    const category = ownerPkg.package.category as PackageCategory;

    // Cancel other ACTIVE subscriptions in the same category
    const sameCategoryActive = await prisma.ownerPackage.findMany({
      where: {
        ownerId: ownerPkg.ownerId,
        status: 'ACTIVE',
        id: { not: ownerPackageId },
        package: { category, audience: ownerPkg.package.audience },
      },
      select: { id: true },
    });

    if (sameCategoryActive.length > 0) {
      await prisma.ownerPackage.updateMany({
        where: { id: { in: sameCategoryActive.map((s) => s.id) } },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    const startDate = new Date();
    const endDate = calcEndDate(
      startDate,
      ownerPkg.package.durationValue,
      ownerPkg.package.durationUnit as DurationUnit
    );

    await prisma.ownerPackage.update({
      where: { id: ownerPackageId },
      data: { status: 'ACTIVE', startDate, endDate, lastPaymentId: paymentId },
    });
  },

  /** @deprecated Use createPendingSubscription + Stripe payment instead */
  async subscribeOwner(ownerId: string, packageId: string): Promise<OwnerPackageWithUsage> {
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error('Package not found');
    if (!pkg.isActive) throw new Error('Package is not available for purchase');

    const category = pkg.category as PackageCategory;
    const sameCategoryActive = await prisma.ownerPackage.findMany({
      where: { ownerId, status: 'ACTIVE', package: { category } },
      select: { id: true },
    });
    if (sameCategoryActive.length > 0) {
      await prisma.ownerPackage.updateMany({
        where: { id: { in: sameCategoryActive.map((s) => s.id) } },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    const startDate = new Date();
    const endDate = calcEndDate(startDate, pkg.durationValue, pkg.durationUnit as DurationUnit);

    const sub = await prisma.ownerPackage.create({
      data: { packageId, ownerId, status: 'ACTIVE', startDate, endDate },
      include: { package: true },
    });

    return mapOwnerPackage(sub);
  },

  async getOwnerActivePackage(
    ownerId: string,
    category: PackageCategory,
    audience?: PackageAudience
  ): Promise<OwnerPackageWithUsage | null> {
    const audiences = resolveAudiences(
      audience,
      await getSubscriberAudiences(ownerId)
    );

    for (const aud of audiences) {
      const sub = await prisma.ownerPackage.findFirst({
        where: {
          ownerId,
          status: 'ACTIVE',
          endDate: { gt: new Date() },
          package: { category, audience: aud },
        },
        include: { package: true },
      });
      if (sub) return mapOwnerPackage(sub);
    }
    return null;
  },

  async getOwnerActivePackages(
    ownerId: string,
    audience?: PackageAudience
  ): Promise<OwnerActivePackages> {
    const [sale, rent] = await Promise.all([
      this.getOwnerActivePackage(ownerId, 'SALE', audience),
      this.getOwnerActivePackage(ownerId, 'RENT', audience),
    ]);
    return { SALE: sale, RENT: rent };
  },

  async incrementPropertyUsage(
    ownerId: string,
    category: PackageCategory,
    count = 1,
    audience?: PackageAudience
  ) {
    const audiences = resolveAudiences(
      audience,
      await getSubscriberAudiences(ownerId)
    );
    for (const aud of audiences) {
      const active = await prisma.ownerPackage.findFirst({
        where: {
          ownerId,
          status: 'ACTIVE',
          endDate: { gt: new Date() },
          package: { category, audience: aud },
        },
        select: { id: true },
      });
      if (!active) continue;
      return prisma.ownerPackage.updateMany({
        where: { id: active.id },
        data: { propertiesUsed: { increment: count } },
      });
    }
    return { count: 0 };
  },

  async decrementPropertyUsage(
    ownerId: string,
    category: PackageCategory,
    count = 1,
    audience?: PackageAudience
  ) {
    const audiences = resolveAudiences(
      audience,
      await getSubscriberAudiences(ownerId)
    );
    for (const aud of audiences) {
      const active = await prisma.ownerPackage.findFirst({
        where: {
          ownerId,
          status: 'ACTIVE',
          package: { category, audience: aud },
        },
        select: { id: true, propertiesUsed: true },
      });
      if (!active || active.propertiesUsed <= 0) continue;
      return prisma.ownerPackage.updateMany({
        where: { id: active.id },
        data: { propertiesUsed: { decrement: Math.min(count, active.propertiesUsed) } },
      });
    }
    return { count: 0 };
  },

  async canPublish(
    ownerId: string,
    opts: {
      listingType: string;
      rentalType?: string | null;
      audience?: PackageAudience;
    }
  ): Promise<{ allowed: boolean; reason?: string }> {
    const category = packageCategoryForListing(opts.listingType, opts.rentalType);
    if (!category) {
      return { allowed: true };
    }

    const audiences = resolveAudiences(
      opts.audience,
      await getSubscriberAudiences(ownerId)
    );

    for (const aud of audiences) {
      const sub = await prisma.ownerPackage.findFirst({
        where: {
          ownerId,
          status: 'ACTIVE',
          endDate: { gt: new Date() },
          package: { category, audience: aud },
        },
        include: { package: true },
      });

      if (!sub) continue;

      const limit = sub.package.propertyLimit;
      if (limit > 0 && sub.propertiesUsed >= limit) {
        continue;
      }
      return { allowed: true };
    }

    const label = categoryLabel(category);
    return {
      allowed: false,
      reason:
        category === 'SALE'
          ? `You need an active ${label} package to publish Buy listings.`
          : `You need an active ${label} package to publish Long Rent listings.`,
    };
  },

  async canFeature(
    ownerId: string,
    opts: { listingType: string; rentalType?: string | null }
  ): Promise<{ allowed: boolean; reason?: string }> {
    const category = packageCategoryForListing(opts.listingType, opts.rentalType);
    if (!category) {
      return {
        allowed: false,
        reason: 'Short stay listings cannot use package featured slots.',
      };
    }

    const sub = await prisma.ownerPackage.findFirst({
      where: {
        ownerId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        package: { category },
      },
      include: { package: true },
    });

    const label = categoryLabel(category);
    if (!sub) {
      return {
        allowed: false,
        reason: `You need an active ${label} package to feature this property.`,
      };
    }

    const limit = sub.package.featuredLimit;
    if (limit <= 0) {
      return {
        allowed: false,
        reason: `Your current ${label} package does not include featured listings. Upgrade to enable this feature.`,
      };
    }

    if (sub.featuredUsed >= limit) {
      return {
        allowed: false,
        reason: `You have used all ${limit} featured slot${limit === 1 ? '' : 's'} in your ${label} package. Unfeature another property first.`,
      };
    }

    return { allowed: true };
  },

  async incrementFeaturedUsage(ownerId: string, category: PackageCategory) {
    const active = await prisma.ownerPackage.findFirst({
      where: {
        ownerId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        package: { category },
      },
      select: { id: true },
    });
    if (!active) return { count: 0 };
    return prisma.ownerPackage.updateMany({
      where: { id: active.id },
      data: { featuredUsed: { increment: 1 } },
    });
  },

  async decrementFeaturedUsage(ownerId: string, category: PackageCategory) {
    const active = await prisma.ownerPackage.findFirst({
      where: {
        ownerId,
        status: 'ACTIVE',
        package: { category },
      },
      select: { id: true, featuredUsed: true },
    });
    if (!active || active.featuredUsed <= 0) return { count: 0 };
    return prisma.ownerPackage.updateMany({
      where: { id: active.id },
      data: { featuredUsed: { decrement: 1 } },
    });
  },

  async getOwnerPackageUsage(ownerId: string): Promise<OwnerActivePackages> {
    return this.getOwnerActivePackages(ownerId);
  },

  async getUpgradeOptions(
    ownerId: string,
    category: PackageCategory,
    audience?: PackageAudience
  ) {
    const audiences = resolveAudiences(
      audience,
      await getSubscriberAudiences(ownerId)
    );
    const aud = audiences[0] ?? 'OWNER';

    const activeSub = await prisma.ownerPackage.findFirst({
      where: {
        ownerId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        package: { category, audience: aud },
      },
      include: { package: { select: { price: true } } },
    });
    const currentPrice = activeSub?.package?.price ?? -1;
    return prisma.package.findMany({
      where: { isActive: true, category, audience: aud, price: { gt: currentPrice } },
      orderBy: { price: 'asc' },
    });
  },

  async canUpgradePackage(
    ownerId: string,
    category: PackageCategory,
    audience?: PackageAudience
  ): Promise<boolean> {
    const options = await this.getUpgradeOptions(ownerId, category, audience);
    return options.length > 0;
  },

  async expirePackages() {
    const now = new Date();

    const expired = await prisma.ownerPackage.findMany({
      where: { status: 'ACTIVE', endDate: { lte: now } },
      select: {
        id: true,
        ownerId: true,
        endDate: true,
        package: { select: { name: true, category: true } },
        owner: { select: { email: true, firstName: true } },
      },
    });

    if (expired.length === 0) {
      return { expiredCount: 0, deactivatedProperties: 0, emailsSent: 0 };
    }

    const expiredIds = expired.map((e) => e.id);

    await prisma.ownerPackage.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'EXPIRED' },
    });

    let deactivatedCount = 0;

    for (const sub of expired) {
      const category = sub.package.category as PackageCategory;
      const listingFilter =
        category === 'SALE'
          ? { listingType: 'BUY' as const }
          : { listingType: 'RENT' as const, rentalType: 'LONG_TERM' as const };

      const deactivated = await prisma.property.updateMany({
        where: {
          ownerId: sub.ownerId,
          status: 'ACTIVE',
          ...listingFilter,
        },
        data: { status: 'INACTIVE' },
      });
      deactivatedCount += deactivated.count;
    }

    const { emailService } = await import('@/lib/email/emailService');
    const { notificationService } = await import(
      '@/lib/notifications/notificationService'
    );
    const {
      NotificationType,
      NotificationPriority,
      NotificationCategory,
    } = await import('@/types/notification');

    let emailsSent = 0;
    for (const sub of expired) {
      const label = categoryLabel(sub.package.category as PackageCategory);
      try {
        await emailService.sendPackageExpiredEmail({
          to: sub.owner.email,
          firstName: sub.owner.firstName,
          packageName: sub.package.name,
        });
        emailsSent += 1;

        await notificationService.create({
          userId: sub.ownerId,
          type: NotificationType.REMINDER,
          title: `${label} package expired`,
          message:
            sub.package.category === 'SALE'
              ? `Your ${sub.package.name} Sale package has expired. Buy listings were taken offline. Renew to restore visibility.`
              : `Your ${sub.package.name} Rent package has expired. Long Rent listings were taken offline. Renew to restore visibility.`,
          priority: NotificationPriority.HIGH,
          category: NotificationCategory.ACTION_REQUIRED,
          actionUrl: '/owner/dashboard/packages',
          data: { ownerPackageId: sub.id, packageCategory: sub.package.category },
        });
      } catch (err) {
        console.error(`Package expiry email failed for ${sub.id}:`, err);
      }
    }

    return {
      expiredCount: expired.length,
      deactivatedProperties: deactivatedCount,
      emailsSent,
    };
  },

  /**
   * Daily: remind owners 7 days and 1 day before package endDate.
   */
  async processPackageRenewReminders(now = new Date()) {
    const { emailService } = await import('@/lib/email/emailService');
    const { notificationService } = await import(
      '@/lib/notifications/notificationService'
    );
    const {
      NotificationType,
      NotificationPriority,
      NotificationCategory,
    } = await import('@/types/notification');

    const reminderDays = [7, 1];
    let sent = 0;

    for (const days of reminderDays) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() + days);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const dateKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const reminderKey = `${days}d-${dateKey}`;

      const subs = await prisma.ownerPackage.findMany({
        where: {
          status: 'ACTIVE',
          endDate: { gte: start, lt: end },
          OR: [
            { lastRenewReminderKey: null },
            { lastRenewReminderKey: { not: reminderKey } },
          ],
        },
        select: {
          id: true,
          ownerId: true,
          endDate: true,
          package: { select: { name: true, category: true } },
          owner: { select: { email: true, firstName: true } },
        },
      });

      for (const sub of subs) {
        const label = categoryLabel(sub.package.category as PackageCategory);
        try {
          await emailService.sendPackageRenewReminderEmail({
            to: sub.owner.email,
            firstName: sub.owner.firstName,
            packageName: sub.package.name,
            daysLeft: days,
            endDate: sub.endDate,
          });

          await notificationService.create({
            userId: sub.ownerId,
            type: NotificationType.REMINDER,
            title: days === 1 ? `${label} package expires tomorrow` : `${label} package renew reminder`,
            message: `Your ${sub.package.name} ${label} package expires in ${days} day${days === 1 ? '' : 's'}. Renew now to keep listings visible.`,
            priority: days === 1 ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
            category: NotificationCategory.ACTION_REQUIRED,
            actionUrl: '/owner/dashboard/packages',
            data: { ownerPackageId: sub.id, daysLeft: days, packageCategory: sub.package.category },
          });

          await prisma.ownerPackage.update({
            where: { id: sub.id },
            data: { lastRenewReminderKey: reminderKey },
          });

          sent += 1;
        } catch (err) {
          console.error(`Package renew reminder failed for ${sub.id}:`, err);
        }
      }
    }

    return { sent };
  },

  async getAdminSettings() {
    return prisma.adminSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', shortRentCommissionPercent: 0 },
      update: {},
    });
  },

  async updateAdminSettings(data: {
    shortRentCommissionPercent?: number;
    contactSupportEmail?: string;
    contactSupportPhone?: string;
    contactSupportDescription?: string;
  }) {
    return prisma.adminSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    });
  },
};

// ─── Mapping helper ───────────────────────────────────────────────────────────

function mapOwnerPackage(sub: any): OwnerPackageWithUsage {
  const pkg = sub.package;
  return {
    id: sub.id,
    packageId: pkg.id,
    ownerId: sub.ownerId,
    status: sub.status,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate.toISOString(),
    nextBilling: sub.nextBilling?.toISOString(),
    daysRemaining: daysRemaining(sub.endDate),

    propertiesUsed: sub.propertiesUsed,
    propertiesLimit: pkg.propertyLimit,
    featuredUsed: sub.featuredUsed,
    featuredLimit: pkg.featuredLimit,

    packageName: pkg.name,
    price: pkg.price,
    durationValue: pkg.durationValue,
    durationUnit: pkg.durationUnit as DurationUnit,
    shortDescription: pkg.shortDescription ?? undefined,
    category: (pkg.category as PackageCategory) ?? 'RENT',

    showOwnerName: pkg.showOwnerName,
    showOwnerPhone: pkg.showOwnerPhone,
    directInquiryToOwner: pkg.directInquiryToOwner,
    adminCCOnInquiry: pkg.adminCCOnInquiry,
    fullAdminSupport: pkg.fullAdminSupport,
    docExpiryAlert: pkg.docExpiryAlert,
  };
}
