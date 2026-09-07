import { prisma } from "@/lib/prisma";
import { createHash, randomInt } from "crypto";

function moneyOrZero(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return parseFloat(n.toFixed(2));
}

export type CatalogServiceInput = {
  name: string;
  description?: string;
  image?: string;
  price: number;
  commissionPercent: number;
  categoryId: string;
  isActive?: boolean;
  sortOrder?: number;
  morningSurcharge?: number;
  afternoonSurcharge?: number;
  eveningSurcharge?: number;
};

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export function generateServiceActionOtp(): { otp: string; hash: string; expiresAt: Date } {
  const otp = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, hash: hashOtp(otp), expiresAt };
}

export function verifyServiceActionOtp(otp: string, hash: string | null | undefined): boolean {
  if (!hash) return false;
  return hashOtp(otp.trim()) === hash;
}

export function splitCatalogPrice(price: number, commissionPercent: number) {
  const commissionAmount = parseFloat(((price * commissionPercent) / 100).toFixed(2));
  const providerEarnings = parseFloat((price - commissionAmount).toFixed(2));
  return { commissionAmount, providerEarnings };
}

const SLOT_DEFAULTS = {
  morningSurcharge: 0,
  afternoonSurcharge: 0,
  eveningSurcharge: 0,
};

export const catalogService = {
  async list(opts?: { activeOnly?: boolean; categoryId?: string }) {
    const where = {
      ...(opts?.activeOnly ? { isActive: true } : {}),
      ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
    };
    try {
      return await prisma.catalogService.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          _count: { select: { offeredBy: true, bookings: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    } catch (err) {
      console.warn("Catalog list with slot extras failed, retrying without them:", err);
      const rows = await prisma.catalogService.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          price: true,
          commissionPercent: true,
          isActive: true,
          sortOrder: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, icon: true } },
          _count: { select: { offeredBy: true, bookings: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      return rows.map((row) => ({ ...row, ...SLOT_DEFAULTS }));
    }
  },

  async getById(id: string) {
    try {
      return await prisma.catalogService.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true, icon: true } },
        },
      });
    } catch (err) {
      console.warn("Catalog getById with slot extras failed, retrying without them:", err);
      const row = await prisma.catalogService.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          price: true,
          commissionPercent: true,
          isActive: true,
          sortOrder: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, icon: true } },
        },
      });
      return row ? { ...row, ...SLOT_DEFAULTS } : null;
    }
  },

  async create(data: CatalogServiceInput) {
    if (!data.name?.trim()) throw new Error("Name is required");
    if (!data.categoryId) throw new Error("Category is required");
    if (typeof data.price !== "number" || data.price < 0) throw new Error("Price must be £0 or more");
    if (
      typeof data.commissionPercent !== "number" ||
      data.commissionPercent < 0 ||
      data.commissionPercent > 100
    ) {
      throw new Error("Commission must be between 0 and 100");
    }

    const category = await prisma.serviceCategoryInfo.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) throw new Error("Category not found");

    return prisma.catalogService.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        image: data.image || null,
        price: data.price,
        commissionPercent: data.commissionPercent,
        morningSurcharge: moneyOrZero(data.morningSurcharge),
        afternoonSurcharge: moneyOrZero(data.afternoonSurcharge),
        eveningSurcharge: moneyOrZero(data.eveningSurcharge),
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, data: Partial<CatalogServiceInput>) {
    const existing = await prisma.catalogService.findUnique({ where: { id } });
    if (!existing) throw new Error("Catalog service not found");

    if (data.categoryId) {
      const category = await prisma.serviceCategoryInfo.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) throw new Error("Category not found");
    }
    if (data.price !== undefined && (Number.isNaN(data.price) || data.price < 0)) {
      throw new Error("Price must be £0 or more");
    }
    if (
      data.commissionPercent !== undefined &&
      (data.commissionPercent < 0 || data.commissionPercent > 100)
    ) {
      throw new Error("Commission must be between 0 and 100");
    }

    return prisma.catalogService.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.image !== undefined ? { image: data.image || null } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.commissionPercent !== undefined
          ? { commissionPercent: data.commissionPercent }
          : {}),
        ...(data.morningSurcharge !== undefined
          ? { morningSurcharge: moneyOrZero(data.morningSurcharge) }
          : {}),
        ...(data.afternoonSurcharge !== undefined
          ? { afternoonSurcharge: moneyOrZero(data.afternoonSurcharge) }
          : {}),
        ...(data.eveningSurcharge !== undefined
          ? { eveningSurcharge: moneyOrZero(data.eveningSurcharge) }
          : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async remove(id: string) {
    const bookings = await prisma.serviceBooking.count({
      where: { catalogServiceId: id },
    });
    if (bookings > 0) {
      // Soft-disable instead of hard delete when booked
      return prisma.catalogService.update({
        where: { id },
        data: { isActive: false },
      });
    }
    await prisma.providerOfferedService.deleteMany({ where: { catalogServiceId: id } });
    return prisma.catalogService.delete({ where: { id } });
  },

  /** Catalog services for provider's categories + which they already offer */
  async listForProvider(providerId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { categories: true, category: true },
    });
    if (!provider) throw new Error("Provider not found");

    const categoryIds = Array.from(
      new Set([...(provider.categories || []), provider.category].filter(Boolean))
    );

    let catalog;
    try {
      catalog = await prisma.catalogService.findMany({
        where: { isActive: true, categoryId: { in: categoryIds } },
        include: { category: { select: { id: true, name: true } } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    } catch {
      const rows = await prisma.catalogService.findMany({
        where: { isActive: true, categoryId: { in: categoryIds } },
        select: {
          id: true,
          name: true,
          description: true,
          image: true,
          price: true,
          commissionPercent: true,
          isActive: true,
          sortOrder: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      catalog = rows.map((row) => ({ ...row, ...SLOT_DEFAULTS }));
    }
    const offered = await prisma.providerOfferedService.findMany({
      where: { providerId },
      select: { catalogServiceId: true },
    });

    const offeredSet = new Set(offered.map((o) => o.catalogServiceId));
    return catalog.map((s) => ({
      ...s,
      isOffered: offeredSet.has(s.id),
    }));
  },

  async setOffer(providerId: string, catalogServiceId: string, offer: boolean) {
    const service = await prisma.catalogService.findUnique({
      where: { id: catalogServiceId },
      select: { id: true, isActive: true, categoryId: true },
    });
    if (!service || !service.isActive) throw new Error("Service not available");

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { categories: true, category: true },
    });
    if (!provider) throw new Error("Provider not found");

    const categoryIds = new Set([...(provider.categories || []), provider.category]);
    if (!categoryIds.has(service.categoryId)) {
      throw new Error("This service is outside your registered categories");
    }

    if (offer) {
      return prisma.providerOfferedService.upsert({
        where: {
          providerId_catalogServiceId: { providerId, catalogServiceId },
        },
        create: { providerId, catalogServiceId },
        update: {},
      });
    }

    await prisma.providerOfferedService.deleteMany({
      where: { providerId, catalogServiceId },
    });
    return { removed: true };
  },

  /** Providers offering a catalog service, ranked by rating then reviews */
  async rankedProvidersForService(catalogServiceId: string) {
    const offers = await prisma.providerOfferedService.findMany({
      where: {
        catalogServiceId,
        provider: { isActive: true, documentVerified: true },
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return offers
      .map((o) => o.provider)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        if (b.totalReviews !== a.totalReviews) return b.totalReviews - a.totalReviews;
        return b.completedBookings - a.completedBookings;
      });
  },
};
