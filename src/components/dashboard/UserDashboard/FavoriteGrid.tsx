// components/dashboard/UserDashboard/FavoriteGrid.tsx
"use client";

import { Heart, MapPin, Star, Eye, MessageSquare, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

const favorites = [
  {
    id: "FAV001",
    title: "Seaside Luxury Villa",
    location: "Goa, India",
    price: 45000,
    priceType: "per_night",
    rating: 4.8,
    reviews: 124,
    type: "villa",
    amenities: ["Pool", "Beach View", "4 Beds", "WiFi"],
    image: "/api/placeholder/300/200",
    savedDate: "2024-01-02",
    priceDrop: 10,
    isAvailable: true,
    isAvailableSoon: false,
  },
  {
    id: "FAV002",
    title: "Modern Studio Apartment",
    location: "Bangalore, India",
    price: 25000,
    priceType: "per_month",
    rating: 4.5,
    reviews: 89,
    type: "apartment",
    amenities: ["Fully Furnished", "Gym", "Security", "Parking"],
    image: "/api/placeholder/300/200",
    savedDate: "2024-01-01",
    priceDrop: 0,
    isAvailable: true,
    isAvailableSoon: false,
  },
  {
    id: "FAV003",
    title: "Mountain View Cottage",
    location: "Shimla, Himachal Pradesh",
    price: 18000,
    priceType: "per_night",
    rating: 4.9,
    reviews: 67,
    type: "cottage",
    amenities: ["Fireplace", "Mountain View", "2 Beds", "Kitchen"],
    image: "/api/placeholder/300/200",
    savedDate: "2023-12-28",
    priceDrop: 15,
    isAvailable: false,
    isAvailableSoon: true,
  },
  {
    id: "FAV004",
    title: "Urban Penthouse",
    location: "Mumbai, India",
    price: 85000000,
    priceType: "purchase",
    rating: 4.7,
    reviews: 45,
    type: "penthouse",
    amenities: ["Pool", "Gym", "3 Beds", "City View"],
    image: "/api/placeholder/300/200",
    savedDate: "2023-12-25",
    priceDrop: 5,
    isAvailable: true,
    isAvailableSoon: false,
  },
  {
    id: "FAV005",
    title: "Beachfront Bungalow",
    location: "Kerala, India",
    price: 32000,
    priceType: "per_night",
    rating: 4.6,
    reviews: 92,
    type: "bungalow",
    amenities: ["Private Beach", "Garden", "3 Beds", "Chef"],
    image: "/api/placeholder/300/200",
    savedDate: "2023-12-20",
    priceDrop: 20,
    isAvailable: false,
    isAvailableSoon: false,
  },
  {
    id: "FAV006",
    title: "City Center Loft",
    location: "Delhi, India",
    price: 28000,
    priceType: "per_month",
    rating: 4.4,
    reviews: 76,
    type: "loft",
    amenities: ["Modern Design", "City View", "1 Bed", "Workspace"],
    image: "/api/placeholder/300/200",
    savedDate: "2023-12-15",
    priceDrop: 8,
    isAvailable: true,
    isAvailableSoon: false,
  },
];

export default function FavoriteGrid() {
  const [favoriteItems, setFavoriteItems] = useState(favorites);
  const [sortBy, setSortBy] = useState("recent");

  const handleRemoveFavorite = (id: string) => {
    setFavoriteItems(favoriteItems.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      setFavoriteItems([]);
    }
  };

  const sortedFavorites = [...favoriteItems].sort((a, b) => {
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          Showing {sortedFavorites.length} properties • {availableCount} available • {priceDropCount} with price drops
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="border rounded-lg px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently Added</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
          <Button variant="outline" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFavorites.map((property) => (
          <div
            key={property.id}
            className="group relative overflow-hidden rounded-xl border hover:shadow-lg transition-all duration-300"
          >
            {/* Property Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-green-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-pink-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">Property Image</p>
                </div>
              </div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 space-y-2">
                {property.priceDrop > 0 && (
                  <div className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                    -{property.priceDrop}%
                  </div>
                )}
                {!property.isAvailable && property.isAvailableSoon && (
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    Available Soon
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="absolute top-3 right-3 space-y-2">
                <button
                  onClick={() => handleRemoveFavorite(property.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              {/* Availability Badge */}
              <div className={`absolute bottom-3 right-3 px-3 py-1 text-sm font-medium rounded-full ${
                property.isAvailable 
                  ? 'bg-green-100 text-green-800' 
                  : property.isAvailableSoon
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {property.isAvailable ? 'Available' : property.isAvailableSoon ? 'Soon' : 'Booked'}
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {property.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{property.location}</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                  {property.type}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium">{property.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2 mb-4">
                {property.amenities.slice(0, 2).map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{property.amenities.length - 2} more
                  </span>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="font-bold text-xl text-gray-900">
                    {formatCurrency(property.price)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      /{property.priceType.split("_")[1]}
                    </span>
                  </div>
                  {property.priceDrop > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(property.price * 100 / (100 - property.priceDrop))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/properties/${property.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Inquire
                  </Button>
                </div>
              </div>
            </div>

            {/* Saved Date */}
            <div className="absolute top-44 right-4 bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
              Saved {new Date(property.savedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedFavorites.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite properties</h3>
          <p className="text-gray-500 mb-6">Properties you save will appear here</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/properties">Browse Properties</Link>
          </Button>
        </div>
      )}

      {/* Price Alert Section */}
      {priceDropCount > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Price Alert!</h4>
          </div>
          <p className="text-gray-600">
            {priceDropCount} of your saved properties have price drops. 
            Great time to book!
          </p>
          <Button variant="outline" className="mt-4">
            View All Price Drops
          </Button>
        </div>
      )}
    </div>
  );
}