"use client";

import { Filter, Star, Home, Bath, Bed, PoundSterling, Wind, VolumeX, Users, Dog, Car, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function BuyFilters() {
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<number | null>(null);
  const [selectedBaths, setSelectedBaths] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const [minStay, setMinStay] = useState<number>(0);
  const [maxStay, setMaxStay] = useState<number>(12);
  const [availableFrom, setAvailableFrom] = useState<string>("");
  const [householdOptions, setHouseholdOptions] = useState<string[]>([]);
  const [propertyPreferences, setPropertyPreferences] = useState<string[]>([]);
  const [PropertyFor, setPropertyFor] = useState<string[]>([]);


  const propertyTypes = [
    { id: "house", label: "House", icon: <Home className="w-4 h-4" /> },
    { id: "apartment", label: "Apartment", icon: <Home className="w-4 h-4" /> },
    { id: "villa", label: "Villa", icon: <Home className="w-4 h-4" /> },
    { id: "flat", label: "Flat", icon: <Home className="w-4 h-4" /> },
    { id: "bungalow", label: "Bungalow", icon: <Home className="w-4 h-4" /> },
    { id: "penthouse", label: "Penthouse", icon: <Home className="w-4 h-4" /> },
  ];

  const householdOptionsList = [
    { id: "lgbt", label: "LGBT household", icon: "🏳️‍🌈" },
    { id: "vegetarian", label: "Vegetarian/vegan preferred", icon: "🥗" },
  ];

  const propertyPreferencesList = [
    { id: "smoking", label: "Smoking", icon: <Wind className="w-4 h-4" /> },
    { id: "non_smoking", label: "Non-smoking", icon: <VolumeX className="w-4 h-4" /> },
    { id: "pets", label: "Pets considered", icon: <Dog className="w-4 h-4" /> },
    { id: "parking", label: "Parking available", icon: <Car className="w-4 h-4" /> },
    { id: "garden", label: "Garden/Outdoor space", icon: "🌳" },
    { id: "furnished", label: "Furnished", icon: "🛋️" },
    { id: "bills_included", label: "Bills included", icon: "📄" },
  ];


  const forOptionsList = [
    { id: "dontmind", label: "Don't Mind", icon: "" },
    { id: "female", label: "Female only", icon: "👩" },
    { id: "male", label: "Male only", icon: "👨" },
    { id: "couples", label: "Couples welcome", icon: "👫" },
    { id: "students", label: "Students welcome", icon: "🎓" },
    { id: "professionals", label: "Professionals only", icon: "💼" },
  ];

  const bedrooms = [1, 2, 3, 4, 5, 6];
  const bathrooms = [1, 2, 3, 4, 5];

  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleHouseholdOption = (option: string) => {
    setHouseholdOptions(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };


  const togglePropertyPreference = (preference: string) => {
    setPropertyPreferences(prev =>
      prev.includes(preference) ? prev.filter(p => p !== preference) : [...prev, preference]
    );
  };

  const togglePropertyFor = (option: string) => {
    setPropertyFor(prev =>
      prev.includes(option) ? prev.filter(p => p !== option) : [...prev, option]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 2000000]);
    setSelectedTypes([]);
    setSelectedBeds(null);
    setSelectedBaths(null);
    setMinRating(0);
    setMinStay(0);
    setMaxStay(12);
    setAvailableFrom("");
    setHouseholdOptions([]);
    setPropertyPreferences([]);
    setPropertyFor([]);
  };



  const applyFilters = () => {
    console.log("Applying filters:", {
      priceRange,
      selectedTypes,
      selectedBeds,
      selectedBaths,
      minRating,
      minStay,
      maxStay,
      availableFrom,
      householdOptions,
      propertyPreferences,
    });
    // Here you would typically update your state or make an API call
  };


  return (
    <div className="bg-white rounded--[5px] shadow-lg relative">
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

        {/* Price Range */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PoundSterling className="w-4 h-4 text-green-600" />
            Price Range
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
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

        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Available From</h4>
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Property Type */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Property Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => togglePropertyType(type.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${selectedTypes.includes(type.id)
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
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedBeds === beds
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
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedBaths === baths
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {baths} {baths === 1 ? "Bath" : "Baths"}
              </button>
            ))}
          </div>
        </div>

        {/* minimum stay months */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4"> Minimum Stay (months)</h4>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={minStay}
            onChange={(e) => setMinStay(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Any</span>
            <span className="font-medium">{minStay} months</span>
          </div>
        </div>

        {/* maxim stay  months*/}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Maximum Stay (months)</h4>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={maxStay}
            onChange={(e) => setMaxStay(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 month</span>
            <span className="font-medium">{maxStay} months</span>
            <span>24+</span>
          </div>
        </div>

         {/* minimum stay night */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4"> Minimum Stay (nights)</h4>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={minStay}
            onChange={(e) => setMinStay(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Any</span>
            <span className="font-medium">{minStay} nights</span>
          </div>
        </div>

        {/* maxim stay  night*/}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4">Maximum Stay (nights)</h4>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={maxStay}
            onChange={(e) => setMaxStay(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>1 nights</span>
            <span className="font-medium">{maxStay} nights</span>
            <span>24+</span>
          </div>
        </div>

        {/* household options */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            Household Options
          </h4>
          <div className="space-y-2">
            {householdOptionsList.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleHouseholdOption(option.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${householdOptions.includes(option.id)
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-left">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Property Preferences */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-green-600" />
            Property Preferences
          </h4>
          <div className="space-y-2">
            {propertyPreferencesList.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePropertyPreference(pref.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${propertyPreferences.includes(pref.id)
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {typeof pref.icon === 'string' ? (
                  <span className="text-lg">{pref.icon}</span>
                ) : (
                  pref.icon
                )}
                <span className="text-left">{pref.label}</span>
              </button>
            ))}
          </div>
        </div>


        {/* Property for */}
        <div className="mb-6 pb-6 border-b">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-green-600" />
            Property for
          </h4>
          <div className="space-y-2">
            {forOptionsList.map((pref) => (
              <button
                key={pref.id}
                onClick={() => togglePropertyFor(pref.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${PropertyFor.includes(pref.id)
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {typeof pref.icon === 'string' ? (
                  <span className="text-lg">{pref.icon}</span>
                ) : (
                  pref.icon
                )}
                <span className="text-left">{pref.label}</span>
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
                className={`p-2 rounded-lg transition-colors ${minRating >= rating
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
          </div>
        </div>
      </div >

      {/* Apply Filters Button */}
      < div className="sticky bottom-0 p-2 bg-white" >
        <Button className="w-full rounded-[5px] cursor-pointer  bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
          Apply Filters
          <Filter className="w-4 h-4 ml-2" />
        </Button>
      </div >

    </div >
  );
}


"use client";

import { Search, DollarSign, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export  function PropertySearchBar({ selectedType }: { selectedType: "all" | "buy" | "short-rent" | "long-rent" }) {
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
        "long-rent": "/rent/whole-property",
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
              <option value="bungalow">Bungalow</option>
              <option value="penthouse">Penthouse</option>
              <option value="cottage">Cottage</option>
              <option value="condominium">Condominium</option>
              <option value="townhouse">Townhouse</option>
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