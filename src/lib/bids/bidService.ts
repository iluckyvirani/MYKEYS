/**
 * Phase 3 — Bid / Boost Service
 * Handles all business logic for PropertyBid records.
 */

import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlaceBidInput {
  propertyId: string;
  ownerId: string;
  zipCode: string;
  amount: number;     // £/day
  startDate: Date;
  endDate: Date;
}

export interface BidDTO {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyZipCode: string | null;
  ownerId: string;
  zipCode: string;
  amount: number;
  totalCost: number;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
  paymentId: string | null;
  razorpayOrderId: string | null;
  createdAt: string;
}

export interface AdminSettings {
  minBidAmountPerDay: number;
  maxBidDurationDays: number;
  maxBoostedSlotsPerZip: number;
  shortRentCommissionPercent: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(start: Date, end: Date): number {
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function daysRemaining(end: Date): number {
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function mapBid(bid: any): BidDTO {
  return {
    id: bid.id,
    propertyId: bid.propertyId,
    propertyTitle: bid.property?.title ?? "",
    propertyZipCode: bid.property?.zipCode ?? null,
    ownerId: bid.ownerId,
    zipCode: bid.zipCode,
    amount: bid.amount,
    totalCost: bid.totalCost,
    startDate: bid.startDate.toISOString(),
    endDate: bid.endDate.toISOString(),
    status: bid.status,
    daysRemaining: daysRemaining(bid.endDate),
    paymentId: bid.paymentId,
    razorpayOrderId: bid.razorpayOrderId,
    createdAt: bid.createdAt.toISOString(),
  };
}

const BID_INCLUDE = {
  property: { select: { title: true, zipCode: true } },
} as const;

// ─── Admin Settings helpers ───────────────────────────────────────────────────

export async function getAdminSettings(): Promise<AdminSettings> {
  const settings = await prisma.adminSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      shortRentCommissionPercent: 0,
      minBidAmountPerDay: 1,
      maxBidDurationDays: 30,
      maxBoostedSlotsPerZip: 3,
    },
    update: {},
  });
  return {
    minBidAmountPerDay: settings.minBidAmountPerDay,
    maxBidDurationDays: settings.maxBidDurationDays,
    maxBoostedSlotsPerZip: settings.maxBoostedSlotsPerZip,
    shortRentCommissionPercent: settings.shortRentCommissionPercent,
  };
}

export async function updateAdminBidSettings(data: {
  minBidAmountPerDay?: number;
  maxBidDurationDays?: number;
  maxBoostedSlotsPerZip?: number;
}) {
  return prisma.adminSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      shortRentCommissionPercent: 0,
      ...data,
    },
    update: data,
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────

export async function validateBidInput(
  input: PlaceBidInput,
  settings: AdminSettings
): Promise<string | null> {
  const { propertyId, ownerId, amount, startDate, endDate } = input;

  if (amount < settings.minBidAmountPerDay) {
    return `Minimum bid amount is £${settings.minBidAmountPerDay}/day`;
  }

  const days = daysBetween(startDate, endDate);
  if (days > settings.maxBidDurationDays) {
    return `Maximum bid duration is ${settings.maxBidDurationDays} days`;
  }
  if (days < 1) {
    return "End date must be after start date";
  }
  const startDay = new Date(startDate);
  startDay.setUTCHours(0, 0, 0, 0);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  if (startDay < todayStart) {
    return "Start date cannot be in the past";
  }

  // Property must be ACTIVE SHORT_TERM owned by this owner
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true, status: true },
  });
  if (!property || property.ownerId !== ownerId) {
    return "Property not found";
  }
  if (property.status !== "ACTIVE") {
    return "Property must be active to place a bid";
  }

  // No overlapping active bid for same property + zip code
  const overlap = await prisma.propertyBid.findFirst({
    where: {
      propertyId,
      zipCode: input.zipCode,
      status: "ACTIVE",
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
  });
  if (overlap) {
    return "You already have an active bid for this property and zip code in that period";
  }

  return null;
}

// ─── Bid CRUD ─────────────────────────────────────────────────────────────────

export async function createBid(input: PlaceBidInput): Promise<BidDTO> {
  const days = daysBetween(input.startDate, input.endDate);
  const totalCost = parseFloat((input.amount * days).toFixed(2));

  const bid = await prisma.propertyBid.create({
    data: {
      propertyId: input.propertyId,
      ownerId: input.ownerId,
      zipCode: input.zipCode,
      amount: input.amount,
      totalCost,
      startDate: input.startDate,
      endDate: input.endDate,
      status: "ACTIVE",
    },
    include: BID_INCLUDE,
  });

  return mapBid(bid);
}

