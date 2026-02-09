
"use client";

import { useState } from "react";
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

export default function BuyPage() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const handleFilterChange = (newFilters: Partial<BuyFiltersState>) => {
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
        <BuyHero onSearchChange={handleSearchChange} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-5">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <BuyFilters filters={filters} onFilterChange={handleFilterChange} />
            </div>
            
            <div className="lg:w-3/4">
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
                searchQuery={searchQuery}
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