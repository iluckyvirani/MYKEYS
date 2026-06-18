"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ShortRentHero from "@/components/rent/ShortRentHero";
import PropertyGrid from "@/components/property/PropertyGrid";
import HowShortRentWorks from "@/components/rent/HowShortRentWorks";
import ShortRentFilters from "@/components/search/ShortRentFilters";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";

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

function ShortRentPageContent() {
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
    const city = searchParams.get("city");
    const zipCode = searchParams.get("zipCode");
    const propertyType = searchParams.get("propertyType");

    const searchLocation = zipCode || city || "";

    setFilters(prev => ({
      ...prev,
      searchLocation: searchLocation,
      ...(propertyType
        ? { selectedTypes: [propertyType.toUpperCase()] }
        : {}),
    }));
  }, [searchParams]);

  // Extract initial values for search bar
  const initialCity = searchParams.get("city") || "";
  const initialZipCode = searchParams.get("zipCode") || "";

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
        <ShortRentHero onSearchChange={handleSearchChange} initialCity={initialCity} initialZipCode={initialZipCode} />

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

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <DynamicFAQSection
            categories={["SHORT_RENT"]}
            showViewAll
            viewAllHref="/faq?category=SHORT_RENT"
            title="Short Rent FAQs"
            subtitle="Common questions about booking short stays"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ShortRentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    }>
      <ShortRentPageContent />
    </Suspense>
  );
}