export interface LongRentFiltersState {
  priceRange: [number, number];
  selectedTypes: string[];
  selectedBeds: number | null;
  selectedBaths: number | null;
  minRating: number;
  minTermMonths: number;
  maxTermMonths: number;
  propertyPreferences: string[];
  searchLocation: string;
}
