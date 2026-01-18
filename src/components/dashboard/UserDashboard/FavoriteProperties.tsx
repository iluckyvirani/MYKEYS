// components/dashboard/UserDashboard/FavoriteProperties.tsx
"use client";

import { Heart, MapPin, Star, Eye, MessageSquare, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

const mockFavorites = [
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
    priceDrop: 10, // percentage
    isAvailable: true,
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
  },
];

const getPropertyTypeColor = (type: string) => {
  switch (type) {
    case "villa":
      return "bg-purple-100 text-purple-800";
    case "apartment":
      return "bg-blue-100 text-blue-800";
    case "cottage":
      return "bg-green-100 text-green-800";
    case "penthouse":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function FavoriteProperties() {
  const [favorites, setFavorites] = useState(mockFavorites);

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const getPriceLabel = (priceType: string) => {
    switch (priceType) {
      case "per_night":
        return "/night";
      case "per_month":
        return "/month";
      case "purchase":
        return "total";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Favorite Properties</h3>
          <p className="text-sm text-gray-500 mt-1">
            {favorites.length} saved properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share List
          </Button>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favorites.map((property) => (
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
              
              {/* Price Drop Badge */}
              {property.priceDrop > 0 && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                  -{property.priceDrop}%
                </div>
              )}
              
              {/* Availability Badge */}
              <div className={`absolute top-3 right-3 px-3 py-1 text-sm font-medium rounded-full ${property.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {property.isAvailable ? 'Available' : 'Booked'}
              </div>

              {/* Action Buttons Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <Button size="sm" className="bg-white hover:bg-gray-100 shadow-md">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-white hover:bg-gray-100 shadow-md">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-white hover:bg-gray-100 shadow-md text-red-600"
                  onClick={() => handleRemoveFavorite(property.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Property Details */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {property.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{property.location}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPropertyTypeColor(property.type)}`}>
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
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <div className="font-bold text-xl text-gray-900">
                    {formatCurrency(property.price)}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {getPriceLabel(property.priceType)}
                    </span>
                  </div>
                  {property.priceDrop > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(property.price * 100 / (100 - property.priceDrop))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Inquire Now
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
      {favorites.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No favorite properties yet</h4>
          <p className="text-gray-500 mb-6">Start exploring properties and save your favorites here</p>
          <Button className="bg-green-600 hover:bg-green-700">
            Browse Properties
          </Button>
        </div>
      )}

      {/* Stats Footer */}
      {favorites.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">Price alerts:</span>{" "}
              {favorites.filter(p => p.priceDrop > 0).length} properties have price drops
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Availability:</span>{" "}
              {favorites.filter(p => p.isAvailable).length} available now
            </div>
          </div>
        </div>
      )}
    </div>
  );
}