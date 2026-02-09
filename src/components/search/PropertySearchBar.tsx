"use client";

import { Search, Home, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PropertySearchBar({ selectedType }: { selectedType: "all" | "buy" | "short-rent" | "long-rent" }) {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedType === "all") return;

    setLoading(true);
    setError("");

    try {
      // Build query params
      const params = new URLSearchParams();
      if (searchLocation) params.append("search", searchLocation);
      if (propertyType) params.append("propertyType", propertyType.toUpperCase());
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      // Add filter based on selected type
      const filterMap: Record<string, { listingType: string; rentalType?: string }> = {
        "buy": { listingType: "BUY" },
        "short-rent": { listingType: "RENT", rentalType: "SHORT_TERM" },
        "long-rent": { listingType: "RENT", rentalType: "LONG_TERM" },
      };

      const filter = filterMap[selectedType as keyof typeof filterMap];
      params.append("listingType", filter.listingType);
      if (filter.rentalType) {
        params.append("rentalType", filter.rentalType);
      }

      // Redirect to appropriate page based on selected type
      const routes: Record<string, string> = {
        "buy": "/buy",
        "short-rent": "/rent/short-rent",
        "long-rent": "/rent/long-rent",
      };

      router.push(`${routes[selectedType as keyof typeof routes]}?${params.toString()}`);
    } catch (err: any) {
      const message = err?.message || "Search failed. Please try again.";
      setError(message);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Don't show search bar if "all" is selected
  if (selectedType === "all") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto bg-white/5 rounded-lg shadow-xl p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSearch}>
        {/* Labels - UPDATED for better clarity */}
        <div className="grid grid-cols-12 gap-4 text-sm font-bold text-green-500 mb-2">
          <div className="col-span-3">Search</div>
          <div className="col-span-3">Property Type</div>
          <div className="col-span-3">Min Price</div>
          <div className="col-span-3">Max Price</div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Keyword */}
          <div className="col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            <input
              type="text"
              placeholder="Area or postcode"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              disabled={loading}
              className="input-field bg-gray-50"
            />
          </div>

          {/* Property Type */}
          <div className="col-span-3 relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            <select
              title="Property type"
              aria-label="Property type"
              className="input-field appearance-none bg-white"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              disabled={loading}
            >
              <option value="">All Property Types</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="house">House</option>
              <option value="flat">Flat</option>
              <option value="commercial">Commercial</option>
              <option value="cottage">Cottage</option>
              <option value="penthouse">Penthouse</option>
              <option value="studio">Studio</option>
            </select>
          </div>

          {/* Min Price */}
          <div className="col-span-3 relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              disabled={loading}
              className="input-field bg-gray-50"
            />
          </div>

          {/* Max Price */}
          <div className="col-span-3 relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              disabled={loading}
              className="input-field bg-gray-50"
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-1">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-100 rounded-tr-none rounded-tl-none h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
    </div>
  );
}