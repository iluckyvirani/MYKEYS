// components/dashboard/UserDashboard/FavoriteGrid.tsx
"use client";

import { Heart, MapPin, Star, Eye, Trash2, Home, Building2, TrendingUp, Calendar, Hotel, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { FavoriteWithProperty } from "@/types/favorite";

interface FavoriteGridStats {
  totalSaved: number;
  availableNow: number;
}

interface FavoriteGridProps {
  onStatsChange?: (stats: FavoriteGridStats) => void;
  searchQuery?: string;
  filter?: string;
  sortBy?: string;
}

export default function FavoriteGrid({ onStatsChange, searchQuery = '', filter = 'all', sortBy = 'recent' }: FavoriteGridProps) {
  const [favoriteItems, setFavoriteItems] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ pageSize: '20' });
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (filter && filter !== 'all') params.append('propertyType', filter);
        if (sortBy && sortBy !== 'recent') params.append('sortBy', sortBy);

        const response = await api.get(`/favorites?${params.toString()}`);

        if (response.data?.success && response.data.data?.items) {
          setFavoriteItems(response.data.data.items);
          setError(null);
        } else {
          setError("Failed to load favorites");
        }
      } catch (err: any) {
        console.error("Error fetching favorites:", err);
        setError(err.message || "Failed to fetch favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [searchQuery, filter, sortBy]);

  const getListingTypeBadge = (listingType: string, rentalType?: string | null) => {
    if (listingType === "buy") {
      return {
        text: "For Sale",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: TrendingUp,
      };
    }
    if (rentalType === "short" || rentalType === "SHORT_TERM") {
      return {
        text: "Short Stay",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Hotel,
      };
    }
    if (rentalType === "long" || rentalType === "LONG_TERM") {
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

  const getPropertyUrl = (propertyId: string, title: string) => {
    return `/property/${propertyId}`;
  };

  const getDurationText = (property: FavoriteWithProperty["property"]) => {
    if (property.listingType === "BUY") return "";
    if (property.rentalType === "SHORT_TERM") return `Min ${property.minStay} night${property.minStay > 1 ? 's' : ''}`;
    if (property.rentalType === "LONG_TERM") return `Min ${property.minStay} month${property.minStay > 1 ? 's' : ''}`;
    return "";
  };

  const getPriceLabel = (priceType: string, listingType: string) => {
    if (listingType === "BUY") return "total";
    if (priceType === "NIGHTLY") return "/night";
    if (priceType === "MONTHLY") return "/month";
    return "";
  };

  const handleRemoveFavorite = async (favoriteId: string, propertyId: string) => {
    try {
      const response = await api.delete("/favorites/remove", {
        data: { propertyId }
      });

      if (response.data?.success) {
        setFavoriteItems(favoriteItems.filter(item => item.id !== favoriteId));
      }
    } catch (error: any) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to remove all favorite properties?")) {
      try {
        // Remove each favorite
        for (const item of favoriteItems) {
          await api.delete("/favorites/remove", {
            data: { propertyId: item.propertyId }
          });
        }
        setFavoriteItems([]);
      } catch (error: any) {
        console.error("Error clearing favorites:", error);
        alert("Failed to clear favorites");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sort: rating-based is client-side since it's a computed field
  const sortedFavorites = sortBy === "rating"
    ? [...favoriteItems].sort((a, b) => {
        const ratingA = a.property.reviews?.length > 0
          ? a.property.reviews.reduce((sum, r) => sum + r.rating, 0) / a.property.reviews.length : 0;
        const ratingB = b.property.reviews?.length > 0
          ? b.property.reviews.reduce((sum, r) => sum + r.rating, 0) / b.property.reviews.length : 0;
        return ratingB - ratingA;
      })
    : favoriteItems;

  const shortStayCount = favoriteItems.filter(f => f.property.rentalType === "SHORT_TERM").length;
  const longRentCount = favoriteItems.filter(f => f.property.rentalType === "LONG_TERM").length;
  const buyCount = favoriteItems.filter(f => f.property.listingType === "BUY").length;
  const availableNowCount = favoriteItems.filter(
    (f) => (f.property.status || "").toLowerCase() === "available"
  ).length;

  useEffect(() => {
    if (!onStatsChange) return;
    onStatsChange({
      totalSaved: favoriteItems.length,
      availableNow: availableNowCount,
    });
  }, [favoriteItems.length, availableNowCount, onStatsChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your favorite properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-[5px] border border-red-200">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading favorites</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clear All */}
      {favoriteItems.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="border-red-300 text-red-600 hover:bg-red-50 rounded-[5px]"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFavorites.map((item) => {
          const property = item.property;
          const listingBadge = getListingTypeBadge(property.listingType, property.rentalType);
          const ListingIcon = listingBadge.icon;
          const durationText = getDurationText(property);
          
          const avgRating = property.reviews?.length > 0 
            ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length 
            : 0;
          const reviewCount = property.reviews?.length || 0;

          return (
            <div
              key={item.id}
              className="group relative bg-white rounded-[5px] border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Property Image */}
              <div className="relative h-50 overflow-hidden bg-gray-100">
                <img
                  src={property.images?.[0]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070"}
                  alt={property.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-500 w-full h-full"
                />

                {/* Badges Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Right Actions */}
                <div className="absolute top-3 right-3 space-y-2">
                  <button
                    onClick={() => handleRemoveFavorite(item.id, property.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                {/* Top Left Badges */}
                <div className="absolute top-3 left-3 space-y-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border shadow-sm ${listingBadge.color}`}>
                    <ListingIcon className="w-3 h-3 inline mr-1" />
                    {listingBadge.text}
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-7 left-3 right-3">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1 bg-green-100/90 text-green-800 text-xs font-medium rounded-full backdrop-blur-sm">
                      Available
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
                      <span className="text-sm text-gray-600 truncate">
                        {property.city}, {property.state}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
                    <Home className="w-4 h-4" />
                    <span>{property.propertyType}</span>
                  </div>
                </div>

                {/* Rating and Basic Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{property.bedrooms}</span>
                      <span>Beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{property.bathrooms}</span>
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
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={getPropertyUrl(property.id, property.title)}
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

                  {property.listingType === "RENT" && property.rentalType === "SHORT_TERM" ? (
                    <Button
                      size="sm"
                      className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-[5px] text-white cursor-pointer"
                      asChild
                    >
                      <Link href={getPropertyUrl(property.id, property.title)}>
                        Book Now
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-[5px] text-white cursor-pointer"
                      asChild
                    >
                      <Link href={getPropertyUrl(property.id, property.title)}>
                        Inquire
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Saved Date */}
              <div className="absolute top-46 left-4 bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                <Heart className="w-3 h-3 inline mr-1 text-pink-400" />
                Saved {new Date(item.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
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
            Save properties you're interested in by clicking the heart icon on property listings. They'll appear here for easy access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3"
            >
              <Link href="/rent/short-rent">
                <Hotel className="w-5 h-5 mr-2" />
                Browse Short Stays
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="px-8 py-3"
            >
              <Link href="/rent/whole-property">
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

      {/* Summary Footer */}
      {sortedFavorites.length > 0 && (
        <div className="bg-gray-50 rounded-[5px] p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sortedFavorites.length}</div>
              <div className="text-sm text-gray-600">Properties Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{shortStayCount}</div>
              <div className="text-sm text-gray-600">Short Stay Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{longRentCount}</div>
              <div className="text-sm text-gray-600">Long Rent Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{buyCount}</div>
              <div className="text-sm text-gray-600">Properties for Sale</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}