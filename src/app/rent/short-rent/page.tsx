"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShortRentHero from "@/components/Rent/ShortRentHero";
import PropertyGrid from "@/components/property/PropertyGrid";
import HowShortRentWorks from "@/components/Rent/HowShortRentWorks";
import ShortRentFilters from "@/components/search/ShortRentFilters";

export interface ShortRentFiltersState {
  priceRange: [number, number];
  selectedTypes: string[];
  selectedBeds: number | null;
  selectedBaths: number | null;
  minRating: number;
  guestCapacity: number | null;
  minStayNights: number;
  maxStayNights: number;
  propertyPreferences: string[];
  searchLocation: string;
}

export default function ShortRentPage() {
  const [filters, setFilters] = useState<ShortRentFiltersState>({
    priceRange: [0, 2000],
    selectedTypes: [],
    selectedBeds: null,
    selectedBaths: null,
    minRating: 0,
    guestCapacity: null,
    minStayNights: 1,
    maxStayNights: 30,
    propertyPreferences: [],
    searchLocation: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const handleFilterChange = (newFilters: Partial<ShortRentFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (query: string, location: string) => {
    setSearchQuery(query);
    handleFilterChange({ searchLocation: location });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <ShortRentHero onSearchChange={handleSearchChange} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <ShortRentFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="lg:w-3/4">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Short Rent Properties
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">{totalCount}</span> properties available
                  {filters.searchLocation && ` in ${filters.searchLocation}`}
                </p>
              </div>

              <PropertyGrid 
                filters={filters}
                searchQuery={searchQuery}
                listingType="RENT"
                rentalType="SHORT_TERM"
                onCountChange={setTotalCount}
              />
            </div>
          </div>
        </div>

        <HowShortRentWorks />
      </main>
      <Footer />
    </>
  );
}