export async function updateBidPayment(
  bidId: string,
  data: { paymentId?: string; razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string }
): Promise<BidDTO> {
  const bid = await prisma.propertyBid.update({
    where: { id: bidId },
    data,
    include: BID_INCLUDE,
  });
  return mapBid(bid);
}

export async function getOwnerBids(ownerId: string): Promise<BidDTO[]> {
  const bids = await prisma.propertyBid.findMany({
    where: { ownerId },
    include: BID_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return bids.map(mapBid);
}

export async function getBidById(bidId: string): Promise<BidDTO | null> {
  const bid = await prisma.propertyBid.findUnique({
    where: { id: bidId },
    include: BID_INCLUDE,
  });
  return bid ? mapBid(bid) : null;
}

export async function getAllBids(filters: {
  status?: string;
  zipCode?: string;
  ownerId?: string;
  page?: number;
  limit?: number;
}): Promise<{ bids: BidDTO[]; total: number; page: number; limit: number }> {
  const { status, zipCode, ownerId, page = 1, limit = 20 } = filters;
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (zipCode) where.zipCode = zipCode;
  if (ownerId) where.ownerId = ownerId;

  const [bids, total] = await Promise.all([
    prisma.propertyBid.findMany({
      where,
      include: {
        ...BID_INCLUDE,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.propertyBid.count({ where }),
  ]);

  return { bids: bids.map(mapBid), total, page, limit };
}

export async function cancelBid(
  bidId: string,
  ownerId: string | null // null = admin cancel
): Promise<BidDTO> {
  const bid = await prisma.propertyBid.findUnique({ where: { id: bidId } });
  if (!bid) throw new Error("Bid not found");

  if (ownerId !== null) {
    if (bid.ownerId !== ownerId) throw new Error("Not your bid");
    // 1-hour grace window for owner self-cancel
    const gracePeriod = 60 * 60 * 1000;
    if (Date.now() - bid.createdAt.getTime() > gracePeriod) {
      throw new Error("Bids can only be cancelled within 1 hour of placement");
    }
  }

  if (bid.status !== "ACTIVE") throw new Error("Only active bids can be cancelled");

  const updated = await prisma.propertyBid.update({
    where: { id: bidId },
    data: { status: "CANCELLED" },
    include: BID_INCLUDE,
  });
  return mapBid(updated);
}

// ─── Expiry processing (called by cron) ──────────────────────────────────────

export interface BidExpiryResult {
  expiredCount: number;
  expiringSoon: Array<{
    bid: BidDTO;
    ownerEmail: string;
    ownerName: string;
  }>;
}

export async function processBidExpiry(): Promise<BidExpiryResult> {
  const now = new Date();

  // 1. Mark past-endDate bids as EXPIRED
  const { count: expiredCount } = await prisma.propertyBid.updateMany({
    where: { status: "ACTIVE", endDate: { lt: now } },
    data: { status: "EXPIRED" },
  });

  // 2. Find bids expiring within 2 days (for notifications)
  const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const expiringSoonRaw = await prisma.propertyBid.findMany({
    where: {
      status: "ACTIVE",
      endDate: { gte: now, lte: soon },
    },
    include: {
      ...BID_INCLUDE,
      owner: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  const expiringSoon = expiringSoonRaw.map((b) => ({
    bid: mapBid(b),
    ownerEmail: (b as any).owner?.email ?? "",
    ownerName: `${(b as any).owner?.firstName ?? ""} ${(b as any).owner?.lastName ?? ""}`.trim(),
  }));

  return { expiredCount, expiringSoon };
}

// ─── Boosted listings for search ─────────────────────────────────────────────

export async function getBoostedPropertyIds(
  zipCode: string,
  maxSlots: number
): Promise<string[]> {
  const now = new Date();
  const bids = await prisma.propertyBid.findMany({
    where: {
      zipCode,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { amount: "desc" },
    take: maxSlots,
    select: { propertyId: true },
  });
  return bids.map((b) => b.propertyId);
}

// ─── Current highest bid for a zip code (shown in bid form) ──────────────────

export async function getHighestBidForZip(
  zipCode: string
): Promise<{ amount: number; propertyTitle: string } | null> {
  const now = new Date();
  const bid = await prisma.propertyBid.findFirst({
    where: {
      zipCode,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { amount: "desc" },
    select: {
      amount: true,
      property: { select: { title: true } },
    },
  });
  if (!bid) return null;
  return { amount: bid.amount, propertyTitle: bid.property?.title ?? "" };
}
