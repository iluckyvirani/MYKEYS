"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function LongRentPageContent() {
  const searchParams = useSearchParams();
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
  const [totalCount, setTotalCount] = useState(0);

  // Apply URL filters on page load
  useEffect(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const propertyType = searchParams.get("propertyType");
    const searchLocation = searchParams.get("search");
    
    setFilters(prev => ({
      ...prev,
      priceRange: [
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 5000
      ],
      selectedTypes: propertyType ? propertyType.split(",") : [],
      searchLocation: searchLocation || "",
    }));

    // Scroll to property grid after filters are applied
    setTimeout(() => {
      const propertyGridSection = document.getElementById("property-grid-section");
      if (propertyGridSection) {
        propertyGridSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  }, [searchParams]);

  const handleFilterChange = (newFilters: Partial<LongRentFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (city: string, zipCode: string) => {
    const location = zipCode || city;
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

            <div className="lg:w-3/4" id="property-grid-section">
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

export default function LongRentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    }>
      <LongRentPageContent />
    </Suspense>
  );
}