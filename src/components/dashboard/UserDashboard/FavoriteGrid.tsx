// components/dashboard/UserDashboard/FavoriteGrid.tsx
"use client";

import { Heart, MapPin, Star, Eye, Trash2, Home, Building2, TrendingUp, Calendar, Hotel, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const favorites = [
  {
    id: "FAV001",
    title: "Seaside Luxury Villa",
    address: "Beach Road, Goa, India",
    price: 45000,
    listingType: "rent",
    rentalType: "short",
    priceType: "nightly",
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
  {
    id: "FAV005",
    title: "Beachfront Bungalow",
    address: "Kovalam, Kerala",
    price: 32000,
    listingType: "rent",
    rentalType: "short",
    priceType: "nightly",
    rating: 4.6,
    reviews: 92,
    propertyType: "bungalow",
    beds: 3,
    baths: 2,
    sqft: 1800,
    amenities: ["Private Beach", "Garden", "Chef", "Spa"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
    savedDate: "2023-12-20",
    priceDrop: 20,
    isAvailable: false,
    minStay: 2,
    maxStay: 21,
    propertyId: "PROP005",
  },
  {
    id: "FAV006",
    title: "City Center 3BHK",
    address: "Connaught Place, Delhi",
    price: 55000,
    listingType: "rent",
    rentalType: "long",
    priceType: "monthly",
    rating: 4.4,
    reviews: 76,
    propertyType: "apartment",
    beds: 3,
    baths: 2,
    sqft: 1500,
    amenities: ["City View", "Gym", "Pool", "Parking"],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070",
    savedDate: "2023-12-15",
    priceDrop: 8,
    isAvailable: true,
    minLease: 12,
    maxLease: 36,
    propertyId: "PROP006",
  },
];

const getListingTypeBadge = (listingType: string, rentalType?: string | null) => {
  if (listingType === "buy") {
    return {
      text: "For Sale",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: TrendingUp,
    };
  }
  if (rentalType === "short") {
    return {
      text: "Short Stay",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: Hotel,
    };
  }
  if (rentalType === "long") {
    return {
      text: "Long Term",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Calendar,
    };
  }
  return {
    text: "For Rent",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Home,
  };
};

export default function FavoriteGrid() {
  const [favoriteItems, setFavoriteItems] = useState(favorites);
  const [sortBy, setSortBy] = useState("recent");
  const [filter, setFilter] = useState("all"); // all, short, long, buy, available

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

  const getPriceLabel = (priceType: string, listingType: string) => {
    if (listingType === "buy") return "total";
    if (priceType === "nightly") return "/night";
    if (priceType === "monthly") return "/month";
    return "";
  };

  const handleRemoveFavorite = (id: string) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all favorite properties?")) {
      setFavoriteItems([]);
    }
  };

  // Filter and sort
  const filteredFavorites = favoriteItems.filter(property => {
    if (filter === "all") return true;
    if (filter === "available") return property.isAvailable;
    if (filter === "short") return property.rentalType === "short";
    if (filter === "long") return property.rentalType === "long";
    if (filter === "buy") return property.listingType === "buy";
    if (filter === "price_drop") return property.priceDrop > 0;
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.price - b.price;
      case "price_high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "recent":
      default:
        return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
    }
  });

  const availableCount = favoriteItems.filter(f => f.isAvailable).length;
  const priceDropCount = favoriteItems.filter(f => f.priceDrop > 0).length;
  const shortStayCount = favoriteItems.filter(f => f.rentalType === "short").length;
  const longRentCount = favoriteItems.filter(f => f.rentalType === "long").length;
  const buyCount = favoriteItems.filter(f => f.listingType === "buy").length;

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-[5px] text-sm font-medium border ${filter === "all"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              All Properties
            </button>
            <button
              onClick={() => setFilter("short")}
              className={`px-4 py-2 rounded-[5px] text-sm font-medium border ${filter === "short"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              Short Stay ({shortStayCount})
            </button>
            <button
              onClick={() => setFilter("long")}
              className={`px-4 py-2 rounded-[5px] text-sm font-medium border ${filter === "long"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              Long Rent ({longRentCount})
            </button>
            <button
              onClick={() => setFilter("buy")}
              className={`px-4 py-2 rounded-[5px] text-sm font-medium border ${filter === "buy"
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              For Sale ({buyCount})
            </button>
            <button
              onClick={() => setFilter("price_drop")}
              className={`px-4 py-2 rounded-[5px] text-sm font-medium border ${filter === "price_drop"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
            >
              Price Drops ({priceDropCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Sort by:</span>
          </div>
          <select
            className="border rounded-[5px] px-3 py-2 text-sm bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently Added</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
          {favoriteItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="border-red-300 text-red-600 hover:bg-red-50 rounded-[5px]"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFavorites.map((property) => {
          const listingBadge = getListingTypeBadge(property.listingType, property.rentalType);
          const ListingIcon = listingBadge.icon;
          const durationText = getDurationText(property);

          return (
            <div
              key={property.id}
              className="group relative bg-white rounded-[5px] border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Property Image */}
              <div className="relative h-50 overflow-hidden bg-gray-100">
                <img
                  src={property.image}
                  alt={property.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Right Actions */}
                <div className="absolute top-3 right-3 space-y-2">
                  <button
                    onClick={() => handleRemoveFavorite(property.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Top Left Badges */}
                <div className="absolute top-3 left-3 space-y-2">
                  {property.priceDrop > 0 && (
                    <div className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg">
                      -{property.priceDrop}%
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${listingBadge.color}`}>
                    <ListingIcon className="w-3 h-3 inline mr-1" />
                    {listingBadge.text}
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-7 left-3 right-3">
                  <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${property.isAvailable
                        ? 'bg-green-100/90 text-green-800'
                        : 'bg-red-100/90 text-red-800'
                      }`}>
                      {property.isAvailable ? 'Available Now' : 'Currently Booked'}
                    </div>
                    {durationText && (
                      <div className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                        {durationText}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                      {property.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-600 truncate">{property.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
                    <Home className="w-4 h-4" />
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
                      className="w-full rounded-[5px] border-gray-300 hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>

                  {property.listingType === "rent" && property.rentalType === "short" ? (
                    <Button
                      size="sm"
                      className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-[5px] text-white"
                      onClick={() => alert(`Redirecting to booking for ${property.title}`)}
                    >
                      Book Now
                    </Button>
                  ) : (

                    <Button
                      size="sm"
                      className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-[5px] text-white"
                      onClick={() => alert(`Sending inquiry for ${property.title}`)}
                    >
                      Send Inquiry
                    </Button>
                  )}
                </div>
              </div>

              {/* Saved Date */}
              <div className="absolute top-46 left-4 bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                <Heart className="w-3 h-3 inline mr-1 text-pink-400" />
                Saved {new Date(property.savedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedFavorites.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-[5px] border border-gray-200">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No favorite properties yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            Save properties you're interested in by clicking the heart icon on property listings.
            They'll appear here for easy access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3"
            >
              <Link href="/short-rent">
                <Hotel className="w-5 h-5 mr-2" />
                Browse Short Stays
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="px-8 py-3"
            >
              <Link href="/long-rent">
                <Calendar className="w-5 h-5 mr-2" />
                Browse Long Rentals
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="px-8 py-3"
            >
              <Link href="/buy">
                <TrendingUp className="w-5 h-5 mr-2" />
                Browse Properties for Sale
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stats and Alerts */}
      {priceDropCount > 0 && sortedFavorites.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-[5px] p-6 border border-red-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Price Drop Alert!</h4>
                <p className="text-gray-600">
                  {priceDropCount} of your saved properties have reduced their prices.
                  Great time to book or make an offer!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setFilter("price_drop")}
            >
              View Price Drops
            </Button>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {sortedFavorites.length > 0 && (
        <div className="bg-gray-50 rounded-[5px] p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sortedFavorites.length}</div>
              <div className="text-sm text-gray-600">Properties Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{availableCount}</div>
              <div className="text-sm text-gray-600">Currently Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{priceDropCount}</div>
              <div className="text-sm text-gray-600">With Price Drops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(sortedFavorites.reduce((sum, p) => sum + p.rating, 0) / sortedFavorites.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}