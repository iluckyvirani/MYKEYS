import {
  isLikelyUkPostcode,
  normalizeSearchLocation,
  ukOutwardCode,
} from "@/lib/ukPostcode";

export interface BuySearchFilters {
  location: string;
  radius: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  minBeds: string;
  maxBeds: string;
  addedToSite: string;
}

export const DEFAULT_BUY_SEARCH_FILTERS: BuySearchFilters = {
  location: "",
  radius: "0",
  minPrice: "",
  maxPrice: "",
  propertyType: "",
  minBeds: "",
  maxBeds: "",
  addedToSite: "",
};

export const PRICE_OPTIONS = [
  { value: "", label: "No min" },
  { value: "50000", label: "£50,000" },
  { value: "60000", label: "£60,000" },
  { value: "70000", label: "£70,000" },
  { value: "80000", label: "£80,000" },
  { value: "90000", label: "£90,000" },
  { value: "100000", label: "£100,000" },
  { value: "110000", label: "£110,000" },
  { value: "120000", label: "£120,000" },
  { value: "125000", label: "£125,000" },
  { value: "130000", label: "£130,000" },
  { value: "140000", label: "£140,000" },
  { value: "150000", label: "£150,000" },
  { value: "160000", label: "£160,000" },
  { value: "170000", label: "£170,000" },
  { value: "175000", label: "£175,000" },
  { value: "180000", label: "£180,000" },
  { value: "190000", label: "£190,000" },
  { value: "200000", label: "£200,000" },
  { value: "210000", label: "£210,000" },
  { value: "220000", label: "£220,000" },
  { value: "230000", label: "£230,000" },
  { value: "240000", label: "£240,000" },
  { value: "250000", label: "£250,000" },
  { value: "260000", label: "£260,000" },
  { value: "270000", label: "£270,000" },
  { value: "280000", label: "£280,000" },
  { value: "290000", label: "£290,000" },
  { value: "300000", label: "£300,000" },
  { value: "325000", label: "£325,000" },
  { value: "350000", label: "£350,000" },
  { value: "375000", label: "£375,000" },
  { value: "400000", label: "£400,000" },
  { value: "425000", label: "£425,000" },
  { value: "450000", label: "£450,000" },
  { value: "475000", label: "£475,000" },
  { value: "500000", label: "£500,000" },
  { value: "550000", label: "£550,000" },
  { value: "600000", label: "£600,000" },
  { value: "650000", label: "£650,000" },
  { value: "700000", label: "£700,000" },
  { value: "800000", label: "£800,000" },
  { value: "900000", label: "£900,000" },
  { value: "1000000", label: "£1,000,000" },
  { value: "1250000", label: "£1,250,000" },
  { value: "1500000", label: "£1,500,000" },
  { value: "1750000", label: "£1,750,000" },
  { value: "2000000", label: "£2,000,000" },
  { value: "2500000", label: "£2,500,000" },
  { value: "3000000", label: "£3,000,000" },
  { value: "4000000", label: "£4,000,000" },
  { value: "5000000", label: "£5,000,000" },
  { value: "7500000", label: "£7,500,000" },
  { value: "10000000", label: "£10,000,000" },
  { value: "15000000", label: "£15,000,000" },
  { value: "20000000", label: "£20,000,000" },
];

export const MAX_PRICE_OPTIONS = [
  { value: "", label: "No max" },
  ...PRICE_OPTIONS.filter((o) => o.value).map((o) => ({
    value: o.value,
    label: o.label,
  })),
];

export const RADIUS_OPTIONS = [
  { value: "0", label: "This area only" },
  { value: "0.25", label: "Within ¼ mile" },
  { value: "0.5", label: "Within ½ mile" },
  { value: "1", label: "Within 1 mile" },
  { value: "3", label: "Within 3 miles" },
  { value: "5", label: "Within 5 miles" },
  { value: "10", label: "Within 10 miles" },
  { value: "15", label: "Within 15 miles" },
  { value: "20", label: "Within 20 miles" },
  { value: "30", label: "Within 30 miles" },
  { value: "40", label: "Within 40 miles" },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "HOUSE", label: "Houses" },
  { value: "APARTMENT", label: "Flats / Apartments" },
  { value: "BUNGALOW", label: "Bungalows" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial Property" },
  { value: "OTHER", label: "Other" },
];

export const BED_OPTIONS = [
  { value: "", label: "No min" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
];

export const MAX_BED_OPTIONS = [
  { value: "", label: "No max" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7" },
  { value: "8", label: "8" },
  { value: "9", label: "9" },
  { value: "10", label: "10" },
];

export const ADDED_OPTIONS = [
  { value: "", label: "Anytime" },
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
];

export function looksLikePostcode(value: string) {
  return isLikelyUkPostcode(value);
}

/** UK outward code e.g. E14 9RZ → E14, SW1A 1AA → SW1A */
export function ukOutwardPostcode(value: string): string {
  return ukOutwardCode(value);
}

export function filtersFromSearchParams(
  params: URLSearchParams
): BuySearchFilters {
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
  };
}

export function filtersToSearchParams(filters: BuySearchFilters): URLSearchParams {
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
  return params;
}

/** Map Rightmove-style filters into PropertyGrid BuyFiltersState shape */
export function toPropertyGridFilters(filters: BuySearchFilters) {
  const min = filters.minPrice ? parseInt(filters.minPrice, 10) : 0;
  const max = filters.maxPrice ? parseInt(filters.maxPrice, 10) : 20000000;
  const beds = filters.minBeds !== "" ? parseInt(filters.minBeds, 10) : null;

  return {
    priceRange: [min, max] as [number, number],
    selectedTypes: filters.propertyType
      ? filters.propertyType.split(",").filter(Boolean)
      : [],
    selectedBeds: beds,
    selectedBaths: null as number | null,
    minRating: 0,
    availableFrom: "",
    propertyPreferences: [] as string[],
    searchLocation: filters.location,
  };
}
