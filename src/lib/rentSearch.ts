import {
  RADIUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  BED_OPTIONS,
  MAX_BED_OPTIONS,
  ADDED_OPTIONS,
  looksLikePostcode,
} from "@/lib/buySearch";

export type RentKind = "whole-property" | "room-to-rent" | "short-rent";

export interface RentSearchFilters {
  location: string;
  radius: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  minBeds: string;
  maxBeds: string;
  addedToSite: string;
  includeLetAgreed: boolean;
}

export const DEFAULT_RENT_SEARCH_FILTERS: RentSearchFilters = {
  location: "",
  radius: "0",
  minPrice: "",
  maxPrice: "",
  propertyType: "",
  minBeds: "",
  maxBeds: "",
  addedToSite: "",
  includeLetAgreed: false,
};

/** Monthly rent bands (pcm) — long-term rentals */
export const RENT_PRICE_OPTIONS = [
  { value: "", label: "No min" },
  { value: "100", label: "£100 pcm" },
  { value: "200", label: "£200 pcm" },
  { value: "300", label: "£300 pcm" },
  { value: "400", label: "£400 pcm" },
  { value: "500", label: "£500 pcm" },
  { value: "600", label: "£600 pcm" },
  { value: "700", label: "£700 pcm" },
  { value: "800", label: "£800 pcm" },
  { value: "900", label: "£900 pcm" },
  { value: "1000", label: "£1,000 pcm" },
  { value: "1250", label: "£1,250 pcm" },
  { value: "1500", label: "£1,500 pcm" },
  { value: "1750", label: "£1,750 pcm" },
  { value: "2000", label: "£2,000 pcm" },
  { value: "2500", label: "£2,500 pcm" },
  { value: "3000", label: "£3,000 pcm" },
  { value: "3500", label: "£3,500 pcm" },
  { value: "4000", label: "£4,000 pcm" },
  { value: "4500", label: "£4,500 pcm" },
  { value: "5000", label: "£5,000 pcm" },
];

export const RENT_MAX_PRICE_OPTIONS = [
  { value: "", label: "No max" },
  ...RENT_PRICE_OPTIONS.filter((o) => o.value).map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

/** Nightly price bands — short stays */
export const SHORT_STAY_PRICE_OPTIONS = [
  { value: "", label: "No min" },
  { value: "30", label: "£30 / night" },
  { value: "50", label: "£50 / night" },
  { value: "75", label: "£75 / night" },
  { value: "100", label: "£100 / night" },
  { value: "125", label: "£125 / night" },
  { value: "150", label: "£150 / night" },
  { value: "200", label: "£200 / night" },
  { value: "250", label: "£250 / night" },
  { value: "300", label: "£300 / night" },
  { value: "400", label: "£400 / night" },
  { value: "500", label: "£500 / night" },
  { value: "750", label: "£750 / night" },
  { value: "1000", label: "£1,000 / night" },
  { value: "1500", label: "£1,500 / night" },
  { value: "2000", label: "£2,000 / night" },
];

export const SHORT_STAY_MAX_PRICE_OPTIONS = [
  { value: "", label: "No max" },
  ...SHORT_STAY_PRICE_OPTIONS.filter((o) => o.value).map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

export {
  RADIUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  BED_OPTIONS,
  MAX_BED_OPTIONS,
  ADDED_OPTIONS,
  looksLikePostcode,
};

export function rentBasePath(kind: RentKind) {
  if (kind === "room-to-rent") return "/rent/room-to-rent";
  if (kind === "short-rent") return "/rent/short-rent";
  return "/rent/whole-property";
}

export function rentLabel(kind: RentKind) {
  if (kind === "room-to-rent") return "Room to Rent";
  if (kind === "short-rent") return "Short Stay";
  return "Whole Property";
}

export function rentResultsTitle(kind: RentKind, location: string) {
  if (kind === "room-to-rent") {
    return location ? `Rooms to Rent in ${location}` : "Rooms to Rent";
  }
  if (kind === "short-rent") {
    return location ? `Short Stays in ${location}` : "Short Stays";
  }
  return location
    ? `Properties to Rent in ${location}`
    : "Properties to Rent";
}

export function filtersFromSearchParams(
  params: URLSearchParams
): RentSearchFilters {
  const location =
    params.get("location") ||
    params.get("searchLocation") ||
    params.get("city") ||
    params.get("zipCode") ||
    "";

  return {
    location,
    radius: params.get("radius") || "0",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    propertyType: params.get("propertyType") || "",
    minBeds: params.get("minBeds") || "",
    maxBeds: params.get("maxBeds") || "",
    addedToSite: params.get("addedToSite") || "",
    includeLetAgreed: params.get("includeLetAgreed") === "true",
  };
}

export function filtersToSearchParams(
  filters: RentSearchFilters
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.location.trim()) {
    params.set("location", filters.location.trim());
    if (looksLikePostcode(filters.location)) {
      params.set("zipCode", filters.location.trim());
    } else {
      params.set("city", filters.location.trim());
    }
  }
  if (filters.radius && filters.radius !== "0") params.set("radius", filters.radius);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.minBeds) params.set("minBeds", filters.minBeds);
  if (filters.maxBeds) params.set("maxBeds", filters.maxBeds);
  if (filters.addedToSite) params.set("addedToSite", filters.addedToSite);
  if (filters.includeLetAgreed) params.set("includeLetAgreed", "true");
  return params;
}
