"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyGrid from "@/components/property/PropertyGrid";
import LongRentHero from "@/components/Rent/LongRentHero";
import HowLongRentWorks from "@/components/Rent/HowLongRentWorks";
import LongRentFilters from "@/components/search/LongRentFilters";

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

export default function LongRentPage() {
  const [filters, setFilters] = useState<LongRentFiltersState>({
    priceRange: [0, 5000],
    selectedTypes: [],
    selectedBeds: null,
    selectedBaths: null,
    minRating: 0,
    minTermMonths: 1,
    maxTermMonths: 24,
    propertyPreferences: [],
    searchLocation: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const handleFilterChange = (newFilters: Partial<LongRentFiltersState>) => {
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
        <LongRentHero onSearchChange={handleSearchChange} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <LongRentFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="lg:w-3/4">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Long Term Rental Properties
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
                rentalType="LONG_TERM"
                onCountChange={setTotalCount}
              />
            </div>
          </div>
        </div>

        <HowLongRentWorks />
      </main>
      <Footer />
    </>
  );
}