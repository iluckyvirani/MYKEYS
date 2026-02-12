"use client";

import { Search } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface PropertySearchProps {
    onSearch?: (city: string, zipcode: string) => void;
    initialCity?: string;
    initialZipCode?: string;
}

export default function PropertySearch({ onSearch, initialCity = "", initialZipCode = "" }: PropertySearchProps) {
    const [city, setCity] = useState(initialCity);
    const [zipCode, setZipCode] = useState(initialZipCode);
    const router = useRouter();

    const handleSearch = () => {
        if (onSearch) {
            onSearch(city, zipCode);
        } else {
            // Default behavior: navigate to properties page with query params
            const params = new URLSearchParams();
            if (city) params.append("city", city);
            if (zipCode) params.append("zipCode", zipCode);
            router.push(`/buy?${params.toString()}`);
        }
        
        // Scroll down to property grid after a short delay
        setTimeout(() => {
            const propertyGridSection = document.getElementById("property-grid-section");
            if (propertyGridSection) {
                propertyGridSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                // Fallback: scroll down by a fixed amount
                window.scrollBy({ top: 600, behavior: "smooth" });
            }
        }, 300);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="max-w-7xl mx-auto bg-white/5 rounded-lg shadow-xl p-4">
            {/* Labels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-green-500 mb-2">
                <div>City</div>
                <div>Zipcode</div>
            </div>

            {/* Inputs - Two Per Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
                {/* City Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g., London"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="input-field bg-gray-50 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 transition"
                    />
                </div>

                {/* Zipcode Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="e.g., SW1A 1AA"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="input-field bg-gray-50 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 transition"
                    />
                </div>
            </div>

            {/* Search Button - Full Width Below */}
            <div className="flex items-center justify-center">
                <Button
                    type="submit"
                    onClick={handleSearch}
                    className="w-100 rounded-tr-none rounded-tl-none h-12 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                </Button>
            </div>
        </div>
    );
}