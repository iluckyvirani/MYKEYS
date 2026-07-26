import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/emailService";
import { savedSearchResultsHref } from "@/lib/savedSearches/resultsUrl";
import type { AlertFrequency, Prisma } from "@prisma/client";

const FREQUENCY_MS: Record<AlertFrequency, number> = {
  INSTANTLY: 60 * 60 * 1000, // hourly cron cadence
  DAILY: 24 * 60 * 60 * 1000,
  EVERY_3_DAYS: 3 * 24 * 60 * 60 * 1000,
  EVERY_7_DAYS: 7 * 24 * 60 * 60 * 1000,
};

type Filters = Record<string, string | number | boolean | null | undefined>;

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown) {
  return v == null ? "" : String(v).trim();
}

function isDue(
  frequency: AlertFrequency,
  lastNotifiedAt: Date | null,
  createdAt: Date,
  now: Date
) {
  const interval = FREQUENCY_MS[frequency] || FREQUENCY_MS.DAILY;
  const anchor = lastNotifiedAt || createdAt;
  return now.getTime() - anchor.getTime() >= interval;
}

/** Build a Prisma where clause from a saved search filter snapshot. */
export function buildMatchWhere(search: {
  listingType: string;
  rentalType?: string | null;
  location: string;
  filters: unknown;
  since: Date;
}): Prisma.PropertyWhereInput {
  const filters = (search.filters || {}) as Filters;
  const location = str(filters.location || search.location);
  const where: Prisma.PropertyWhereInput = {
    status: "ACTIVE",
    listingType: search.listingType as "BUY" | "RENT",
    createdAt: { gt: search.since },
  };

  if (search.listingType === "RENT") {
    const kind = str(filters.kind);
    if (search.rentalType === "SHORT_TERM" || kind === "short-rent") {
      where.rentalType = "SHORT_TERM";
    } else {
      where.rentalType = "LONG_TERM";
      if (kind === "room-to-rent" || filters.occupancyType === "ROOM") {
        where.occupancyType = "ROOM";
      } else if (
        kind === "whole-property" ||
        filters.occupancyType === "WHOLE_PROPERTY"
      ) {
        where.NOT = { occupancyType: "ROOM" };
      }
    }
  }

  if (location) {
    where.OR = [
      { city: { contains: location, mode: "insensitive" } },
      { zipCode: { contains: location, mode: "insensitive" } },
      { address: { contains: location, mode: "insensitive" } },
      { title: { contains: location, mode: "insensitive" } },
    ];
  }

  const minPrice = num(filters.minPrice);
  const maxPrice = num(filters.maxPrice);
  const priceField = search.listingType === "BUY" ? "propertyPrice" : "price";

  if (minPrice != null || maxPrice != null) {
    const priceFilter: Prisma.FloatNullableFilter | Prisma.FloatFilter = {};
    if (minPrice != null) priceFilter.gte = minPrice;
    if (maxPrice != null) priceFilter.lte = maxPrice;
    (where as any)[priceField] = priceFilter;
  }

  const propertyType = str(filters.propertyType);
  if (propertyType) {
    const types = propertyType
      .split(",")
      .map((t) => (t.trim() === "FLAT" ? "APARTMENT" : t.trim()))
      .filter(Boolean);
    if (types.length === 1) where.propertyType = types[0] as any;
    else if (types.length > 1) where.propertyType = { in: types as any };
  }

  const minBeds = num(filters.minBeds);
  const maxBeds = num(filters.maxBeds);
  if (minBeds != null || maxBeds != null) {
    const beds: Prisma.IntFilter = {};
    if (minBeds != null) beds.gte = minBeds;
    if (maxBeds != null) beds.lte = maxBeds;
    where.bedrooms = beds;
  }

  return where;
}

export async function processSavedSearchAlerts() {
  const now = new Date();
  const searches = await prisma.savedSearch.findMany({
    where: {
      alertEnabled: true,
      alertFrequency: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      },
    },
  });

  let processed = 0;
  let emailed = 0;
  let matchesFound = 0;

  for (const search of searches) {
    if (!search.alertFrequency) continue;
    if (!isDue(search.alertFrequency, search.lastNotifiedAt, search.createdAt, now)) {
      continue;
    }

    processed += 1;
    const since = search.lastNotifiedAt || search.createdAt;

    let matches: {
      id: string;
      title: string;
      address: string | null;
      city: string | null;
      price: number | null;
      propertyPrice: number | null;
    }[] = [];

    try {
      matches = await prisma.property.findMany({
        where: buildMatchWhere({
          listingType: search.listingType,
          rentalType: search.rentalType,
          location: search.location,
          filters: search.filters,
          since,
        }),
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          price: true,
          propertyPrice: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    } catch (err) {
      console.error(
        `[saved-search-alerts] match query failed for ${search.id}:`,
        err
      );
      continue;
    }

    matchesFound += matches.length;

    if (matches.length > 0 && search.user?.email) {
      const resultsUrl = `${process.env.FRONTEND_URL || ""}${savedSearchResultsHref(search)}`;
      await emailService.sendSavedSearchAlertEmail(
        search.user.email,
        search.user.firstName || "there",
        search.name,
        matches.map((m) => ({
          id: m.id,
          title: m.title || m.address || "Property",
          location: [m.address, m.city].filter(Boolean).join(", "),
          priceLabel:
            search.listingType === "BUY"
              ? m.propertyPrice != null
                ? `£${m.propertyPrice.toLocaleString()}`
                : ""
              : m.price != null
                ? `£${m.price.toLocaleString()}`
                : "",
        })),
        resultsUrl
      );
      emailed += 1;

      await prisma.notification
        .create({
          data: {
            userId: search.userId,
            type: "SAVED_SEARCH_ALERT",
            title: "New matching properties",
            message: `${matches.length} new listing${
              matches.length === 1 ? "" : "s"
            } match "${search.name}".`,
            data: {
              savedSearchId: search.id,
              propertyIds: matches.map((m) => m.id),
            },
            actionUrl: "/user/dashboard/saved-searches",
          },
        })
        .catch(() => undefined);
    }

    await prisma.savedSearch.update({
      where: { id: search.id },
      data: { lastNotifiedAt: now },
    });
  }

  return { processed, emailed, matchesFound, totalAlerts: searches.length };
}
