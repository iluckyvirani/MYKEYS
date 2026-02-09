"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PropertySearchBarsecondProps {
  onSearch?: (query: string, location: string) => void;
}

export default function PropertySearchBarsecond({ onSearch }: PropertySearchBarsecondProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [location, setLocation] = useState("");

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchQuery, location);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <div className="max-w-7xl mx-auto bg-white/5 rounded-lg shadow-xl p-4">
            {/* Labels - UPDATED for better clarity */}
            <div className="grid grid-cols-12 gap-4 text-sm font-bold text-green-500 mb-2">
                <div className="col-span-8">Search</div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-12 gap-4 items-center">
                {/* Location/Area */}
                <div className="col-span-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                    <input
                        type="text"
                        placeholder="Area, city, or postcode"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="input-field bg-gray-50 w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                    />
                </div>
                <div className="col-span-4 flex items-center justify-center mt-1">
                    <Button 
                        onClick={handleSearch}
                        className="w-100 h-12 bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>
            </div>

        </div>
    );
}