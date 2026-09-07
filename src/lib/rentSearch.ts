import {
  RADIUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  BED_OPTIONS,
  MAX_BED_OPTIONS,
  ADDED_OPTIONS,
  looksLikePostcode,
} from "@/lib/buySearch";
import { normalizeSearchLocation } from "@/lib/ukPostcode";

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

/** Monthly rent bands (pcm) — long-term rentals (Rightmove-style) */
export const RENT_PRICE_OPTIONS = [
  { value: "", label: "No min" },
  { value: "100", label: "£100 pcm" },
  { value: "150", label: "£150 pcm" },
  { value: "200", label: "£200 pcm" },
  { value: "250", label: "£250 pcm" },
  { value: "300", label: "£300 pcm" },
  { value: "350", label: "£350 pcm" },
  { value: "400", label: "£400 pcm" },
  { value: "450", label: "£450 pcm" },
  { value: "500", label: "£500 pcm" },
  { value: "600", label: "£600 pcm" },
  { value: "700", label: "£700 pcm" },
  { value: "800", label: "£800 pcm" },
  { value: "900", label: "£900 pcm" },
  { value: "1000", label: "£1,000 pcm" },
  { value: "1100", label: "£1,100 pcm" },
  { value: "1200", label: "£1,200 pcm" },
  { value: "1250", label: "£1,250 pcm" },
  { value: "1300", label: "£1,300 pcm" },
  { value: "1400", label: "£1,400 pcm" },
  { value: "1500", label: "£1,500 pcm" },
  { value: "1750", label: "£1,750 pcm" },
  { value: "2000", label: "£2,000 pcm" },
  { value: "2250", label: "£2,250 pcm" },
  { value: "2500", label: "£2,500 pcm" },
  { value: "2750", label: "£2,750 pcm" },
  { value: "3000", label: "£3,000 pcm" },
  { value: "3500", label: "£3,500 pcm" },
  { value: "4000", label: "£4,000 pcm" },
  { value: "4500", label: "£4,500 pcm" },
  { value: "5000", label: "£5,000 pcm" },
  { value: "5500", label: "£5,500 pcm" },
  { value: "6000", label: "£6,000 pcm" },
  { value: "6500", label: "£6,500 pcm" },
  { value: "7000", label: "£7,000 pcm" },
  { value: "8000", label: "£8,000 pcm" },
  { value: "9000", label: "£9,000 pcm" },
  { value: "10000", label: "£10,000 pcm" },
  { value: "12500", label: "£12,500 pcm" },
  { value: "15000", label: "£15,000 pcm" },
  { value: "17500", label: "£17,500 pcm" },
  { value: "20000", label: "£20,000 pcm" },
  { value: "25000", label: "£25,000 pcm" },
  { value: "30000", label: "£30,000 pcm" },
  { value: "35000", label: "£35,000 pcm" },
  { value: "40000", label: "£40,000 pcm" },
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
  const raw =
    params.get("location") ||
    params.get("searchLocation") ||
    params.get("city") ||
    params.get("zipCode") ||
    "";

  return {
    location: normalizeSearchLocation(raw),
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
  const location = normalizeSearchLocation(filters.location);
  if (location) {
    params.set("location", location);
    if (looksLikePostcode(location)) {
      params.set("zipCode", location);
    } else {
      params.set("city", location);
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
