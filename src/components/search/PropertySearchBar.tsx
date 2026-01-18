"use client";

import { Search, Home, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PropertySearchBar() {
  const [propertyType, setPropertyType] = useState("");
  const [rentalType, setRentalType] = useState(""); // "short" or "long"

  return (
    <div className="max-w-7xl mx-auto bg-white/5 rounded-lg shadow-xl p-4">
      {/* Labels - UPDATED for better clarity */}
      <div className="grid grid-cols-12 gap-4 text-sm font-bold text-green-500 mb-2">
        <div className="col-span-3">Search</div>
        <div className="col-span-3">Property Type</div>
        <div className="col-span-2">Rental Type</div>
        <div className="col-span-2">Min Price</div>
        <div className="col-span-2">Max Price</div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Keyword */}
        <div className="col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="text"
            placeholder="Location or keywords"
            className="input-field bg-gray-50"
          />
        </div>

        {/* Property Type */}
        <div className="col-span-3 relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <select
            className="input-field appearance-none bg-white"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            <option value="">Property Type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="house">House</option>
            <option value="flat">Flat</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        {/* Rental Type - NEW: For filtering Short vs Long term */}
        <div className="col-span-2 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <select
            className="input-field appearance-none bg-white"
            value={rentalType}
            onChange={(e) => setRentalType(e.target.value)}
          >
            <option value="">Rental Duration</option>
            <option value="short">Short Rent (Nightly)</option>
            <option value="long">Long Term (Monthly)</option>
          </select>
        </div>

        {/* Min Price */}
        <div className="col-span-2 relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="number"
            placeholder="Min Price"
            className="input-field bg-gray-50"
          />
        </div>

        {/* Max Price */}
        <div className="col-span-2 relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="number"
            placeholder="Max Price"
            className="input-field bg-gray-50"
          />
        </div>

        {/* Search Button */}

      </div>
      <div className="flex items-center justify-center mt-1">
        <Button className="w-100 rounded-tr-none rounded-tl-none h-12 bg-green-600 hover:bg-green-700 text-white">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
}