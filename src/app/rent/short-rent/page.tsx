"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
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
        maxPrice ? parseInt(maxPrice) : 2000
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

  const handleFilterChange = (newFilters: Partial<ShortRentFiltersState>) => {
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
        <ShortRentHero onSearchChange={handleSearchChange} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <ShortRentFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>

            <div className="lg:w-3/4" id="property-grid-section">
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