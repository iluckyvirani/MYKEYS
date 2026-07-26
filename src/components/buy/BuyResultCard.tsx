"use client";

import Link from "next/link";
import { BedDouble, Bath, Heart, Mail, Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface BuyResultCardProperty {
  id: string | number;
  title: string;
  address: string;
  price: string;
  propertyPrice: string;
  priceSecondary?: string;
  beds: number;
  baths: number;
  propertyType: string;
  imageUrl: string;
  images?: string[];
  description?: string;
  isFeatured?: boolean;
  imageCount?: number;
  listingActivity?: string;
  isNewHome?: boolean;
  createdAt?: string;
  /** e.g. "Room to rent" for long-let room listings */
  occupancyLabel?: string;
  agentName?: string;
  agentPhone?: string;
  agentLogoUrl?: string;
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

  useEffect(() => {
    const propertyId = property.id;
    if (!propertyId) return;
    if (typeof window !== "undefined" && !localStorage.getItem("accessToken")) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await api.get(`/favorites/check/${propertyId}`);
        if (!cancelled && response.data?.success && response.data.data) {
          setIsLiked(!!response.data.data.isFavorite);
        }
      } catch {
        if (!cancelled) setIsLiked(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [property.id]);

  if (isDismissed) return null;

  const detailsHref = `/property/${property.id}`;

  const goToDetails = () => {
    router.push(detailsHref);
  };

  const rawImages = property.images?.length
    ? property.images
    : [property.imageUrl].filter(Boolean);

  const images = rawImages.filter(Boolean);
  const displayPrice = property.propertyPrice || property.price;
  const isFeatured = !!property.isFeatured;
  const imageTotal = Math.max(property.imageCount || images.length, 1);

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

  const agentInitials = (property.agentName || "PO")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetails();
        }
      }}
      className="bg-white rounded-[4px] border border-gray-300 shadow-sm overflow-hidden mb-5 group cursor-pointer hover:border-gray-400 transition-colors"
    >
      {isFeatured && (
        <div className="bg-[#339390] text-white text-xs font-semibold px-3 py-1.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[12px]">
            <Camera className="w-4 h-4" />
            {currentImgIdx + 1}/{imageTotal}
          </span>
          <span className="font-bold text-[12px] tracking-wider uppercase">
            FEATURED PROPERTY
          </span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        <div className="relative lg:w-[58%] flex flex-col bg-gray-900">
          <div className="relative flex-1 min-h-[240px] lg:min-h-[260px] overflow-hidden">
            {!isFeatured && (
              <div className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[12px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 z-20 shadow-sm pointer-events-none">
                <Camera className="w-3.5 h-3.5" />
                {currentImgIdx + 1}/{imageTotal}
              </div>
            )}

            <div className="grid grid-cols-3 h-full min-h-[240px] lg:min-h-[260px]">
              <div className="col-span-2 relative border-r border-white/80">
                <img
                  src={images[currentImgIdx] || images[0] || "/api/placeholder/800/600"}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
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
                    src={images[(currentImgIdx + 1) % Math.max(images.length, 1)] || images[0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="relative flex-1">
                  <img
                    src={images[(currentImgIdx + 2) % Math.max(images.length, 1)] || images[0]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

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
          </div>

          <div
            className={`px-4 py-2 flex flex-col justify-center shrink-0 ${
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
            {property.priceSecondary && (
              <span
                className={`text-[12px] mt-0.5 ${
                  isFeatured ? "text-white/85" : "text-slate-500"
                }`}
              >
                {property.priceSecondary}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-5 flex flex-col justify-between bg-white min-w-0 relative">
          {!isFeatured && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              aria-label="Dismiss property"
              className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer p-1 transition-colors z-10"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          )}

          <div>
            <h2 className="text-[17px] font-bold text-slate-900 group-hover:text-green-700 transition-colors line-clamp-1 leading-snug pr-6">
              {property.address || property.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-slate-900">
              {property.occupancyLabel && (
                <span className="font-semibold text-[#339390]">
                  {property.occupancyLabel}
                </span>
              )}
              <span className="font-semibold capitalize">
                {property.propertyType?.toLowerCase().replace(/_/g, " ")}
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

            <p className="mt-3 text-[13.5px] text-[#334155] leading-relaxed line-clamp-3 font-normal">
              {property.description ||
                `An exceptional prime property opportunity in the heart of ${property.address || "London"}.`}
            </p>

            {property.isNewHome && (
              <span className="inline-block mt-3 text-[11px] font-extrabold tracking-wide uppercase text-white bg-[#00a86b] px-2.5 py-1 rounded-sm">
                New home
              </span>
            )}
          </div>

          <div className="mt-5 pt-3 flex flex-col gap-3 border-t border-gray-100">
            {(property.listingActivity || property.agentName) && (
              <p className="text-[12.5px] text-[#00a86b] font-medium line-clamp-1">
                {property.listingActivity || "Added"}
                {property.agentName ? ` by ${property.agentName}` : ""}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-[2px] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden bg-slate-900 text-white border border-gray-200">
                  {property.agentLogoUrl ? (
                    <img
                      src={property.agentLogoUrl}
                      alt=""
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : (
                    <span className="text-[10px] font-extrabold tracking-tight">
                      {agentInitials || "PO"}
                    </span>
                  )}
                </div>
                {property.agentPhone ? (
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-[14px] font-bold text-slate-900 truncate">
                      {property.agentPhone}
                    </span>
                    <span className="text-[11px] text-gray-500 font-normal">
                      Local call rate
                    </span>
                  </div>
                ) : (
                  <span className="text-[12px] text-gray-500 truncate">
                    {property.agentName || "Contact via listing"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href={detailsHref}
                  onClick={(e) => e.stopPropagation()}
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
