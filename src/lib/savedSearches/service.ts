import { prisma } from "@/lib/prisma";
import { buildSavedSearchName } from "@/lib/savedSearches/shared";
import type {
  AlertFrequency,
  ListingType,
  Prisma,
  RentalType,
} from "@prisma/client";

export type SavedSearchFilters = Record<
  string,
  string | number | boolean | null | undefined
>;

export {
  ALERT_FREQUENCY_OPTIONS,
  buildSavedSearchName,
} from "@/lib/savedSearches/shared";
export type { AlertFrequencyValue } from "@/lib/savedSearches/shared";

export async function createSavedSearch(opts: {
  userId: string;
  name?: string;
  listingType: ListingType;
  rentalType?: RentalType | null;
  location: string;
  filters: SavedSearchFilters;
  alertEnabled?: boolean;
  alertFrequency?: AlertFrequency | null;
}) {
  const location = opts.location.trim();
  if (!location) throw new Error("Location is required");

  const name =
    opts.name?.trim() ||
    buildSavedSearchName({
      listingType: opts.listingType,
      rentalType: opts.rentalType,
      location,
    });

  const alertEnabled = !!opts.alertEnabled;
  const alertFrequency = alertEnabled
    ? opts.alertFrequency || "INSTANTLY"
    : null;

  if (!prisma?.savedSearch) {
    throw new Error(
      "SavedSearch model is not available on Prisma client. Restart the Next.js server after prisma generate."
    );
  }

  return prisma.savedSearch.create({
    data: {
      userId: opts.userId,
      name,
      listingType: opts.listingType,
      rentalType: opts.rentalType || null,
      location,
      filters: opts.filters as Prisma.InputJsonValue,
      alertEnabled,
      alertFrequency,
    },
  });
}

export async function listSavedSearches(userId: string) {
  return prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteSavedSearch(userId: string, id: string) {
  const existing = await prisma.savedSearch.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Saved search not found");
  await prisma.savedSearch.delete({ where: { id } });
  return existing;
}

export async function updateSavedSearch(
  userId: string,
  id: string,
  data: {
    alertEnabled?: boolean;
    alertFrequency?: AlertFrequency | null;
    name?: string;
  }
) {
  const existing = await prisma.savedSearch.findFirst({
    where: { id, userId },
  });
  if (!existing) throw new Error("Saved search not found");

  const alertEnabled =
    data.alertEnabled !== undefined ? !!data.alertEnabled : existing.alertEnabled;

  let alertFrequency: AlertFrequency | null = existing.alertFrequency;
  if (!alertEnabled) {
    alertFrequency = null;
  } else if (data.alertFrequency !== undefined) {
    alertFrequency = data.alertFrequency || "INSTANTLY";
  } else if (!alertFrequency) {
    alertFrequency = "INSTANTLY";
  }

  return prisma.savedSearch.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() || existing.name }),
      alertEnabled,
      alertFrequency,
    },
  });
}
