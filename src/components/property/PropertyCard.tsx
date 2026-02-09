"use client";

import { Heart, Star, BedDouble, Bath, Maximize, MapPin, ChevronRight, Home, Moon, Calendar } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// In PropertyCard.tsx, update the interface to include the new properties:
export interface PropertyCardProps {
  id?: number;
  imageUrl: string;
  title: string;
  slug: string;
  address: string;
  price: string;
  propertyPrice: string;
  rating: number;
  reviews: number;
  sqft: number;
  beds: number;
  baths: number;
  propertyType: string;
  isFeatured?: boolean;
  isNew?: boolean;
  // NEW: Business model specific props
  rentalType?: "short" | "long";
  listingType?: "buy" | "rent";
  priceType?: "nightly" | "monthly" | "total";
  minStay?: number;
  minTerm?: number;
}

export default function PropertyCard({
  id,
  imageUrl,
  title,
  slug,
  address,
  price,
  propertyPrice,
  rentalType,
  listingType,
  priceType,
  rating,
  reviews,
  sqft,
  beds,
  baths,
  propertyType,
  isFeatured,
  isNew,
  minStay,
  minTerm,
}: PropertyCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoadingFavorite(true);
    try {
      const response = await api.post("/favorites/toggle", {
        propertyId: id
      });

      if (response.data?.success) {
        const action = response.data.data?.action;
        setIsLiked(action === "added");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/property/${id}`);
  };

  


  // Function to generate proper slug/URL
  const getPropertySlug = () => {
    return `/property/${id}`;
  };

  const propertyUrl = getPropertySlug();


  // Determine price suffix based on business model
  const getPriceSuffix = () => {
    if (listingType === "buy") return "total";
    if (priceType === "nightly") return "night";
    if (priceType === "monthly") return "month";
    return "";
  };

  // Determine badge color based on rental type
  const getRentalTypeBadge = () => {
    if (listingType === "buy") return { text: "For Sale", color: "from-purple-500 to-purple-600" };
    if (rentalType === "short") return { text: "Short Rent", color: "from-blue-500 to-cyan-600" };
    if (rentalType === "long") return { text: "Long Rent", color: "from-orange-500 to-orange-600" };
    return { text: "For Rent", color: "from-green-500 to-emerald-600" };
  };

  // Get duration text
  const getDurationText = () => {
    if (listingType === "buy") return "";
    if (rentalType === "short") return `Min ${minStay} night${minStay && minStay > 1 ? 's' : ''}`;
    if (rentalType === "long") return `Min ${minTerm} month${minTerm && minTerm > 1 ? 's' : ''}`;
    return "";
  };

  const rentalBadge = getRentalTypeBadge();
  const durationText = getDurationText();

  return (
    // <Link href={propertyUrl} className="block">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="group bg-white rounded-[5px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
      >
        {/* Property Image */}
        <div className="relative overflow-hidden">
          <div className="h-64 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Badges - Left Side */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {/* Rental Type Badge */}
            <span className={`bg-linear-to-r ${rentalBadge.color} text-white text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1`}>
              {rentalType === "short" && <Moon className="w-3 h-3" />}
              {rentalType === "long" && <Calendar className="w-3 h-3" />}
              {listingType === "buy" && <Home className="w-3 h-3" />}
              {rentalBadge.text}
            </span>

            {/* Duration Badge if applicable */}
            {durationText && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full">
                {durationText}
              </span>
            )}

            {/* Featured/New Badges */}
            {isFeatured && (
              <span className="bg-linear-to-r from-amber-500 to-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                Featured
              </span>
            )}
            {isNew && (
              <span className="bg-linear-to-r from-green-500 to-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                New
              </span>
            )}
          </div>

          {/* Property Type - Top Right */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
            <Home className="w-3 h-3" />
            {propertyType}
          </div>

          {/* Like Button */}
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="absolute z-10 bg-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 pointer-events-auto hover:scale-110"
            style={{ top: '5rem', right: '1rem' }}
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            />
          </button>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <h3 className="text-2xl font-bold text-gray-900 font-spartan">{listingType === "buy" ? propertyPrice : price}
                <span className="text-sm font-normal text-gray-500">/{getPriceSuffix()}</span>
              </h3>
            </div>

            {/* Rating */}
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{rating}</span>
                <span className="text-xs text-gray-500">({reviews})</span>
              </div>
            </div>
          </div>

          {/* Title & Address */}
          <h4 className="font-spartan text-xl font-semibold text-gray-900 mb-2">{title}</h4>
          <div className="flex items-center gap-1.5 text-gray-600 mb-5">
            <MapPin className="w-4 h-4" />
            <p className="text-sm">{address}</p>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-700 mb-1">
                <Maximize className="w-4 h-4 text-green-600" />
                <span className="font-medium">{sqft.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">Square Ft</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-700 mb-1">
                <BedDouble className="w-4 h-4 text-green-600" />
                <span className="font-medium">{beds}</span>
              </div>
              <p className="text-xs text-gray-500">Bedrooms</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-gray-700 mb-1">
                <Bath className="w-4 h-4 text-green-600" />
                <span className="font-medium">{baths}</span>
              </div>
              <p className="text-xs text-gray-500">Bathrooms</p>
            </div>
          </div>

          {/* CTA Button - Different based on business model */}
          <button
            onClick={handleViewDetails}
            className="w-full mt-6 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 group-hover:text-white border border-green-200 group-hover:border-transparent group-hover:from-green-600 group-hover:to-emerald-600 font-medium py-3 rounded-[5px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
          >
            View Details
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    // </Link>
  );
}