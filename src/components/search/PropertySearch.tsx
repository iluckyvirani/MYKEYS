"use client";

import { Search, MapPin } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface PropertySearchProps {
    onSearch?: (city: string, zipcode: string) => void;
    initialCity?: string;
    initialZipCode?: string;
}

/** Returns true when the value looks like a UK postcode / zip code (contains at least one digit) */
const looksLikePostcode = (value: string) => /\d/.test(value);

export default function PropertySearch({ onSearch, initialCity = "", initialZipCode = "" }: PropertySearchProps) {
    // Merge initial values — postcode takes priority for pre-fill
    const [location, setLocation] = useState(initialZipCode || initialCity);
    const router = useRouter();

    const handleSearch = () => {
        const trimmed = location.trim();
        const isPostcode = looksLikePostcode(trimmed);
        const city = isPostcode ? "" : trimmed;
        const zipCode = isPostcode ? trimmed : "";

        if (onSearch) {
            onSearch(city, zipCode);
        } else {
            const params = new URLSearchParams();
            if (city) params.append("city", city);
            if (zipCode) params.append("zipCode", zipCode);
            router.push(`/buy?${params.toString()}`);
        }

        setTimeout(() => {
            const section = document.getElementById("property-grid-section");
            if (section) {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                window.scrollBy({ top: 600, behavior: "smooth" });
            }
        }, 300);
    };

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
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="bg-white w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-green-500 transition text-gray-900 text-sm placeholder:text-gray-400"
                    />
                    {location && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded-full font-medium
                            bg-green-50 text-green-700">
                            {looksLikePostcode(location) ? "Postcode" : "City"}
                        </span>
                    )}
                </div>
                <Button
                    type="button"
                    onClick={handleSearch}
                    className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg shrink-0"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                </Button>
            </div>
        </div>
    );
}