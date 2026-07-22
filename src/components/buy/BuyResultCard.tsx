"use client";

import Link from "next/link";
import {
  BedDouble,
  Bath,
  Heart,
  Mail,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface BuyResultCardProperty {
  id: string | number;
  title: string;
  address: string;
  price: string;
  propertyPrice: string;
  beds: number;
  baths: number;
  propertyType: string;
  imageUrl: string;
  images?: string[];
  description?: string;
  isFeatured?: boolean;
  imageCount?: number;
  /* static fallbacks — to be made dynamic in future APIs */
  reducedDate?: string;
  agentName?: string;
  agentPhone?: string;
  agentLogoUrl?: string;
}

/** Custom Floorplan SVG Icon matching Rightmove */
function FloorplanIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
      <path d="M15 9v12" />
    </svg>
  );
}

export default function BuyResultCard({
  property,
}: {
  property: BuyResultCardProperty;
}) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const rawImages = property.images?.length
    ? property.images
    : [property.imageUrl, property.imageUrl, property.imageUrl];

  const images = rawImages.filter(Boolean);
  const displayPrice = property.propertyPrice || property.price;
  const isFeatured = !!property.isFeatured;

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem("accessToken")) {
      router.push("/login");
      return;
    }
    try {
      const res = await api.post("/favorites/toggle", {
        propertyId: property.id,
      });
      if (res.data?.success) {
        setIsLiked(res.data.data?.action === "added");
      }
    } catch {
      /* ignore */
    }
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <article className="bg-white rounded-[4px] border border-gray-300 shadow-sm overflow-hidden mb-5 group">
      {/* ── Top Header Strip (Only for FEATURED PROPERTY) ── */}
      {isFeatured && (
        <div className="bg-[#339390] text-white text-xs font-semibold px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* STATIC FALLBACK: floorplan badge icon */}
            <span
              className="inline-flex items-center gap-1 opacity-90 cursor-pointer hover:opacity-100"
              title="Floorplan"
            >
              <FloorplanIcon />
            </span>
            <span className="text-white/40">|</span>
            <span className="inline-flex items-center gap-1.5 text-[12px]">
              <Camera className="w-4 h-4" />
              {currentImgIdx + 1}/{Math.max(property.imageCount || images.length, 1)}
            </span>
          </div>

          <span className="font-bold text-[12px] tracking-wider uppercase">
            FEATURED PROPERTY
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* ── Left Column: Image Grid & Price Bar (~58% Width) ── */}
        <div className="relative lg:w-[58%] flex flex-col bg-gray-900">
          <Link
            href={`/property/${property.id}`}
            className="relative flex-1 min-h-[240px] lg:min-h-[260px] overflow-hidden block"
          >
            {/* Standard Non-Featured: Camera Pill Badge on Top Left of main image */}
            {!isFeatured && (
              <div className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 z-20 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                {currentImgIdx + 1}/{Math.max(property.imageCount || images.length, 1)}
              </div>
            )}

            {/* Split layout: Large main image on left, 2 stacked images on right */}
            <div className="grid grid-cols-3 h-full min-h-[240px] lg:min-h-[260px]">
              <div className="col-span-2 relative border-r border-white/80">
                <img
                  src={images[currentImgIdx] || images[0]}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Left chevron navigation arrow */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevImg}
                    aria-label="Previous Image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-white/90 hover:text-white bg-black/25 hover:bg-black/50 rounded-full transition-all cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </button>
                )}
              </div>

              <div className="col-span-1 flex flex-col h-full">
                <div className="relative flex-1 border-b border-white/80">
                  <img
                    src={images[(currentImgIdx + 1) % images.length] || images[0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="relative flex-1">
                  <img
                    src={images[(currentImgIdx + 2) % images.length] || images[0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right chevron navigation arrow on main image right edge */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImg}
                aria-label="Next Image"
                className="absolute right-[35%] top-1/2 -translate-y-1/2 p-1 text-white/90 hover:text-white bg-black/25 hover:bg-black/50 rounded-full transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            )}
          </Link>

          {/* Price Bar across full bottom of image section */}
          <div
            className={`px-4 py-2 flex items-center justify-between shrink-0 ${
              isFeatured
                ? "bg-[#339390] text-white"
                : "bg-[#f4f5f7] text-slate-900 border-t border-gray-200"
            }`}
          >
            <span
              className={`tracking-tight leading-none ${
                isFeatured
                  ? "text-[22px] font-extrabold"
                  : "text-[20px] font-bold text-slate-900"
              }`}
            >
              {displayPrice}
            </span>
          </div>
        </div>

        {/* ── Right Column: Property Info Details (~42% Width) ── */}
        <div className="flex-1 p-4 lg:p-5 flex flex-col justify-between bg-white min-w-0 relative">
          {/* Top-Right Dismiss X Icon for Standard Card */}
          {!isFeatured && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss property"
              className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer p-1 transition-colors"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          )}

          <div>
            {/* Title / Address */}
            <Link href={`/property/${property.id}`}>
              <h2 className="text-[17px] font-bold text-slate-900 hover:text-green-700 transition-colors line-clamp-1 leading-snug pr-6">
                {property.address || property.title}
              </h2>
            </Link>

            {/* Specs row: Property Type | Beds | Baths */}
            <div className="mt-2 flex items-center gap-4 text-[14px] text-slate-900">
              <span className="font-semibold capitalize">
                {property.propertyType?.toLowerCase().replace("_", " ")}
              </span>
              {property.beds > 0 && (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <BedDouble className="w-4 h-4 stroke-[2]" />
                  {property.beds}
                </span>
              )}
              {property.baths > 0 && (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Bath className="w-4 h-4 stroke-[2]" />
                  {property.baths}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-3 text-[13.5px] text-[#334155] leading-relaxed line-clamp-3 font-normal">
              {property.description ||
                `An exceptional prime property opportunity in the heart of ${property.address || "London"}.`}
            </p>
          </div>

          {/* Bottom Area */}
          <div className="mt-5 pt-3 flex flex-col gap-3 border-t border-gray-100">
            {/* Listing Notice */}
            <p className="text-[12.5px] text-gray-600 font-normal line-clamp-1">
              {isFeatured ? (
                <>
                  {property.reducedDate || "Reduced on 09/05/2026"} by{" "}
                  <span className="font-semibold text-gray-700">
                    {property.agentName || "JTM Homes, North London"}
                  </span>
                </>
              ) : (
                <>
                  Marketed by{" "}
                  <span className="font-semibold text-gray-700">
                    {property.agentName || "Savills, Margaret Street- Development"}
                  </span>
                </>
              )}
            </p>

            {/* Agent Footer Bar & Actions */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {/* Agent Logo & Phone Number */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-[2px] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ${
                    isFeatured
                      ? "bg-slate-900 text-white"
                      : "bg-[#ffd600] text-black"
                  }`}
                >
                  {property.agentLogoUrl ? (
                    <img
                      src={property.agentLogoUrl}
                      alt="Agent Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : isFeatured ? (
                    <span className="text-[10px] text-cyan-300 font-extrabold tracking-tighter">
                      jtm
                    </span>
                  ) : (
                    <span className="text-[10px] text-black font-extrabold tracking-tight">
                      savills
                    </span>
                  )}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[14px] font-bold text-slate-900">
                    {property.agentPhone || (isFeatured ? "020 3907 2747" : "020 3909 7811")}
                  </span>
                  <span className="text-[11px] text-gray-500 font-normal">
                    Local call rate
                  </span>
                </div>
              </div>

              {/* Action Buttons: Contact & Save */}
              <div className="flex items-center gap-4">
                <Link
                  href={`/property/${property.id}`}
                  className="inline-flex items-center gap-1.5 text-[14px] font-bold text-slate-900 hover:text-green-700 transition-colors"
                >
                  <Mail className="w-5 h-5 stroke-[1.8]" />
                  {!isFeatured && <span>Contact</span>}
                </Link>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  className="inline-flex items-center gap-1.5 text-[14px] font-bold text-slate-900 hover:text-green-700 cursor-pointer transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 stroke-[2] ${
                      isLiked ? "fill-red-500 text-red-500" : "text-slate-900"
                    }`}
                  />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}


