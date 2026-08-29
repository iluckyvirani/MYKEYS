"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Heart,
  Share2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import PropertyShortStayBooking from "@/components/property/PropertyShortStayBooking";
import PropertyListingDetails from "@/components/property/PropertyListingDetails";
import PropertyLocationMap from "@/components/property/PropertyLocationMap";
import {
  formatListingActivity,
  formatListingAgentName,
  resolveListingAgentLogo,
} from "@/lib/listingCard";

// Default property data structure
const emptyPropertyData = {
  id: "",
  title: "",
  address: "",
  city: "",
  state: "",
  description: "",
  listingType: "BUY" as string,
  rentalType: null as string | null,
  occupancyType: null as string | null,
  price: "",
  propertyPrice: "",
  priceLabel: "",
  pricePerNight: 0,
  cleaningFee: 0,
  serviceFee: 0,
  maxGuests: 2,
  minStay: 1,
  maxStay: null as number | null,
  checkInTime: "14:00",
  checkOutTime: "11:00",
  selfCheckIn: false,
  beds: 0,
  baths: 0,
  sqft: 0,
  propertyType: "Property",
  tenure: "",
  councilTaxBand: "",
  parking: false,
  parkingType: null as string | null,
  garden: null as string | null,
  accessibility: null as string | null,
  furnishType: null as string | null,
  availableFrom: null as string | null,
  securityDeposit: null as number | null,
  billsIncluded: null as boolean | null,
  minTerm: null as number | null,
  maxTerm: null as number | null,
  epcRating: null as string | null,
  epcCurrentScore: null as number | null,
  epcPotentialScore: null as number | null,
  keyFeatures: [] as string[],
  utilities: null as Record<string, string> | null,
  broadbandSpeed: null as string | null,
  floodRisk: null as string | null,
  pricePerMonth: undefined as number | undefined,
  listingActivity: "",
  isNewHome: false,
  amenities: [] as string[],
  blockedDateRanges: [] as { checkIn: string; checkOut: string }[],
  images: [] as string[],
  agent: {
    name: "Private Owner",
    address: "",
    phone: "",
    logoUrl: "",
    description: "",
    sellerType: "" as string,
    isAgentLister: false,
  },
  latitude: null as number | null,
  longitude: null as number | null,
};

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<any>(emptyPropertyData);
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsGalleryOpen(false);
      if (e.key === "ArrowLeft") {
        setSelectedImgIdx((prev) => {
          const total = (property.images?.length || 0);
          if (total < 2) return prev;
          return prev === 0 ? total - 1 : prev - 1;
        });
      }
      if (e.key === "ArrowRight") {
        setSelectedImgIdx((prev) => {
          const total = (property.images?.length || 0);
          if (total < 2) return prev;
          return prev === total - 1 ? 0 : prev + 1;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isGalleryOpen, property.images?.length]);

  // Fetch property data from API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const id = params?.id;
        if (!id) return;

        const response = await api.get(`/properties/${id}`);

        if (response.data?.success && response.data.data) {
          const apiData = response.data.data;
          const isShortStay =
            apiData.listingType === "RENT" && apiData.rentalType === "SHORT_TERM";
          const isLongRent =
            apiData.listingType === "RENT" && apiData.rentalType === "LONG_TERM";
          const saleOrRent = apiData.propertyPrice || apiData.price || 0;
          const displayPrice = isShortStay
            ? `£${(apiData.price || 0).toLocaleString()} / night`
            : isLongRent
            ? `£${(apiData.price || 0).toLocaleString()} pcm`
            : `£${saleOrRent.toLocaleString()}`;

          const activity = formatListingActivity({
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt,
            price: saleOrRent,
            originalPrice: apiData.originalPrice,
          });

          const owner = apiData.owner;
          const agentName = formatListingAgentName(owner);
          const agentAddress = [owner?.address, owner?.city]
            .filter(Boolean)
            .join(", ");
          const amenities = (apiData.amenities || [])
            .map((a: any) => a.amenity?.name || a.name)
            .filter(Boolean);

          const isAgentLister = Boolean(
            owner?.isAgentLister || owner?.roles?.includes("AGENT")
          );

          setProperty({
            ...emptyPropertyData,
            id: apiData.id,
            title: apiData.title || apiData.address || "Property",
            address: apiData.address || "",
            city: apiData.city || "",
            state: apiData.zipCode || "",
            description: apiData.description || "",
            listingType: apiData.listingType || "BUY",
            rentalType: apiData.rentalType || null,
            occupancyType: apiData.occupancyType || null,
            price: displayPrice,
            propertyPrice: displayPrice,
            priceLabel: displayPrice,
            pricePerNight: apiData.price || 0,
            cleaningFee: apiData.cleaningFee || 0,
            serviceFee: apiData.serviceFee || 0,
            maxGuests: apiData.guests || 2,
            minStay: apiData.minStay || 1,
            maxStay: apiData.maxStay ?? null,
            checkInTime: apiData.checkInTime || "14:00",
            checkOutTime: apiData.checkOutTime || "11:00",
            selfCheckIn: !!apiData.selfCheckIn,
            beds: apiData.bedrooms || 0,
            baths: apiData.bathrooms || 0,
            sqft: apiData.sqft || 0,
            propertyType: (apiData.propertyType || "Property")
              .toString()
              .replace(/_/g, " "),
            tenure: apiData.leasehold === true
              ? "Leasehold"
              : apiData.leasehold === false
              ? "Freehold"
              : "",
            listingActivity: activity.phrase,
            isNewHome: activity.isNewHome,
            availableFrom: apiData.availableFrom || null,
            securityDeposit: apiData.securityDeposit ?? null,
            billsIncluded:
              typeof apiData.billsIncluded === "boolean"
                ? apiData.billsIncluded
                : null,
            minTerm: apiData.minTerm ?? null,
            maxTerm: apiData.maxTerm ?? null,
            furnishType: apiData.furnishType || null,
            councilTaxBand: apiData.councilTaxBand || "",
            parkingType: apiData.parkingType || null,
            parking: !!apiData.parking,
            garden: apiData.garden || null,
            accessibility: apiData.accessibility || null,
            epcRating: apiData.epcRating || null,
            epcCurrentScore: apiData.epcCurrentScore ?? null,
            epcPotentialScore: apiData.epcPotentialScore ?? null,
            keyFeatures: Array.isArray(apiData.keyFeatures) ? apiData.keyFeatures : [],
            utilities: apiData.utilities || null,
            broadbandSpeed: apiData.broadbandSpeed || null,
            floodRisk: apiData.floodRisk || null,
            pricePerMonth:
              apiData.listingType === "RENT" && apiData.rentalType === "LONG_TERM"
                ? apiData.price || 0
                : undefined,
            amenities,
            blockedDateRanges: apiData.blockedDateRanges || [],
            images:
              apiData.images?.length > 0
                ? apiData.images.map((img: any) => img.url).filter(Boolean)
                : [],
            latitude: apiData.latitude ?? null,
            longitude: apiData.longitude ?? null,
            agent: {
              name: agentName,
              address: agentAddress,
              phone: owner?.phone || "",
              logoUrl: resolveListingAgentLogo(owner) || "",
              description: owner?.website
                ? `Visit ${owner.website}`
                : isAgentLister
                ? `${agentName} is marketing this property on MYKEYS.`
                : "Listed by the property owner on MYKEYS.",
              sellerType: isAgentLister ? "AGENT" : "",
              isAgentLister,
            },
          });

          setInquiryForm((prev) => ({
            ...prev,
            message: `Hi, I'm interested in ${apiData.title || "this property"}. Please send more details.`,
          }));
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [params?.id]);

  useEffect(() => {
    const propertyId = params?.id;
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
  }, [params?.id]);

  const handleToggleFavorite = async () => {
    const propertyId = params?.id;
    if (!propertyId) return;
    if (!localStorage.getItem("accessToken")) {
      router.push("/login");
      return;
    }
    try {
      const response = await api.post("/favorites/toggle", {
        propertyId,
      });
      if (response.data?.success) {
        setIsLiked(response.data.data?.action === "added");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch {
      /* ignore */
    }
  };

  const openInquiryModal = async () => {
    if (!localStorage.getItem("accessToken")) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    try {
      const me = await api.get("/auth/me");
      const user = me.data?.data;
      if (user) {
        setInquiryForm((prev) => ({
          ...prev,
          name:
            prev.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: prev.email || user.email || "",
          phone: prev.phone || user.phone || "",
          message:
            prev.message ||
            `Hi, I'm interested in ${property.title || "this property"}. Please send more details.`,
        }));
      }
    } catch {
      /* still allow modal */
    }
    setShowInquiryModal(true);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryLoading) return;
    if (!localStorage.getItem("accessToken")) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }
    setInquiryLoading(true);
    try {
      const res = await api.post("/inquiries", {
        propertyId: property.id,
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        message: inquiryForm.message,
      });
      if (res.data?.success) {
        setShowInquiryModal(false);
        setInquirySuccess("Inquiry sent — opening your messages…");
        const inquiryId = res.data.data?.id;
        setTimeout(() => {
          if (inquiryId) router.push(`/dashboard/inquiries/${inquiryId}`);
          else router.push("/user/dashboard/inquiries");
        }, 600);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to send inquiry. Please try again.";
      if (err.response?.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        );
        return;
      }
      alert(msg);
    } finally {
      setInquiryLoading(false);
    }
  };

  const images = (property.images?.length ? property.images : []).filter(Boolean);
  const safeImage = (idx: number) => {
    if (!images.length) return null;
    return images[((idx % images.length) + images.length) % images.length];
  };
  const openGalleryAt = (idx: number) => {
    if (!images.length) return;
    const normalized = ((idx % images.length) + images.length) % images.length;
    setSelectedImgIdx(normalized);
    setIsGalleryOpen(true);
  };
  const isShortStay =
    property.listingType === "RENT" && property.rentalType === "SHORT_TERM";
  const isBuy = property.listingType === "BUY";
  const agentInitials = (property.agent?.name || "PO")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f5f7] pb-16 pt-[64px] md:pt-[72px]">
        {/* ── Top Header Navigation Bar ── */}
        <div className="max-w-[1240px] mx-auto px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#339390] hover:underline cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            Back to search results
          </button>
        </div>

      {loading ? (
        <div className="max-w-[1240px] mx-auto px-4 py-20 text-center text-slate-500 font-semibold">
          Loading property details...
        </div>
      ) : (
        <div className="max-w-[1240px] mx-auto px-4">
          {/* ── Main Gallery Grid (Rightmove Exact Style) ── */}
          <div className="relative grid grid-cols-3 gap-2 mb-6">
            {/* Left Main Image (~65% width) */}
            <div
              className="col-span-2 relative h-[380px] lg:h-[440px] cursor-pointer rounded-[4px] overflow-hidden group bg-gray-100"
              onClick={() => openGalleryAt(selectedImgIdx)}
            >
              {safeImage(selectedImgIdx) ? (
                <img
                  src={safeImage(selectedImgIdx)!}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                  No photos available
                </div>
              )}
              {/* Clean White Chevron Left (No dark circular background) */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImgIdx((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1
                    );
                  }}
                  aria-label="Previous Photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10"
                >
                  <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Right Sub-Images Stacked (~35% width) */}
            <div className="col-span-1 flex flex-col gap-2 h-[380px] lg:h-[440px]">
              {/* Top Right Sub-Image */}
              <div
                className="relative flex-1 cursor-pointer rounded-[4px] overflow-hidden bg-gray-100"
                onClick={() => openGalleryAt(selectedImgIdx + 1)}
              >
                {safeImage(selectedImgIdx + 1) ? (
                  <img
                    src={safeImage(selectedImgIdx + 1)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                {/* Clean White Chevron Right on Right Edge of Top-Right Image */}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImgIdx((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      );
                    }}
                    aria-label="Next Photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:scale-110 transition-transform cursor-pointer drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10"
                  >
                    <ChevronRight className="w-8 h-8 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Bottom Right Sub-Image */}
              <div
                className="relative flex-1 cursor-pointer rounded-[4px] overflow-hidden bg-gray-100"
                onClick={() => openGalleryAt(selectedImgIdx + 2)}
              >
                {safeImage(selectedImgIdx + 2) ? (
                  <img
                    src={safeImage(selectedImgIdx + 2)!}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
                {/* Rightmove Signature Photo Counter Badge (White Pill, Bottom Right) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openGalleryAt(selectedImgIdx);
                  }}
                  className="absolute bottom-3 right-3 bg-white text-[#0f172a] text-[13px] font-bold px-3 py-1 rounded-[4px] shadow flex items-center gap-1.5 z-10 cursor-pointer hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 stroke-[2]" />
                  {images.length
                    ? `${selectedImgIdx + 1}/${images.length}`
                    : "0/0"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Two-Column Page Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── LEFT COLUMN: Property Info Details (~68% width) ── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-end gap-2">
                <button type="button" onClick={handleShare} aria-label="Share property" className="p-2 text-gray-700 hover:text-[#339390] cursor-pointer bg-white border border-gray-200 rounded">
                  <Share2 className="w-5 h-5 stroke-[2]" />
                </button>
                <button type="button" onClick={handleToggleFavorite} aria-label="Save property" className="p-2 text-gray-700 hover:text-red-500 cursor-pointer bg-white border border-gray-200 rounded">
                  <Heart
                    className={"w-6 h-6 stroke-[2] " + (isLiked ? "fill-red-500 text-red-500" : "")}
                  />
                </button>
              </div>

              {images.length > 0 && (
                <div className="bg-white rounded-[4px] p-4 shadow-sm border border-gray-200">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 w-full">
                    {images.slice(0, 4).map((src: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative h-[65px] rounded overflow-hidden cursor-pointer"
                        onClick={() => openGalleryAt(idx)}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {images.length > 4 && (
                      <div
                        className="relative h-[65px] rounded overflow-hidden cursor-pointer bg-gray-100 border border-gray-200 flex items-center justify-center text-[15px] font-bold text-[#0f172a]"
                        onClick={() => openGalleryAt(4)}
                      >
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <PropertyListingDetails
                property={{
                  title: property.title,
                  address: property.address,
                  city: property.city,
                  state: property.state,
                  description: property.description,
                  listingType: property.listingType,
                  rentalType: property.rentalType,
                  occupancyType: property.occupancyType,
                  priceLabel: property.price,
                  pricePerMonth: property.pricePerMonth,
                  pricePerNight: property.pricePerNight,
                  beds: property.beds,
                  baths: property.baths,
                  sqft: property.sqft,
                  propertyType: property.propertyType,
                  tenure: property.tenure,
                  listingActivity: property.listingActivity,
                  isNewHome: property.isNewHome,
                  availableFrom: property.availableFrom,
                  securityDeposit: property.securityDeposit,
                  furnishType: property.furnishType,
                  councilTaxBand: property.councilTaxBand,
                  billsIncluded: property.billsIncluded,
                  minTerm: property.minTerm,
                  maxTerm: property.maxTerm,
                  parkingType: property.parkingType,
                  parking: property.parking,
                  garden: property.garden,
                  accessibility: property.accessibility,
                  epcRating: property.epcRating,
                  epcCurrentScore: property.epcCurrentScore,
                  epcPotentialScore: property.epcPotentialScore,
                  keyFeatures: property.keyFeatures,
                  amenities: property.amenities,
                  utilities: property.utilities,
                  broadbandSpeed: property.broadbandSpeed,
                  floodRisk: property.floodRisk,
                  guests: property.maxGuests,
                  minStay: property.minStay,
                  maxStay: property.maxStay,
                  checkInTime: property.checkInTime,
                  checkOutTime: property.checkOutTime,
                  selfCheckIn: property.selfCheckIn,
                  cleaningFee: property.cleaningFee,
                  serviceFee: property.serviceFee,
                  agentName: property.agent?.name,
                  latitude: property.latitude,
                  longitude: property.longitude,
                }}
              />

              {typeof property.latitude === "number" &&
                typeof property.longitude === "number" && (
                <PropertyLocationMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                  addressLabel={
                    [property.address, property.city, property.state]
                      .filter(Boolean)
                      .join(", ") || property.title
                  }
                />
              )}

              {/* ── About Agent Section ── */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0f172a]">
                      About {property.agent.name}
                    </h2>
                    {property.agent.address && (
                      <p className="text-[13px] text-gray-500">
                        {property.agent.address}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-[#0f172a] rounded flex items-center justify-center text-green-300 font-bold text-xs shrink-0 overflow-hidden">
                    {property.agent.logoUrl ? (
                      <img
                        src={property.agent.logoUrl}
                        alt=""
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : (
                      <span>{agentInitials || "PO"}</span>
                    )}
                  </div>
                </div>

                <p className="text-[13.5px] text-[#334155] leading-relaxed font-normal">
                  {property.agent.description}
                </p>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Marketed By / Booking Sticky Card (~32% width) ── */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[90px]">
              {isShortStay ? (
                <PropertyShortStayBooking
                  propertyId={property.id}
                  propertyTitle={property.title}
                  pricePerNight={property.pricePerNight}
                  cleaningFee={property.cleaningFee}
                  serviceFee={property.serviceFee}
                  maxGuests={property.maxGuests}
                  minStay={property.minStay}
                  maxStay={property.maxStay}
                  blockedRanges={property.blockedDateRanges}
                />
              ) : null}

              {/* Marketed By Card */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-4">
                <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase block">
                  MARKETED BY
                </span>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0f172a] leading-snug">
                      {property.agent.name}
                    </h3>
                    {property.agent.address && (
                      <p className="text-[12.5px] text-gray-500 mt-1">
                        {property.agent.address}
                      </p>
                    )}
                    {property.agent.isAgentLister && (
                      <a
                        href={`/buy/results?location=${encodeURIComponent(
                          property.city || property.state || "London"
                        )}`}
                        className="text-[12px] font-semibold text-[#339390] hover:underline mt-1 block"
                      >
                        More properties from this agent
                      </a>
                    )}
                  </div>
                  <div className="w-16 h-16 bg-[#0f172a] rounded flex items-center justify-center text-green-300 font-extrabold text-sm shrink-0 shadow-sm overflow-hidden">
                    {property.agent.logoUrl ? (
                      <img
                        src={property.agent.logoUrl}
                        alt="Agent Logo"
                        className="w-full h-full object-contain bg-white"
                      />
                    ) : (
                      <span>{agentInitials || "PO"}</span>
                    )}
                  </div>
                </div>

                {!isShortStay && (
                  <div className="space-y-2 pt-2">
                    {property.agent.phone && (
                      <p className="text-[14px] font-semibold text-[#0f172a] text-center">
                        {property.agent.phone}
                      </p>
                    )}
                    {property.agent.phone ? (
                      <a
                        href={`tel:${property.agent.phone}`}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] py-3 px-4 rounded-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Phone className="w-4 h-4 stroke-[2.5]" />
                        Call {property.agent.isAgentLister ? "agent" : "seller"}
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={openInquiryModal}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] py-3 px-4 rounded-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Mail className="w-4 h-4 stroke-[2.5]" />
                      Request details
                    </button>
                  </div>
                )}
              </div>

              {inquirySuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded px-4 py-3">
                  {inquirySuccess}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </main>

      {/* ── Full-screen image gallery ── */}
      {isGalleryOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Property photos"
        >
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none">
            <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded pointer-events-auto">
              {selectedImgIdx + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setIsGalleryOpen(false)}
              aria-label="Close gallery"
              className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 cursor-pointer pointer-events-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center min-h-0 w-full">
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedImgIdx((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                aria-label="Previous photo"
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-gray-100 cursor-pointer"
              >
                <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
              </button>
            )}

            <img
              src={images[selectedImgIdx]}
              alt={`${property.title} photo ${selectedImgIdx + 1}`}
              className="max-h-[100vh] max-w-[100vw] w-auto h-auto object-contain select-none px-16 md:px-24"
              draggable={false}
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedImgIdx((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                aria-label="Next photo"
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-gray-100 cursor-pointer"
              >
                <ChevronRight className="w-8 h-8 stroke-[2.5]" />
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-0 inset-x-0 z-20 px-4 pb-5 pt-10 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
                {images.map((src: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImgIdx(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`w-16 h-12 md:w-20 md:h-14 rounded overflow-hidden shrink-0 border-2 cursor-pointer transition-opacity ${
                      idx === selectedImgIdx
                        ? "border-white opacity-100"
                        : "border-transparent opacity-50 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Inquiry Modal ── */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/60 z-[180] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-xl">
            <button
              type="button"
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4">
              Request Details / Contact Agent
            </h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={inquiryForm.name}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#339390]"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  value={inquiryForm.email}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#339390]"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={inquiryForm.phone}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#339390]"
                  placeholder="07123 456789"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={inquiryForm.message}
                  onChange={(e) =>
                    setInquiryForm({ ...inquiryForm, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-[#339390]"
                  placeholder="I would like to arrange a viewing or request more information about this property."
                />
              </div>
              <button
                type="submit"
                disabled={inquiryLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-3 rounded cursor-pointer transition-all"
              >
                {inquiryLoading ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}