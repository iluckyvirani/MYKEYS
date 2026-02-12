
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BuyHero from "@/components/Buy/BuyHero";
import BuyFilters from "@/components/search/BuyFilters";
import PropertyGrid from "@/components/property/PropertyGrid";
import HowItWorks from "@/components/Buy/HowItWorks";

export interface BuyFiltersState {
  priceRange: [number, number];
  selectedTypes: string[];
  selectedBeds: number | null;
  selectedBaths: number | null;
  minRating: number;
  availableFrom: string;
  propertyPreferences: string[];
  searchLocation: string;
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<BuyFiltersState>({
    priceRange: [0, 2000000],
    selectedTypes: [],
    selectedBeds: null,
    selectedBaths: null,
    minRating: 0,
    availableFrom: "",
    propertyPreferences: [],
    searchLocation: "",
  });
  const [totalCount, setTotalCount] = useState(0);

  // Apply URL filters on page load
  useEffect(() => {
    const city = searchParams.get("city");
    const zipCode = searchParams.get("zipCode");
    
    const searchLocation = zipCode || city || "";
    
    setFilters(prev => ({
      ...prev,
      searchLocation: searchLocation,
    }));
  }, [searchParams]);

  // Extract initial values for search bar
  const initialCity = searchParams.get("city") || "";
  const initialZipCode = searchParams.get("zipCode") || "";

  const handleFilterChange = (newFilters: Partial<BuyFiltersState>) => {
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
        <BuyHero onSearchChange={handleSearchChange} initialCity={initialCity} initialZipCode={initialZipCode} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <BuyFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>
            
            <div className="lg:w-3/4" id="property-grid-section">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Properties For Sale
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">{totalCount}</span> properties found
                  {filters.searchLocation && ` in ${filters.searchLocation}`}
                </p>
              </div>
              
              <PropertyGrid 
                filters={filters} 
                onCountChange={setTotalCount}
              />
            </div>
          </div>
        </div>
      
        <HowItWorks />
        
      </main>
      <Footer />
    </>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    }>
      <BuyPageContent />
    </Suspense>
  );
}