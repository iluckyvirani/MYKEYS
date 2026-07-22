"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Returns true when the value looks like a UK postcode / zip code (contains at least one digit) */
const looksLikePostcode = (value: string) => /\d/.test(value);

export default function PropertySearchBar({ selectedType }: { selectedType: "all" | "buy" | "short-rent" | "long-rent" }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (selectedType === "all") return;

    setLoading(true);

    const trimmed = location.trim();
    const isPostcode = looksLikePostcode(trimmed);
    const city = isPostcode ? "" : trimmed;
    const zipCode = isPostcode ? trimmed : "";

    const params = new URLSearchParams();
    if (city) params.append("city", city);
    if (zipCode) params.append("zipCode", zipCode);

    const routes: Record<string, string> = {
      "buy": "/buy/search",
      "short-rent": "/rent/short-rent",
      "long-rent": "/rent/whole-property",
    };

    if (selectedType === "buy") {
      const location = trimmed;
      router.push(`/buy/search?location=${encodeURIComponent(location)}`);
    } else if (selectedType === "long-rent") {
      router.push(
        `/rent/whole-property/search?location=${encodeURIComponent(trimmed)}`
      );
    } else {
      router.push(`${routes[selectedType]}?${params.toString()}`);
    }
    setLoading(false);
  };

  if (selectedType === "all") return null;

  return (
    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-4">
      <p className="text-sm font-semibold text-green-400 mb-2">City or Postcode</p>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="e.g., London  or  SW1A 1AA"
            value={location}
            disabled={loading}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-white w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition text-gray-900 text-sm placeholder:text-gray-400"
          />
          {location && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full font-medium bg-green-50 text-green-700">
              {looksLikePostcode(location) ? "Postcode" : "City"}
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg shrink-0"
        >
          <Search className="w-4 h-4 mr-2" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
}