"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Grid, List, Home } from "lucide-react";
import PropertyCard, { PropertyCardProps } from "./PropertyCard";

// Mock data for properties for sale - with proper typing
const buyProperties: PropertyCardProps[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
    title: "Modern Canary Wharf Apartment",
    address: "25 Harbour Exchange, London E14",
    price: "£850,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.8,
    reviews: 24,
    sqft: 1200,
    beds: 3,
    baths: 2,
    propertyType: "Apartment",
    isFeatured: true,
    isNew: true,
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    title: "Victorian House in Kensington",
    address: "45 Kensington High Street, London W8",
    price: "£2,500,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.9,
    reviews: 18,
    sqft: 2800,
    beds: 5,
    baths: 4,
    propertyType: "House",
    isFeatured: true,
    isNew: false,
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
    title: "Riverside Studio in Chelsea",
    address: "12 Chelsea Harbour, London SW10",
    price: "£450,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.6,
    reviews: 32,
    sqft: 600,
    beds: 1,
    baths: 1,
    propertyType: "Apartment",
    isFeatured: false,
    isNew: true,
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
    title: "Luxury Penthouse in Mayfair",
    address: "8 Berkeley Square, London W1J",
    price: "£5,750,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.95,
    reviews: 12,
    sqft: 4200,
    beds: 4,
    baths: 5,
    propertyType: "Penthouse",
    isFeatured: true,
    isNew: true,
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    title: "Modern Loft in Shoreditch",
    address: "15 Brick Lane, London E1",
    price: "£675,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.7,
    reviews: 28,
    sqft: 950,
    beds: 2,
    baths: 2,
    propertyType: "Loft",
    isFeatured: false,
    isNew: false,
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    title: "Family Home in Hampstead",
    address: "23 Hampstead High Street, London NW3",
    price: "£3,200,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.8,
    reviews: 21,
    sqft: 3200,
    beds: 6,
    baths: 4,
    propertyType: "House",
    isFeatured: true,
    isNew: false,
  },
  {
    id: 7,
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
    title: "Waterfront Apartment in Canary Wharf",
    address: "33 South Quay, London E14",
    price: "£920,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.9,
    reviews: 19,
    sqft: 1100,
    beds: 2,
    baths: 2,
    propertyType: "Apartment",
    isFeatured: false,
    isNew: true,
  },
  {
    id: 8,
    imageUrl: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
    title: "Garden Flat in Notting Hill",
    address: "56 Portobello Road, London W11",
    price: "£1,350,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.7,
    reviews: 26,
    sqft: 1450,
    beds: 3,
    baths: 2,
    propertyType: "Flat",
    isFeatured: true,
    isNew: false,
  },
  {
    id: 9,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    title: "New Build in Stratford",
    address: "78 Olympic Park, London E20",
    price: "£625,000",
    rentalType: "long",
    listingType: "buy",
    priceType: "total",
    rating: 4.5,
    reviews: 14,
    sqft: 850,
    beds: 2,
    baths: 2,
    propertyType: "Apartment",
    isFeatured: false,
    isNew: true,
  },
];

export default function PropertyGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const itemsPerPage = 9;

  // Sort properties based on selected option
  const sortedProperties = [...buyProperties].sort((a, b) => {
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

  // Pagination logic
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
          Showing <span className="font-semibold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)}</span> of{" "}
          <span className="font-semibold">{sortedProperties.length}</span> properties
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" 
                  ? "bg-green-600 text-white shadow" 
                  : "hover:bg-gray-300"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" 
                  ? "bg-green-600 text-white shadow" 
                  : "hover:bg-gray-300"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          {/* Sort */}
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none cursor-pointer"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
              <option value="featured">Most Popular</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid/List */}
      <div className={`
        ${viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6" 
          : "space-y-6"
        }
      `}>
        {currentProperties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* First Page */}
          <button
            onClick={() => setCurrentPage(1)}
            className={`w-10 h-10 rounded-lg ${
              currentPage === 1
                ? "bg-green-600 text-white"
                : "border border-gray-300 hover:bg-gray-50"
            } transition-colors`}
          >
            1
          </button>
          
          {/* Show dots if needed */}
          {currentPage > 3 && (
            <span className="px-2">...</span>
          )}
          
          {/* Middle pages */}
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            if (pageNum > 1 && pageNum < totalPages && Math.abs(pageNum - currentPage) <= 1) {
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === pageNum
                      ? "bg-green-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  } transition-colors`}
                >
                  {pageNum}
                </button>
              );
            }
            return null;
          }).filter(Boolean)}
          
          {/* Show dots if needed */}
          {currentPage < totalPages - 2 && (
            <span className="px-2">...</span>
          )}
          
          {/* Last Page */}
          {totalPages > 1 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-10 h-10 rounded-lg ${
                currentPage === totalPages
                  ? "bg-green-600 text-white"
                  : "border border-gray-300 hover:bg-gray-50"
              } transition-colors`}
            >
              {totalPages}
            </button>
          )}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* No Results */}
      {currentProperties.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No properties found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't find any properties matching your search criteria. 
            Try adjusting your filters or broadening your search.
          </p>
          <button 
            onClick={() => {
              // Reset filters logic here
              setCurrentPage(1);
              setSortBy("newest");
            }}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}