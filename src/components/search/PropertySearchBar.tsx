"use client";

import { Search} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PropertySearchBar({ selectedType }: { selectedType: "all" | "buy" | "short-rent" | "long-rent" }) {
  const router = useRouter();
  // const [propertyType, setPropertyType] = useState("");
  // const [minPrice, setMinPrice] = useState("");
  // const [maxPrice, setMaxPrice] = useState("");
  // const [searchLocation, setSearchLocation] = useState("");

  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

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
      // if (searchLocation) params.append("search", searchLocation);
      // if (propertyType) params.append("propertyType", propertyType.toUpperCase());
      // if (minPrice) params.append("minPrice", minPrice);
      // if (maxPrice) params.append("maxPrice", maxPrice);

      if (city) params.append("city", city);
      if (zipCode) params.append("zipCode", zipCode);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-green-500 mb-2">
          <div>City</div>
          <div>Zipcode</div>
        </div>
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
          {/* City Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., London"
              value={city}
              disabled={loading}
              onChange={(e) => setCity(e.target.value)}
              className="input-field bg-gray-50 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 transition"
            />
          </div>

          {/* Zipcode Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., SW1A 1AA"
              value={zipCode}
              disabled={loading}
              onChange={(e) => setZipCode(e.target.value)}
              className="input-field bg-gray-50 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 transition"
            />
          </div>
        </div>

        {/* Search Button - Full Width Below */}
        <div className="flex items-center justify-center">
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