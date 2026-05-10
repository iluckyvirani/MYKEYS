"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Grid, List, Map } from "lucide-react";
import PropertyCard, { PropertyCardProps } from "./PropertyCard";
import PropertyMapView, { MapProperty } from "./PropertyMapView";
import { api } from "@/lib/api";
import { BuyFiltersState } from "@/app/buy/page";

interface PropertyGridProps {
  filters: BuyFiltersState | any;
  searchQuery?: string;
  onCountChange?: (count: number) => void;
  listingType?: string;
  rentalType?: string;
}

export default function PropertyGrid({ filters, searchQuery = "", onCountChange, listingType = "BUY", rentalType }: PropertyGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isMapView, setIsMapView] = useState(false);
  const [mapData, setMapData] = useState<MapProperty[]>([]);
  const [filteredByMapIds, setFilteredByMapIds] = useState<Set<string> | null>(null);
  const itemsPerPage = 9;

  // Fetch properties from API
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        listingType: listingType,
        pageSize: "100",
        page: currentPage.toString(),
      });

      // Add rentalType if provided (for RENT listings)
      if (rentalType) {
        params.append("rentalType", rentalType);
      }

      // Add price range filter — only send if user actually set a value
      // (never send the default max from the page's initial state)
      if (filters.priceRange[0] > 0) {
        params.append("minPrice", filters.priceRange[0].toString());
      }
      // Only send maxPrice if it's clearly a user-chosen value:
      // buy default max is 2000000, long-rent default is 5000, short-rent is 2000
      // Treat any of those defaults as "no filter"
      const defaultMaxPrices = [2000000, 5000, 2000];
      if (filters.priceRange[1] > 0 && !defaultMaxPrices.includes(filters.priceRange[1])) {
        params.append("maxPrice", filters.priceRange[1].toString());
      }

      // Add bedrooms filter
      if (filters.selectedBeds !== null) {
        params.append("bedrooms", filters.selectedBeds.toString());
      }

      // Add bathrooms filter
      if (filters.selectedBaths !== null) {
        params.append("bathrooms", filters.selectedBaths.toString());
      }

      // Add property types filter
      if (filters.selectedTypes.length > 0) {
        params.append("propertyType", filters.selectedTypes.join(","));
      }

      // Smart city vs postcode detection — UK postcodes contain digits
      if (filters.searchLocation) {
        const loc = filters.searchLocation.trim();
        if (/\d/.test(loc)) {
          params.append("zipCode", loc);
        } else {
          params.append("city", loc);
        }
      }

      // Add minimum rating filter
      if (filters.minRating > 0) {
        params.append("minRating", filters.minRating.toString());
      }

      // Add rental-specific filters for SHORT_TERM rentals
      // Only send if user changed from defaults (minStay=1, maxStay=30)
      if (rentalType === "SHORT_TERM") {
        if (filters.guestCapacity !== null && filters.guestCapacity !== undefined) {
          params.append("guests", filters.guestCapacity.toString());
        }
        if (filters.minStayNights && filters.minStayNights > 1) {
          params.append("minStay", filters.minStayNights.toString());
        }
        if (filters.maxStayNights && filters.maxStayNights > 0 && filters.maxStayNights !== 30) {
          params.append("maxStay", filters.maxStayNights.toString());
        }
      }

      // Add rental-specific filters for LONG_TERM rentals
      // Only send if user changed from the schema defaults (minTerm=1, maxTerm=24)
      if (rentalType === "LONG_TERM") {
        if (filters.minTermMonths && filters.minTermMonths > 1) {
          params.append("minTerm", filters.minTermMonths.toString());
        }
        if (filters.maxTermMonths && filters.maxTermMonths > 0 && filters.maxTermMonths !== 24) {
          params.append("maxTerm", filters.maxTermMonths.toString());
        }
      }

      const response = await api.get(`/properties?${params.toString()}`);

      if (response.data?.success && response.data.data?.items) {
        const mappedProperties: PropertyCardProps[] = response.data.data.items.map((property: any) => ({
          id: property.id,
          imageUrl: property.images?.[0]?.url || "/api/placeholder/400/300",
          title: property.title,
          slug: property.slug,
          address: `${property.address || ""} ${property.city || ""}`.trim(),
          price: `£${property.price?.toLocaleString() || "0"}`,
          propertyPrice: `£${property.propertyPrice?.toLocaleString() || "0"}`,
          rentalType: property.rentalType?.toLowerCase() === "short_term" ? "short" : "long",
          listingType: property.listingType?.toLowerCase() === "buy" ? "buy" : "rent",
          priceType: property.priceType?.toLowerCase() || "monthly",
          rating: property.averageRating || 0,
          reviews: property.reviewCount || 0,
          sqft: property.sqft || 0,
          beds: property.bedrooms || 0,
          baths: property.bathrooms || 0,
          propertyType: property.propertyType || "Property",
          isFeatured: property.isFeatured || false,
          isNew: property.isNew || false,
          minStay: property.minStay || 1,
          minTerm: property.minTerm || 1,
          isBoosted: property.isBoosted || false,
        }));

        setProperties(mappedProperties);

        // Build map data (includes lat/lng for PropertyMapView)
        const mappedMapData: MapProperty[] = response.data.data.items.map((property: any) => ({
          id: property.id,
          title: property.title,
          price: `£${property.price?.toLocaleString() || "0"}`,
          latitude: typeof property.latitude === "number" ? property.latitude : null,
          longitude: typeof property.longitude === "number" ? property.longitude : null,
          address: `${property.address || ""} ${property.city || ""}`.trim(),
          beds: property.bedrooms || 0,
          baths: property.bathrooms || 0,
          propertyType: property.propertyType || "Property",
          imageUrl: property.images?.[0]?.url || "",
          listingType: property.listingType?.toLowerCase() || "buy",
          priceType: property.priceType?.toLowerCase() || "monthly",
          slug: property.slug,
        }));
        setMapData(mappedMapData);
        setFilteredByMapIds(null);

        setTotalCount(response.data.data.total || mappedProperties.length);
        if (onCountChange) {
          onCountChange(response.data.data.total || mappedProperties.length);
        }
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, onCountChange, listingType, rentalType]);

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Sort properties
  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return parseFloat(a.price.replace(/[^0-9.-]+/g, "")) -
          parseFloat(b.price.replace(/[^0-9.-]+/g, ""));
      case "price-high-low":
        return parseFloat(b.price.replace(/[^0-9.-]+/g, "")) -
          parseFloat(a.price.replace(/[^0-9.-]+/g, ""));
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      default:
        return 0;
    }
  });

  // Apply map-area filter when user comes back from map view
  const displayedProperties = filteredByMapIds
    ? sortedProperties.filter((p) => p.id != null && filteredByMapIds.has(String(p.id)))
    : sortedProperties;

  // Pagination logic
  const totalPages = Math.ceil(displayedProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = displayedProperties.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      {/* ── Map View (full-page fixed overlay below navbar) ───────────── */}
      {isMapView && (
        <div className="fixed inset-0 top-16 z-40">
          <PropertyMapView
            properties={mapData}
            searchLocation={filters.searchLocation}
            onBackToList={(filteredIds) => {
              setIsMapView(false);
              if (filteredIds && filteredIds.length > 0) {
                setFilteredByMapIds(new Set(filteredIds));
              }
            }}
          />
        </div>
      )}

      {/* ── List View ─────────────────────────────────────────────────── */}
      <div className={isMapView ? "hidden" : ""}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg gap-4">
        <div className="text-sm text-gray-600">
          {filteredByMapIds ? (
            <>
              <span className="font-semibold">{filteredByMapIds.size}</span> properties in drawn area{" "}
              <button
                onClick={() => setFilteredByMapIds(null)}
                className="ml-2 text-green-600 hover:text-green-800 underline font-medium"
              >
                Clear
              </button>
            </>
          ) : (
            <>
              Showing <span className="font-semibold">{loading ? "..." : `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, displayedProperties.length)}`}</span> of{" "}
              <span className="font-semibold">{loading ? "..." : totalCount}</span> properties
            </>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* View Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${viewMode === "grid"
                ? "bg-green-600 text-white shadow"
                : "hover:bg-gray-300"
                }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${viewMode === "list"
                ? "bg-green-600 text-white shadow"
                : "hover:bg-gray-300"
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Map View Toggle */}
          <button
            onClick={() => setIsMapView(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer font-medium"
          >
            <Map className="w-4 h-4 text-gray-600" />
            Map view
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      )}

      {/* Properties Grid/List */}
      {!loading && currentProperties.length > 0 && (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          : "space-y-4"
        }>
          {currentProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && currentProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No properties found matching your criteria.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Try different filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && !filteredByMapIds && (
        <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      </div>
    </div>
  );
}