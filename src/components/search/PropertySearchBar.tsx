"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { looksLikePostcode } from "@/lib/buySearch";
import { normalizeSearchLocation } from "@/lib/ukPostcode";

export default function PropertySearchBar({
  selectedType,
}: {
  selectedType: "all" | "buy" | "short-rent" | "long-rent";
}) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (selectedType === "all") return;

    const trimmed = normalizeSearchLocation(location);
    if (!trimmed) {
      setError("Enter a city or postcode to search");
      return;
    }

    setError("");
    setLoading(true);
    setLocation(trimmed);

    const q = encodeURIComponent(trimmed);

    if (selectedType === "buy") {
      router.push(`/buy/search?location=${q}`);
    } else if (selectedType === "long-rent") {
      router.push(`/rent/whole-property/search?location=${q}`);
    } else if (selectedType === "short-rent") {
      router.push(`/rent/short-rent/search?location=${q}`);
    }

    setLoading(false);
  };

  if (selectedType === "all") return null;

  return (
    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-4">
      <p className="text-sm font-semibold text-green-400 mb-2">
        City or Postcode
      </p>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="e.g., London  or  SW1A 1AA"
            value={location}
            disabled={loading}
            onChange={(e) => {
              setLocation(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-white w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition text-gray-900 text-sm placeholder:text-gray-400"
          />
          {location.trim() && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">
              {looksLikePostcode(location) ? "Postcode" : "City"}
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg shrink-0 cursor-pointer"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
