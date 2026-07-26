import { filtersToSearchParams as buyFiltersToParams } from "@/lib/buySearch";
import {
  filtersToSearchParams as rentFiltersToParams,
  type RentKind,
} from "@/lib/rentSearch";

type Filters = Record<string, string | number | boolean | null | undefined>;

function str(v: unknown) {
  return v == null ? "" : String(v);
}

/** Build a public results URL from a saved search record. */
export function savedSearchResultsHref(search: {
  listingType: string;
  rentalType?: string | null;
  location: string;
  filters?: unknown;
}) {
  const filters = (search.filters || {}) as Filters;
  const location = str(filters.location || search.location).trim();

  if (search.listingType === "BUY") {
    const params = buyFiltersToParams({
      location,
      radius: str(filters.radius || "0"),
      minPrice: str(filters.minPrice),
      maxPrice: str(filters.maxPrice),
      propertyType: str(filters.propertyType),
      minBeds: str(filters.minBeds),
      maxBeds: str(filters.maxBeds),
      addedToSite: str(filters.addedToSite),
    });
    return `/buy/results?${params.toString()}`;
  }

  const kind: RentKind =
    (filters.kind as RentKind) ||
    (search.rentalType === "SHORT_TERM"
      ? "short-rent"
      : filters.occupancyType === "ROOM" || str(filters.kind) === "room-to-rent"
        ? "room-to-rent"
        : "whole-property");

  const params = rentFiltersToParams({
    location,
    radius: str(filters.radius || "0"),
    minPrice: str(filters.minPrice),
    maxPrice: str(filters.maxPrice),
    propertyType: str(filters.propertyType),
    minBeds: str(filters.minBeds),
    maxBeds: str(filters.maxBeds),
    addedToSite: str(filters.addedToSite),
    includeLetAgreed: !!filters.includeLetAgreed,
  });

  return `/rent/${kind}/results?${params.toString()}`;
}
