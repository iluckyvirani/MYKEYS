// components/dashboard/UserDashboard/FavoriteProperties.tsx
"use client";

import { Heart, MapPin, Star, Eye, Trash2, Home, Building2, TrendingUp, Calendar, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const mockFavorites = [
  {
    id: "FAV001",
    title: "Seaside Luxury Villa",
    address: "Beach Road, Goa, India",
    price: 45000,
    listingType: "rent", // rent or buy
    rentalType: "short", // short or long (only for rent)
    priceType: "nightly", // nightly, monthly, total
    rating: 4.8,
    reviews: 124,
    propertyType: "villa",
    beds: 4,
    baths: 3,
    sqft: 2800,
    amenities: ["Private Pool", "Beach View", "WiFi", "AC"],
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070",
    savedDate: "2024-01-02",
    priceDrop: 10,
    isAvailable: true,
    minStay: 2,
    maxStay: 30,
    propertyId: "PROP001",
  },
  {
    id: "FAV002",
    title: "Modern 2BHK Apartment",
    address: "Koramangala, Bangalore, India",
    price: 35000,
    listingType: "rent",
    rentalType: "long",
    priceType: "monthly",
    rating: 4.5,
    reviews: 89,
    propertyType: "apartment",
    beds: 2,
    baths: 2,
    sqft: 1200,
    amenities: ["Fully Furnished", "Gym", "Security", "Parking"],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070",
    savedDate: "2024-01-01",
    priceDrop: 0,
    isAvailable: true,
    minLease: 12,
    maxLease: 24,
    propertyId: "PROP002",
  },
  {
    id: "FAV003",
    title: "Mountain View Cottage",
    address: "Shimla, Himachal Pradesh",
    price: 18000,
    listingType: "rent",
    rentalType: "short",
    priceType: "nightly",
    rating: 4.9,
    reviews: 67,
    propertyType: "cottage",
    beds: 2,
    baths: 1,
    sqft: 1100,
    amenities: ["Fireplace", "Mountain View", "Kitchen", "Garden"],
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2065",
    savedDate: "2023-12-28",
    priceDrop: 15,
    isAvailable: false,
    minStay: 3,
    maxStay: 14,
    propertyId: "PROP003",
  },
  {
    id: "FAV004",
    title: "Luxury Penthouse for Sale",
    address: "Bandra, Mumbai, India",
    price: 85000000,
    listingType: "buy",
    rentalType: null,
    priceType: "total",
    rating: 4.7,
    reviews: 45,
    propertyType: "penthouse",
    beds: 3,
    baths: 3,
    sqft: 3200,
    amenities: ["Private Pool", "Gym", "City View", "Concierge"],
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2070",
    savedDate: "2023-12-25",
    priceDrop: 5,
    isAvailable: true,
    propertyId: "PROP004",
  },
];

const getListingTypeBadge = (listingType: string, rentalType?: string | null) => {
  if (listingType === "buy") {
    return {
      text: "For Sale",
      color: "bg-purple-100 text-purple-800",
      icon: TrendingUp,
    };
  }
  if (rentalType === "short") {
    return {
      text: "Short Stay",
      color: "bg-green-100 text-green-800",
      icon: Hotel,
    };
  }
  if (rentalType === "long") {
    return {
      text: "Long Term",
      color: "bg-blue-100 text-blue-800",
      icon: Calendar,
    };
  }
  return {
    text: "For Rent",
    color: "bg-gray-100 text-gray-800",
    icon: Home,
  };
};

const getPropertyTypeColor = (type: string) => {
  switch (type) {
    case "villa":
      return "text-purple-600";
    case "apartment":
      return "text-blue-600";
    case "cottage":
      return "text-green-600";
    case "penthouse":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

export default function FavoriteProperties() {
  const [favorites, setFavorites] = useState(mockFavorites);
  const [filter, setFilter] = useState<string>("all"); // all, short, long, buy

  const filteredFavorites = filter === "all"
    ? favorites
    : favorites.filter(fav =>
      filter === "buy" ? fav.listingType === "buy" :
        filter === "short" ? fav.rentalType === "short" :
          filter === "long" ? fav.rentalType === "long" : true
    );

  const handleRemoveFavorite = (id: string) => {
    if (window.confirm("Remove this property from favorites?")) {
      setFavorites(favorites.filter(fav => fav.id !== id));
    }
  };

  const getPriceLabel = (priceType: string, listingType: string) => {
    if (listingType === "buy") return "total";
    if (priceType === "nightly") return "/night";
    if (priceType === "monthly") return "/month";
    return "";
  };

  const getPropertyUrl = (propertyId: string, title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `/property/${propertyId}-${slug}`;
  };

  const getDurationText = (property: any) => {
    if (property.listingType === "buy") return "";
    if (property.rentalType === "short") return `Min ${property.minStay} night${property.minStay > 1 ? 's' : ''}`;
    if (property.rentalType === "long") return `Min ${property.minLease} month${property.minLease > 1 ? 's' : ''}`;
    return "";
  };

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Favorite Properties</h3>
          <p className="text-sm text-gray-500 mt-1">
            {favorites.length} saved properties
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter buttons */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "all" ? "bg-white shadow" : ""}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("short")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "short" ? "bg-white shadow" : ""}`}
            >
              Short Stay
            </button>
            <button
              onClick={() => setFilter("long")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "long" ? "bg-white shadow" : ""}`}
            >
              Long Rent
            </button>
            <button
              onClick={() => setFilter("buy")}
              className={`px-3 py-1 text-sm rounded-md ${filter === "buy" ? "bg-white shadow" : ""}`}
            >
              For Sale
            </button>
          </div>

          <Button variant="outline" size="sm" className="rounded-[5px] cursor-pointer">
            View All
          </Button>
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No favorite properties yet
          </h4>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Save properties you like by clicking the heart icon on property listings
          </p>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Eye className="w-4 h-4 mr-2" />
            Browse Properties
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFavorites.map((property) => {
            const listingBadge = getListingTypeBadge(property.listingType, property.rentalType);
            const ListingIcon = listingBadge.icon;
            const durationText = getDurationText(property);

            return (
              <div
                key={property.id}
                className="group relative overflow-hidden rounded-[5px] border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                {/* Property Image */}
                <div className="relative h-80 overflow-hidden bg-gray-100">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Price Drop Badge */}
                  {property.priceDrop > 0 && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg">
                      -{property.priceDrop}%
                    </div>
                  )}

                  {/* Listing Type Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${listingBadge.color} flex items-center gap-1 shadow-sm`}>
                      <ListingIcon className="w-3 h-3" />
                      {listingBadge.text}
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {durationText && (
                    <div className="absolute top-12 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                      {durationText}
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className={`absolute top-20 right-3 px-3 py-1 text-xs font-medium rounded-full shadow-sm ${property.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {property.isAvailable ? 'Available Now' : 'Currently Booked'}
                  </div>

                  {/* Action Buttons Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full flex gap-2">
                      <Button
                        size="sm"
                        className="bg-white hover:bg-gray-100 shadow-md text-red-600 rounded-[5px]"
                        onClick={() => handleRemoveFavorite(property.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                        {property.title}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 truncate">{property.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
                      <Home className={`w-4 h-4 ${getPropertyTypeColor(property.propertyType)}`} />
                      <span>{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</span>
                    </div>
                  </div>

                  {/* Rating and Basic Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 font-medium">{property.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{property.beds}</span>
                        <span>Beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{property.baths}</span>
                        <span>Baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{property.sqft.toLocaleString()}</span>
                        <span>Sq. Ft.</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xl text-gray-900">
                        {formatCurrency(property.price)}
                      </span>
                      <span className="text-sm font-normal text-gray-500">
                        {getPriceLabel(property.priceType, property.listingType)}
                      </span>
                      {property.priceDrop > 0 && (
                        <span className="text-sm font-medium text-red-600 ml-2">
                          Save {property.priceDrop}%
                        </span>
                      )}
                    </div>
                    {property.priceDrop > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        Original: {formatCurrency(property.price * 100 / (100 - property.priceDrop))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={getPropertyUrl(property.propertyId, property.title)}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer rounded-[5px] border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
  
                  </div>
                </div>

                {/* Saved Date */}
                <div className="absolute top-44 left-4 bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                  <Heart className="w-3 h-3 inline mr-1 text-pink-400" />
                  Saved {new Date(property.savedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Footer */}
      {filteredFavorites.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Summary:</span>{" "}
              {filteredFavorites.length} properties •
              {filteredFavorites.filter(p => p.priceDrop > 0).length} with price drops •
              {filteredFavorites.filter(p => p.isAvailable).length} available
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-600">Short Stay</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-gray-600">Long Rent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-gray-600">For Sale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}