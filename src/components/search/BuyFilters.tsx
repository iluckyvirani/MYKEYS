"use client";

import { Filter, Star, Home, Bath, Bed, PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BuyFilters() {
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<number | null>(null);
  const [selectedBaths, setSelectedBaths] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);

  const propertyTypes = [
    { id: "house", label: "House", icon: <Home className="w-4 h-4" /> },
    { id: "apartment", label: "Apartment", icon: <Home className="w-4 h-4" /> },
    { id: "villa", label: "Villa", icon: <Home className="w-4 h-4" /> },
    { id: "flat", label: "Flat", icon: <Home className="w-4 h-4" /> },
    { id: "bungalow", label: "Bungalow", icon: <Home className="w-4 h-4" /> },
    { id: "penthouse", label: "Penthouse", icon: <Home className="w-4 h-4" /> },
  ];

  const bedrooms = [1, 2, 3, 4, 5, 6];
  const bathrooms = [1, 2, 3, 4, 5];

  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 2000000]);
    setSelectedTypes([]);
    setSelectedBeds(null);
    setSelectedBaths(null);
    setMinRating(0);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-green-600" />
          Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PoundSterling className="w-4 h-4 text-green-600" />
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>£{priceRange[0].toLocaleString()}</span>
            <span>£{priceRange[1].toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2000000"
            step="50000"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
            className="w-full"
          />
          <input
            type="range"
            min="0"
            max="2000000"
            step="50000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Min"
            />
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-semibold text-gray-800 mb-4">Property Type</h4>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => togglePropertyType(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedTypes.includes(type.id)
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bed className="w-4 h-4 text-green-600" />
          Bedrooms
        </h4>
        <div className="flex flex-wrap gap-2">
          {bedrooms.map((beds) => (
            <button
              key={beds}
              onClick={() => setSelectedBeds(beds === selectedBeds ? null : beds)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedBeds === beds
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {beds} {beds === 1 ? "Bed" : "Beds"}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Bath className="w-4 h-4 text-green-600" />
          Bathrooms
        </h4>
        <div className="flex flex-wrap gap-2">
          {bathrooms.map((baths) => (
            <button
              key={baths}
              onClick={() => setSelectedBaths(baths === selectedBaths ? null : baths)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedBaths === baths
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {baths} {baths === 1 ? "Bath" : "Baths"}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6 pb-6 border-b">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-green-600" />
          Minimum Rating
        </h4>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`p-2 rounded-lg transition-colors ${
                minRating >= rating
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
            >
              <Star className={`w-5 h-5 ${minRating >= rating ? 'fill-yellow-500' : ''}`} />
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">{minRating}+ stars</span>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">Additional Filters</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded text-green-600" />
            <span className="text-sm text-gray-700">Featured Properties</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded text-green-600" />
            <span className="text-sm text-gray-700">New Listings (Last 7 days)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded text-green-600" />
            <span className="text-sm text-gray-700">Virtual Tour Available</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded text-green-600" />
            <span className="text-sm text-gray-700">Garden/Outdoor Space</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded text-green-600" />
            <span className="text-sm text-gray-700">Parking Available</span>
          </label>
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
        Apply Filters
        <Filter className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}