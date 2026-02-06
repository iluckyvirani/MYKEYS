// components/dashboard/UserDashboard/FavoriteProperties.tsx
"use client";

import { Heart, MapPin, Star, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { FavoriteWithProperty } from "@/types/favorite";

const getListingTypeBadge = (listingType: string, rentalType?: string | null) => {
  if (listingType === "BUY") {
    return { text: "For Sale", color: "bg-purple-100 text-purple-800" };
  }
  if (rentalType === "SHORT_TERM") {
    return { text: "Short Stay", color: "bg-green-100 text-green-800" };
  }
  if (rentalType === "LONG_TERM") {
    return { text: "Long Rent", color: "bg-blue-100 text-blue-800" };
  }
  return { text: "Rental", color: "bg-gray-100 text-gray-800" };
};

export default function FavoriteProperties() {
  const [favorites, setFavorites] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await api.get("/favorites?pageSize=10");

        if (response.data?.success && response.data.data?.items) {
          const topFavorites = response.data.data.items.slice(0, 4);
          setFavorites(topFavorites);
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const filteredFavorites = favorites.filter((item) => {
    const property = item.property;
    if (filter === "all") return true;
    if (filter === "short") return property.rentalType === "SHORT_TERM";
    if (filter === "long") return property.rentalType === "LONG_TERM";
    if (filter === "buy") return property.listingType === "BUY";
    return true;
  });

  const handleRemoveFavorite = async (favoriteId: string, propertyId: string) => {
    try {
      const response = await api.delete("/favorites/remove", {
        data: { propertyId }
      });
      if (response.data?.success) {
        setFavorites(favorites.filter(item => item.id !== favoriteId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] shadow-sm border p-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Favorite Properties</h3>
            <p className="text-sm text-gray-500">Quick access to saved properties</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Favorite Properties</h3>
          <p className="text-sm text-gray-500 mt-1">{favorites.length} saved properties</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <Button variant="outline" size="sm" className="rounded-[5px] cursor-pointer" asChild>
            <Link href="/user/dashboard/favorites">View All</Link>
          </Button>
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No favorite properties yet</h4>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Save properties you like by clicking the heart icon</p>
          <Button asChild className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/short-rent">Browse Properties</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFavorites.map((item) => {
            const property = item.property;
            const badge = getListingTypeBadge(property.listingType, property.rentalType);
            const avgRating = property.reviews?.length > 0 
              ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length 
              : 0;

            return (
              <div key={item.id} className="rounded-lg border hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {property.images?.[0]?.url ? (
                    <Image
                      src={property.images[0].url}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Home className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(item.id, property.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-red-50"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{property.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{property.city}, {property.state}</span>
                  </div>

                  {avgRating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-sm">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-600">({property.reviews?.length || 0})</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {property.bedrooms}B
                      </div>
                    )}
                    {property.bathrooms && <div>{property.bathrooms}Ba</div>}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-bold text-lg text-gray-900">₹{property.price?.toLocaleString('en-IN')}</span>
                    {property.priceType && (
                      <span className="text-sm text-gray-600">
                        {property.priceType === 'NIGHTLY' && '/ night'}
                        {property.priceType === 'MONTHLY' && '/ month'}
                        {property.priceType === 'TOTAL' && '(Total)'}
                      </span>
                    )}
                  </div>

                  <Button asChild className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Link href={`/property/${property.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
