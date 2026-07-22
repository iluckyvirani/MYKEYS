export interface BuySearchFilters {
  location: string;
  radius: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  minBeds: string;
  maxBeds: string;
  addedToSite: string;
  includeUnderOffer: boolean;
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
  includeUnderOffer: false,
};

export const PRICE_OPTIONS = [
  { value: "", label: "No min" },
  { value: "50000", label: "£50,000" },
  { value: "75000", label: "£75,000" },
  { value: "100000", label: "£100,000" },
  { value: "125000", label: "£125,000" },
  { value: "150000", label: "£150,000" },
  { value: "200000", label: "£200,000" },
  { value: "250000", label: "£250,000" },
  { value: "300000", label: "£300,000" },
  { value: "350000", label: "£350,000" },
  { value: "400000", label: "£400,000" },
  { value: "450000", label: "£450,000" },
  { value: "500000", label: "£500,000" },
  { value: "600000", label: "£600,000" },
  { value: "750000", label: "£750,000" },
  { value: "1000000", label: "£1,000,000" },
  { value: "1500000", label: "£1,500,000" },
  { value: "2000000", label: "£2,000,000" },
  { value: "3000000", label: "£3,000,000" },
  { value: "5000000", label: "£5,000,000" },
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
  { value: "FLAT,APARTMENT", label: "Flats / Apartments" },
  { value: "BUNGALOW", label: "Bungalows" },
  { value: "STUDIO", label: "Studio" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "VILLA", label: "Villa" },
  { value: "PENTHOUSE", label: "Penthouse" },
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
];

export const MAX_BED_OPTIONS = [
  { value: "", label: "No max" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
  { value: "7", label: "7+" },
];

export const ADDED_OPTIONS = [
  { value: "", label: "Anytime" },
  { value: "1", label: "Last 24 hours" },
  { value: "3", label: "Last 3 days" },
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
];

export function looksLikePostcode(value: string) {
  return /\d/.test(value);
}

export function filtersFromSearchParams(
  params: URLSearchParams
): BuySearchFilters {
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
    includeUnderOffer: params.get("includeUnderOffer") === "true",
  };
}

export function filtersToSearchParams(filters: BuySearchFilters): URLSearchParams {
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
  if (filters.includeUnderOffer) params.set("includeUnderOffer", "true");
  return params;
}

/** Map Rightmove-style filters into PropertyGrid BuyFiltersState shape */
export function toPropertyGridFilters(filters: BuySearchFilters) {
  const min = filters.minPrice ? parseInt(filters.minPrice, 10) : 0;
  const max = filters.maxPrice ? parseInt(filters.maxPrice, 10) : 2000000;
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
