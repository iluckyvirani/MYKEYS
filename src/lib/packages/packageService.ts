import { prisma } from '../prisma';
import { PackageInput, OwnerPackageWithUsage, DurationUnit } from '@/types/package';
import { addDays, addMonths, addYears } from 'date-fns';

// ─── Helper: calculate endDate from duration ────────────────────────────────

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

// ─── Package CRUD (admin) ─────────────────────────────────────────────────────

export const packageService = {
  async create(data: PackageInput) {
    return prisma.package.create({
      data: {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        durationValue: data.durationValue,
        durationUnit: data.durationUnit,
        isActive: data.isActive ?? true,
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

  async getAll(activeOnly = false) {
    return prisma.package.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { price: 'asc' },
    });
  },

  async getById(id: string) {
    return prisma.package.findUnique({ where: { id } });
  },

  async update(id: string, data: Partial<PackageInput>) {
    return prisma.package.update({ where: { id }, data });
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

  async subscribeOwner(ownerId: string, packageId: string): Promise<OwnerPackageWithUsage> {
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) throw new Error('Package not found');
    if (!pkg.isActive) throw new Error('Package is not available for purchase');

    await prisma.ownerPackage.updateMany({
      where: { ownerId, status: 'ACTIVE' },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    const startDate = new Date();
    const endDate = calcEndDate(startDate, pkg.durationValue, pkg.durationUnit as DurationUnit);

    const sub = await prisma.ownerPackage.create({
      data: { packageId, ownerId, status: 'ACTIVE', startDate, endDate },
      include: { package: true },
    });

    return mapOwnerPackage(sub);
  },

  async getOwnerActivePackage(ownerId: string): Promise<OwnerPackageWithUsage | null> {
    const sub = await prisma.ownerPackage.findFirst({
      where: { ownerId, status: 'ACTIVE', endDate: { gt: new Date() } },
      include: { package: true },
    });
    return sub ? mapOwnerPackage(sub) : null;
  },

  async incrementPropertyUsage(ownerId: string, count = 1) {
    return prisma.ownerPackage.updateMany({
      where: { ownerId, status: 'ACTIVE' },
      data: { propertiesUsed: { increment: count } },
    });
  },

  async decrementPropertyUsage(ownerId: string, count = 1) {
    return prisma.ownerPackage.updateMany({
      where: { ownerId, status: 'ACTIVE' },
      data: { propertiesUsed: { decrement: count } },
    });
  },

  async canPublish(ownerId: string): Promise<{ allowed: boolean; reason?: string }> {
    const sub = await prisma.ownerPackage.findFirst({
      where: { ownerId, status: 'ACTIVE', endDate: { gt: new Date() } },
      include: { package: true },
    });

    if (!sub) {
      return { allowed: false, reason: 'You need an active package to publish Long Rent or Buy listings.' };
    }

    const limit = sub.package.propertyLimit;
    if (limit > 0 && sub.propertiesUsed >= limit) {
      return {
        allowed: false,
        reason: `You have reached your package limit of ${limit} live listing${limit === 1 ? '' : 's'}. Upgrade your package to publish more.`,
      };
    }

    return { allowed: true };
  },

  async expirePackages() {
    const now = new Date();

    const expired = await prisma.ownerPackage.findMany({
      where: { status: 'ACTIVE', endDate: { lte: now } },
      select: { id: true, ownerId: true },
    });

    if (expired.length === 0) return { expiredCount: 0, deactivatedProperties: 0 };

    const ownerIds = expired.map((e) => e.ownerId);
    const expiredIds = expired.map((e) => e.id);

    await prisma.ownerPackage.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'EXPIRED' },
    });

    const deactivated = await prisma.property.updateMany({
      where: {
        ownerId: { in: ownerIds },
        status: 'ACTIVE',
        OR: [
          { listingType: 'BUY' },
          { listingType: 'RENT', rentalType: 'LONG_TERM' },
        ],
      },
      data: { status: 'INACTIVE' },
    });

    return { expiredCount: expired.length, deactivatedProperties: deactivated.count };
  },

  async getAdminSettings() {
    return prisma.adminSettings.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', shortRentCommissionPercent: 0 },
      update: {},
    });
  },

  async updateAdminSettings(data: { shortRentCommissionPercent: number }) {
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

    showOwnerName: pkg.showOwnerName,
    showOwnerPhone: pkg.showOwnerPhone,
    directInquiryToOwner: pkg.directInquiryToOwner,
    adminCCOnInquiry: pkg.adminCCOnInquiry,
    fullAdminSupport: pkg.fullAdminSupport,
    docExpiryAlert: pkg.docExpiryAlert,
  };
}
