"use client";

import PropertyCard, { PropertyCardProps } from "./PropertyCard";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

// UPDATED: Properly typed property data
const properties: (PropertyCardProps & { id: number })[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070",
    title: "Modern Luxury Villa",
    address: "710 Boyd Dr, Baton Rouge, LA",
    price: "$5,000",
    rentalType: "long", // Fixed: specific type
    listingType: "rent", // Fixed: specific type
    priceType: "monthly", // Fixed: specific type
    rating: 4.9,
    reviews: 42,
    sqft: 8000,
    beds: 4,
    baths: 4,
    propertyType: "Villa",
    isFeatured: true,
    isNew: false,
    minStay: 2,
    maxStay: 30,
    minLease: 12
  },
  {
    id: 2,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071",
    title: "Downtown Luxury Apartment",
    address: "123 Skyline Ave, New York, NY",
    price: "$250",
    rentalType: "short", // Fixed: specific type
    listingType: "rent", // Fixed: specific type
    priceType: "nightly", // Fixed: specific type
    rating: 4.8,
    reviews: 28,
    sqft: 1800,
    beds: 2,
    baths: 2,
    propertyType: "Apartment",
    isFeatured: false,
    isNew: true,
    minStay: 1,
    maxStay: 14,
    minLease: undefined // Optional
  },
  {
    id: 3,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
    title: "Lakeside Family Home",
    address: "456 Lakeview Dr, Seattle, WA",
    price: "$850,000",
    rentalType: "long", // Fixed: specific type
    listingType: "buy", // Fixed: specific type
    priceType: "total", // Fixed: specific type
    rating: 4.7,
    reviews: 36,
    sqft: 4200,
    beds: 5,
    baths: 3,
    propertyType: "Family Home",
    isFeatured: true,
    isNew: false,
    minStay: undefined,
    maxStay: undefined,
    minLease: 24
  },
  {
    id: 4,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070",
    title: "Urban Studio Apartment",
    address: "789 Urban St, Chicago, IL",
    price: "$1,800",
    rentalType: "long", // Fixed: specific type
    listingType: "rent", // Fixed: specific type
    priceType: "monthly", // Fixed: specific type
    rating: 4.6,
    reviews: 19,
    sqft: 800,
    beds: 1,
    baths: 1,
    propertyType: "Apartment",
    isFeatured: false,
    isNew: true,
    minStay: undefined,
    maxStay: undefined,
    minLease: 6
  },
  {
    id: 5,
    imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070",
    title: "Countryside Villa",
    address: "101 Farm Rd, Austin, TX",
    price: "$180",
    rentalType: "short", // Fixed: specific type
    listingType: "rent", // Fixed: specific type
    priceType: "nightly", // Fixed: specific type
    rating: 4.9,
    reviews: 31,
    sqft: 5200,
    beds: 4,
    baths: 3,
    propertyType: "Villa",
    isFeatured: true,
    isNew: false,
    minStay: 3,
    maxStay: 28,
    minLease: undefined
  },
  {
    id: 6,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
    title: "Commercial Office Space",
    address: "202 Business Ave, Miami, FL",
    price: "$1,200,000",
    rentalType: "long", // Fixed: specific type
    listingType: "buy", // Fixed: specific type
    priceType: "total", // Fixed: specific type
    rating: 4.5,
    reviews: 24,
    sqft: 5000,
    beds: 0,
    baths: 2,
    propertyType: "Commercial",
    isFeatured: false,
    isNew: true,
    minStay: undefined,
    maxStay: undefined,
    minLease: 60
  }
];

export default function FeaturedProperties() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(3);

  // UPDATED: Filters for your business model
  const filters = [
    { id: "all", label: "All Properties" },
    { id: "short-rent", label: "Short Rent" },
    { id: "long-rent", label: "Long Term Rent" },
    { id: "buy", label: "For Sale" },
    // { id: "featured", label: "Featured" },
    // { id: "new", label: "New Listings" },
    // { id: "villa", label: "Villas" },
    // { id: "apartment", label: "Apartments" },
  ];

  const filteredProperties = properties.filter(property => {
    if (activeFilter === "all") return true;
    if (activeFilter === "short-rent") return property.rentalType === "short" && property.listingType === "rent";
    if (activeFilter === "long-rent") return property.rentalType === "long" && property.listingType === "rent";
    if (activeFilter === "buy") return property.listingType === "buy";
    // if (activeFilter === "featured") return property.isFeatured;
    // if (activeFilter === "new") return property.isNew;
    // if (activeFilter === "villa") return property.propertyType === "Villa";
    // if (activeFilter === "apartment") return property.propertyType === "Apartment";
    return true;
  });

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 3, filteredProperties.length));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm font-medium">Featured Properties</span>
        </div>
        
        <h2 className="font-spartan text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Properties For Every Need
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from short rents, long term rentals, or purchase options. Find exactly what fits your requirements.
        </p>
      </motion.div>

      {/* Filter Tabs - Horizontal Scroll on Mobile */}
      <div className="overflow-x-auto pb-4 mb-10 scrollbar-hide">
        <div className="flex items-center justify-center gap-2 min-w-max px-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setVisibleCount(3);
              }}
              className={`px-5 py-2.5 rounded-[5px] text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeFilter === filter.id
                  ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.slice(0, visibleCount).map((property, index) => {
          // Remove the 'id' property before passing to PropertyCard
          const { id, ...cardProps } = property;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PropertyCard {...cardProps} />
            </motion.div>
          );
        })}
      </div>

      {/* Load More / View All */}
      {visibleCount < filteredProperties.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-12"
        >
          <button
            onClick={showMore}
            className="group inline-flex items-center gap-2 bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium px-8 py-3 rounded-[5px] hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Load More Properties
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}

      {/* No Results Message */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
          <button
            onClick={() => setActiveFilter("all")}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
          >
            View all properties
          </button>
        </div>
      )}
    </section>
  );
}