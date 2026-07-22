"use client";

import { Filter, Star, Home, Bath, Bed, PoundSterling, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export interface ShortRentFiltersState {
  priceRange: [number, number];
  selectedTypes: string[];
  selectedBeds: number | null;
  selectedBaths: number | null;
  minRating: number;
  guestCapacity: number | null;
  minStayNights: number;
  maxStayNights: number;
  propertyPreferences: string[];
  searchLocation: string;
}

interface ShortRentFiltersProps {
  filters: ShortRentFiltersState;
  onFilterChange: (filters: Partial<ShortRentFiltersState>) => void;
}

export default function ShortRentFilters({ filters, onFilterChange }: ShortRentFiltersProps) {
  // Local state for filter controls - only applied when "Apply Filters" is clicked
  const [localFilters, setLocalFilters] = useState<ShortRentFiltersState>(filters);

  // Sync local filters with parent filters on mount or when parent changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const propertyTypes = [
    { id: "HOUSE", label: "House", icon: <Home className="w-4 h-4" /> },
    { id: "APARTMENT", label: "Apartment", icon: <Home className="w-4 h-4" /> },
    { id: "VILLA", label: "Villa", icon: <Home className="w-4 h-4" /> },
    { id: "FLAT", label: "Flat", icon: <Home className="w-4 h-4" /> },
    { id: "BUNGALOW", label: "Bungalow", icon: <Home className="w-4 h-4" /> },
    { id: "PENTHOUSE", label: "Penthouse", icon: <Home className="w-4 h-4" /> },
    { id: "COTTAGE", label: "Cottage", icon: <Home className="w-4 h-4" /> },
    { id: "CONDOMINIUM", label: "Condominium", icon: <Home className="w-4 h-4" /> },
    { id: "TOWNHOUSE", label: "Townhouse", icon: <Home className="w-4 h-4" /> },
    { id: "STUDIO", label: "Studio", icon: <Home className="w-4 h-4" /> },
  ];

  const propertyPreferencesList = [
    { id: "smoking", label: "Smoking", icon: "💨" },
    { id: "non_smoking", label: "Non-smoking", icon: "🚭" },
    { id: "pets", label: "Pets considered", icon: "🐕" },
    { id: "parking", label: "Parking available", icon: "🅿️" },
    { id: "garden", label: "Garden/Outdoor space", icon: "🌳" },
    { id: "furnished", label: "Furnished", icon: "🛋️" },
    { id: "bills_included", label: "Bills included", icon: "📄" },
  ];

  const bedrooms = [1, 2, 3, 4, 5, 6];
  const bathrooms = [1, 2, 3, 4, 5];
  const guestOptions = [1, 2, 3, 4, 5, 6, 8];

  const togglePropertyType = (type: string) => {
    const updated = localFilters.selectedTypes.includes(type)
      ? localFilters.selectedTypes.filter(t => t !== type)
      : [...localFilters.selectedTypes, type];
    setLocalFilters(prev => ({ ...prev, selectedTypes: updated }));
  };

  const togglePropertyPreference = (preference: string) => {
    const updated = localFilters.propertyPreferences.includes(preference)
      ? localFilters.propertyPreferences.filter(p => p !== preference)
      : [...localFilters.propertyPreferences, preference];
    setLocalFilters(prev => ({ ...prev, propertyPreferences: updated }));
  };

  const clearFilters = () => {
    const emptyFilters: ShortRentFiltersState = {
      priceRange: [0, 2000],
      selectedTypes: [],
      selectedBeds: null,
      selectedBaths: null,
      minRating: 0,
      guestCapacity: null,
      minStayNights: 1,
      maxStayNights: 30,
      propertyPreferences: [],
      searchLocation: "",
    };
    setLocalFilters(emptyFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-600" />
            Filters
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium cursor-pointer"
          >
            Clear all
          </button>
        </div>

        {/* Price Range (Per Night) */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PoundSterling className="w-4 h-4 text-green-600" />
            Price Per Night
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>£{localFilters.priceRange[0].toLocaleString()}</span>
              <span>£{localFilters.priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={localFilters.priceRange[0]}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, priceRange: [parseInt(e.target.value), prev.priceRange[1]] }))}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={localFilters.priceRange[1]}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], parseInt(e.target.value)] }))}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={localFilters.priceRange[0]}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Min"
              />
              <input
                type="number"
                value={localFilters.priceRange[1]}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], parseInt(e.target.value) || 2000] }))}
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${localFilters.selectedTypes.includes(type.id)
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
                onClick={() => setLocalFilters(prev => ({ ...prev, selectedBeds: beds === prev.selectedBeds ? null : beds }))}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${localFilters.selectedBeds === beds
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
                onClick={() => setLocalFilters(prev => ({ ...prev, selectedBaths: baths === prev.selectedBaths ? null : baths }))}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${localFilters.selectedBaths === baths
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {baths} {baths === 1 ? "Bath" : "Baths"}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Capacity */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            Guest Capacity
          </h4>
          <div className="flex flex-wrap gap-2">
            {guestOptions.map((guests) => (
              <button
                key={guests}
                onClick={() => setLocalFilters(prev => ({ ...prev, guestCapacity: guests === prev.guestCapacity ? null : guests }))}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${localFilters.guestCapacity === guests
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {guests} {guests === 1 ? "Guest" : "Guests"}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Stay (Nights) */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Minimum Stay (Nights)</h4>
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={localFilters.minStayNights}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, minStayNights: parseInt(e.target.value) }))}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 night</span>
            <span className="font-medium">{localFilters.minStayNights} nights</span>
          </div>
        </div>

        {/* Maximum Stay (Nights) */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Maximum Stay (Nights)</h4>
          <input
            type="range"
            min="1"
            max="90"
            step="1"
            value={localFilters.maxStayNights}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, maxStayNights: parseInt(e.target.value) }))}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 night</span>
            <span className="font-medium">{localFilters.maxStayNights} nights</span>
            <span>90+</span>
          </div>
        </div>

        {/* Property Preferences */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Property Preferences</h4>
          <div className="space-y-2">
            {propertyPreferencesList.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePropertyPreference(pref.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${localFilters.propertyPreferences.includes(pref.id)
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span className="text-lg">{pref.icon}</span>
                <span className="text-left">{pref.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-green-600" />
            Minimum Rating
          </h4>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}
                className={`p-2 rounded-lg transition-colors ${localFilters.minRating >= rating
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
              >
                <Star className={`w-5 h-5 ${localFilters.minRating >= rating ? 'fill-yellow-500' : ''}`} />
              </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">{localFilters.minRating}+ stars</span>
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <div className="sticky bottom-0 p-2 bg-white border-t">
        <Button
          onClick={applyFilters}
          className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
        >
          Apply Filters
          <Filter className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
