"use client";

import PropertyCard, { PropertyCardProps } from "./PropertyCard";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export default function FeaturedProperties({ selectedTab = "all" }: { selectedTab?: string }) {
  const [activeFilter, setActiveFilter] = useState<string>(selectedTab || "all");
  const [visibleCount, setVisibleCount] = useState(3);
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(false);

  // UPDATED: Filters for rent and buy
  const filters = [
    { id: "all", label: "All Properties" },
    { id: "short-rent", label: "Short Rent" },
    { id: "long-rent", label: "Long Term Rent" },
    { id: "buy", label: "For Sale" },
  ];

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "ACTIVE",
        pageSize: "50",
      });

      // Set listing type based on filter
      if (activeFilter === "buy") {
        params.append("listingType", "BUY");
      } else {
        // params.append("listingType", "RENT");
        
        // Add rental type filter if specific type selected
        if (activeFilter === "short-rent") {
          params.append("rentalType", "SHORT_TERM");
        } else if (activeFilter === "long-rent") {
          params.append("rentalType", "LONG_TERM");
        }
      }

      const response = await api.get(`/properties?${params.toString()}`);
      
      if (response.data?.success && response.data.data?.items) {
        const mappedProperties: PropertyCardProps[] = response.data.data.items.map((property: any) => ({
          id: property.id,
          imageUrl: property.images?.[0]?.url || "/api/placeholder/400/300",
          title: property.title,
          slug: property.slug,
          address: `${property.address} ${property.city}`,
          price: `£${property.price}`,
          propertyPrice: `£${property.propertyPrice}`,
          rentalType: property.rentalType?.toLowerCase() === "short_term" ? "short" : "long",
          listingType: property.listingType?.toLowerCase() === "buy" ? "buy" : "rent",
          priceType: property.priceType?.toLowerCase() || "monthly",
          rating: property.averageRating || 0,
          reviews: property.reviewCount || 0,
          sqft: property.sqft || 0,
          beds: property.bedrooms || 0,
          baths: property.bathrooms || 0,
          propertyType: property.propertyType || "Property",
          isFeatured: property.isFeatured ?? false,
          isNew: false,
          minStay: property.minStay || 1,
          minTerm: property.minTerm || 1,
        }));
        setProperties(mappedProperties);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  // Sync with hero section (parent control)
  useEffect(() => {
    if (selectedTab) {
      setActiveFilter(selectedTab);
    }
  }, [selectedTab]);

  // Fetch properties when activeFilter changes
  useEffect(() => {
    fetchProperties();
  }, [activeFilter, fetchProperties]);

  const filteredProperties = properties.filter(property => {
    if (activeFilter === "all") return true;
    if (activeFilter === "short-rent") return property.rentalType === "short" && property.listingType === "rent";
    if (activeFilter === "long-rent") return property.rentalType === "long" && property.listingType === "rent";
    if (activeFilter === "buy") return property.listingType === "buy";
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
          Choose from short rents or long term rentals. Find exactly what fits your requirements.
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
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Properties Grid */}
      {!loading && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.slice(0, visibleCount).map((property, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PropertyCard {...property} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Load More / View All */}
      {!loading && visibleCount < filteredProperties.length && (
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
      {!loading && filteredProperties.length === 0 && (
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