"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Heart,
  Share2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Home,
  Building,
  Info,
  Tag,
  BarChart3,
  Package,
  Wifi,
  PiggyBank,
  Plus,
  Building2,
  X,
  Camera,
  Layers,
  FileText,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDateToReadable } from "@/utils/utils";
import dynamic from "next/dynamic";
import img from "../../../assets/user.png";

// Dynamically import Leaflet map components with SSR false
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
) as any;
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
) as any;
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
) as any;
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
) as any;

// Leaflet default icon fix for browser
if (typeof window !== "undefined") {
  const L = require("leaflet");
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

// Custom Floorplan SVG Icon matching Rightmove
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

// Default property data structure
const emptyPropertyData = {
  id: "",
  title: "",
  address: "",
  city: "London",
  state: "N19",
  description: "",
  listingType: "buy",
  rentalType: "long" as const,
  price: "£550,000",
  propertyPrice: "£550,000",
  beds: 2,
  baths: 1,
  sqft: 679,
  propertyType: "Apartment",
  tenure: "Share of Freehold",
  councilTaxBand: "D",
  parking: "Permit",
  garden: "Ask agent",
  accessibility: "Ask agent",
  reducedDate: "09/05/2026",
  images: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  ],
  agent: {
    name: "JTM Homes, North London",
    address: "695 Holloway Road London N19 5SE",
    phone: "020 3907 2747",
    logoUrl: "",
    description:
      "JTM Homes are an independent firm of estate agents with over 40 years combined experience selling, renting and managing properties. We specialise in the N19, N7, N6, NW5 & N4 areas of London.",
  },
  latitude: 51.564,
  longitude: -0.132,
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

  // Accordion toggle states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    freehold: true,
    epc: false,
    utilities: false,
    broadband: false,
    history: false,
    sold: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Fetch property data from API
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const id = params?.id;
        if (!id) return;

        const response = await api.get(`/properties/${id}`);

        if (response.data?.success && response.data.data) {
          const apiData = response.data.data;
          const displayPrice = apiData.propertyPrice
            ? `£${apiData.propertyPrice.toLocaleString()}`
            : apiData.price
            ? `£${apiData.price.toLocaleString()}`
            : "£550,000";

          setProperty({
            ...emptyPropertyData,
            id: apiData.id,
            title: apiData.title || apiData.address || "Hatchard Road, N19",
            address: apiData.address || "Hatchard Road, N19",
            city: apiData.city || "London",
            state: apiData.zipCode || "N19",
            description:
              apiData.description ||
              "Set on a quiet residential street in the heart of N19, this well-presented split-level apartment offers a perfect blend of charm, practicality, and modern living. Arranged over the first and second floors, the property boasts a bright and spacious reception room, ideal for both entertaining and everyday relaxation.",
            price: displayPrice,
            propertyPrice: displayPrice,
            beds: apiData.bedrooms || 2,
            baths: apiData.bathrooms || 1,
            sqft: apiData.sqft || 679,
            propertyType: apiData.propertyType || "Apartment",
            images:
              apiData.images?.length > 0
                ? apiData.images.map((img: any) => img.url)
                : emptyPropertyData.images,
            latitude: apiData.latitude || 51.564,
            longitude: apiData.longitude || -0.132,
            agent: apiData.owner
              ? {
                  name:
                    apiData.owner.companyName ||
                    `${apiData.owner.firstName || ""} ${apiData.owner.lastName || ""}`.trim() ||
                    "JTM Homes, North London",
                  address: "695 Holloway Road London N19 5SE",
                  phone: apiData.owner.phone || "020 3907 2747",
                  logoUrl: apiData.owner.avatar || "",
                  description:
                    "JTM Homes are an independent firm of estate agents with over 40 years combined experience selling, renting and managing properties. We specialise in the N19, N7, N6, NW5 & N4 areas of London.",
                }
              : emptyPropertyData.agent,
          });
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
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

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setInquirySuccess("Inquiry sent successfully!");
        setShowInquiryModal(false);
        setTimeout(() => setInquirySuccess(null), 4000);
      }
    } catch {
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setInquiryLoading(false);
    }
  };

  const images = property.images?.length ? property.images : emptyPropertyData.images;

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
              className="col-span-2 relative h-[380px] lg:h-[440px] cursor-pointer rounded-[4px] overflow-hidden group"
              onClick={() => setIsGalleryOpen(true)}
            >
              <img
                src={images[selectedImgIdx] || images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
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
                className="relative flex-1 cursor-pointer rounded-[4px] overflow-hidden"
                onClick={() => setIsGalleryOpen(true)}
              >
                <img
                  src={images[(selectedImgIdx + 1) % images.length] || images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
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
                className="relative flex-1 cursor-pointer rounded-[4px] overflow-hidden"
                onClick={() => setIsGalleryOpen(true)}
              >
                <img
                  src={images[(selectedImgIdx + 2) % images.length] || images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Rightmove Signature Photo Counter Badge (White Pill, Bottom Right) */}
                <div className="absolute bottom-3 right-3 bg-white text-[#0f172a] text-[13px] font-bold px-3 py-1 rounded-[4px] shadow flex items-center gap-1.5 z-10">
                  <Camera className="w-4 h-4 stroke-[2]" />
                  1/13
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-Column Page Layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ── LEFT COLUMN: Property Info Details (~68% width) ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title, Share/Save, Price Header Card */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h1 className="text-[22px] font-bold text-[#0f172a] leading-snug">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share property"
                      className="p-2 text-gray-700 hover:text-[#339390] cursor-pointer"
                    >
                      <Share2 className="w-5 h-5 stroke-[2]" />
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      aria-label="Save property"
                      className="p-2 text-gray-700 hover:text-red-500 cursor-pointer"
                    >
                      <Heart
                        className={`w-6 h-6 stroke-[2] ${
                          isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[26px] font-extrabold text-[#0f172a] leading-none">
                    {property.price}
                  </span>
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>

                {/* Affordability Link & Reduced Date */}
                <div className="flex items-center justify-between text-[13.5px] border-b border-gray-100 pb-4 mb-4">
                  <a
                    href="#affordability"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#339390] hover:underline"
                  >
                    <PiggyBank className="w-4 h-4" />
                    Can you afford it?
                  </a>
                  {/* STATIC FALLBACK: reduced date */}
                  <span className="text-gray-500 text-[13px]">
                    Reduced on {property.reducedDate || "09/05/2026"}
                  </span>
                </div>

                {/* Property Key Specifications Bar (5 Columns) */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      PROPERTY TYPE
                    </span>
                    <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-gray-600" />
                      {property.propertyType}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      BEDROOMS
                    </span>
                    <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-gray-600 stroke-[2]" />
                      {property.beds}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      BATHROOMS
                    </span>
                    <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-gray-600 stroke-[2]" />
                      {property.baths}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      SIZE
                    </span>
                    <span className="text-[14px] font-bold text-[#0f172a] flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-gray-600" />
                      {property.sqft} sq ft
                    </span>
                    <span className="text-[11px] text-gray-500 block">63 sq m</span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase block mb-1 flex items-center gap-1">
                      TENURE <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    {/* STATIC FALLBACK: tenure type */}
                    <span className="text-[14px] font-semibold text-[#339390] hover:underline cursor-pointer block">
                      {property.tenure || "Share of Freehold"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Floorplan Preview & Sub-Gallery Row ── */}
              {/* STATIC FALLBACK: Floorplan box & sub-photos collage */}
              <div className="bg-white rounded-[4px] p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                {/* Floorplan Thumbnail */}
                <div className="relative w-full md:w-[180px] h-[140px] bg-gray-100 border border-gray-200 rounded flex items-center justify-center cursor-pointer overflow-hidden shrink-0">
                  <div className="text-center p-2">
                    <FloorplanIcon />
                    <span className="text-xs font-semibold text-gray-600 mt-1 block">
                      Hatchard Road, N19
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-[#0f172a] flex items-center gap-1 shadow-sm">
                    <FloorplanIcon /> 1
                  </div>
                </div>

                {/* Sub-Photos Collage Grid */}
                <div className="flex-1 grid grid-cols-4 sm:grid-cols-5 gap-2 w-full">
                  {images.slice(0, 4).map((src: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative h-[65px] rounded overflow-hidden cursor-pointer"
                      onClick={() => setIsGalleryOpen(true)}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div
                    className="relative h-[65px] rounded overflow-hidden cursor-pointer bg-gray-100 border border-gray-200 flex items-center justify-center text-[15px] font-bold text-[#0f172a]"
                    onClick={() => setIsGalleryOpen(true)}
                  >
                    +{Math.max(images.length - 4, 7)}
                  </div>
                </div>
              </div>

              {/* ── Key Features Section ── */}
              {/* STATIC FALLBACK: bullet points list */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
                <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">
                  Key features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-[14px] font-semibold text-[#0f172a]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f172a]" />
                    TWO DOUBLE BEDROOMS
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f172a]" />
                    CLOSE TO LOCAL TRANSPORT LINKS
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f172a]" />
                    DOUBLE GLAZED WINDOWS
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f172a]" />
                    SPLIT LEVEL APARTMENT
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 bg-[#eef2ff] text-[#4f46e5] text-[13.5px] font-semibold px-4 py-2 rounded-lg border border-[#c7d2fe] hover:bg-[#e0e7ff] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#6366f1]" />
                    Summarise property details
                  </button>
                </div>
              </div>

              {/* ── Description Section ── */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
                <h2 className="text-[18px] font-bold text-[#0f172a] mb-3">
                  Description
                </h2>
                <p className="text-[14px] text-[#334155] leading-relaxed whitespace-pre-line font-normal">
                  {property.description}
                </p>
                <button
                  type="button"
                  className="mt-3 text-[14px] font-bold text-[#339390] hover:underline cursor-pointer"
                >
                  Show less
                </button>
              </div>

              {/* ── Additional Property Attributes ── */}
              {/* STATIC FALLBACK: council tax, parking, garden, accessibility, cameras */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-[13.5px]">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                      COUNCIL TAX <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      Band: {property.councilTaxBand || "D"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                      PARKING <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {property.parking || "Permit"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                      GARDEN <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {property.garden || "Ask agent"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                      ACCESSIBILITY <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {property.accessibility || "Ask agent"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                      CAMERAS <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-bold text-[#0f172a]">
                      {property.cameras || "Installed (CCTV)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Expandable Accordion Cards ── */}
              {/* STATIC FALLBACK: accordions */}
              <div className="space-y-3">
                {/* Accordion 1: Share of Freehold */}
                <div className="bg-white rounded-[4px] border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("freehold")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                      <Tag className="w-5 h-5 text-gray-700" />
                      Share of Freehold
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openAccordions.freehold ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.freehold && (
                    <div className="px-4 pb-4 text-[13.5px] text-gray-600 border-t border-gray-100 pt-3">
                      This property comes with a Share of Freehold tenure. Please confirm lease terms and ground rent with your solicitor.
                    </div>
                  )}
                </div>

                {/* Accordion 2: Energy Performance Certificate */}
                <div className="bg-white rounded-[4px] border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("epc")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                      <BarChart3 className="w-5 h-5 text-gray-700" />
                      Energy Performance Certificate
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openAccordions.epc ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.epc && (
                    <div className="px-4 pb-4 text-[13.5px] text-gray-600 border-t border-gray-100 pt-3">
                      Current EPC Rating: Band C. Full EPC documentation available upon request.
                    </div>
                  )}
                </div>

                {/* Accordion 3: Utilities, rights & restrictions */}
                <div className="bg-white rounded-[4px] border border-gray-200 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("utilities")}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                      <Package className="w-5 h-5 text-gray-700" />
                      Utilities, rights & restrictions
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        openAccordions.utilities ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.utilities && (
                    <div className="px-4 pb-4 text-[13.5px] text-gray-600 border-t border-gray-100 pt-3">
                      Mains electricity, gas, water, and broadband connected. No known restrictive covenants.
                    </div>
                  )}
                </div>

                {/* Additional Links */}
                <div className="bg-white rounded-[4px] border border-gray-200 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                    <Building className="w-5 h-5 text-gray-700" />
                    Renovation potential
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>

                <div className="bg-white rounded-[4px] border border-gray-200 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                    <Wifi className="w-5 h-5 text-gray-700" />
                    Broadband speed
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>

                <div className="bg-white rounded-[4px] border border-gray-200 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                    <FileText className="w-5 h-5 text-gray-700" />
                    Property sale history
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </div>

                <div className="bg-white rounded-[4px] border border-gray-200 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                  <span className="flex items-center gap-3 font-bold text-[#0f172a] text-[15px]">
                    <Home className="w-5 h-5 text-gray-700" />
                    Recently sold & under offer
                  </span>
                  <span className="text-[13px] font-semibold text-[#339390] flex items-center gap-1">
                    See similar nearby properties <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* ── Map & Nearby AI Section ── */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-[18px] font-bold text-[#0f172a]">
                  {property.title}
                </h2>

                {/* AI Query Pills Carousel */}
                {/* STATIC FALLBACK: AI prompts */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    className="bg-[#eef2ff] text-[#4338ca] text-[13px] font-semibold px-3.5 py-1.5 rounded-full border border-[#c7d2fe] whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
                    Where are the closest supermarkets?
                  </button>
                  <button
                    type="button"
                    className="bg-[#eef2ff] text-[#4338ca] text-[13px] font-semibold px-3.5 py-1.5 rounded-full border border-[#c7d2fe] whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
                    Are there any parks nearby?
                  </button>
                  <button
                    type="button"
                    className="bg-[#eef2ff] text-[#4338ca] text-[13px] font-semibold px-3.5 py-1.5 rounded-full border border-[#c7d2fe] whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
                    Is there public transport nearby?
                  </button>
                </div>

                {/* Map View */}
                <div className="relative h-[300px] w-full rounded-[4px] overflow-hidden border border-gray-200">
                  <div className="absolute top-3 left-3 bg-white/95 border border-gray-200 rounded px-3 py-1 text-xs font-bold text-[#0f172a] z-10 shadow-sm">
                    Approximate location
                  </div>
                  <MapContainer
                    center={[property.latitude, property.longitude]}
                    zoom={15}
                    className="w-full h-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[property.latitude, property.longitude]}>
                      <Popup>{property.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>

                {/* Location Tabs */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-8 border-b border-gray-200 pb-2 text-[14px] font-bold text-gray-600 mb-4">
                    <span className="text-[#339390] border-b-2 border-[#339390] pb-2 flex items-center gap-1.5 cursor-pointer">
                      <MapPin className="w-4 h-4" /> My places
                    </span>
                    <span className="hover:text-[#339390] flex items-center gap-1.5 cursor-pointer">
                      <Building2 className="w-4 h-4" /> Stations
                    </span>
                    <span className="hover:text-[#339390] flex items-center gap-1.5 cursor-pointer">
                      <Home className="w-4 h-4" /> Schools
                    </span>
                  </div>

                  <p className="text-[13.5px] text-gray-600 mb-3">
                    Add an important place to see how long it&apos;d take to get there from our property listings.
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0f172a]">
                      __mins driving to your place
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-3 bg-[#0f172a] text-white text-[13.5px] font-bold px-4 py-2 rounded-[4px] inline-flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add a place
                  </button>
                </div>
              </div>

              {/* ── Affordability Calculator Section ── */}
              {/* STATIC FALLBACK: mortgage calculator */}
              <div
                id="affordability"
                className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-4"
              >
                <h2 className="text-[18px] font-bold text-[#0f172a]">
                  Affordability
                </h2>

                <div className="flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-[#0f172a]" />
                  <div>
                    <span className="text-[12px] text-gray-500 block">
                      Monthly repayments
                    </span>
                    <span className="text-[24px] font-extrabold text-[#0f172a]">
                      £2,758
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full border border-gray-200">
                    Property: {property.price}
                  </span>
                  <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full border border-gray-200">
                    Deposit: £55,000
                  </span>
                  <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full border border-gray-200">
                    Interest rate: 5.33%
                  </span>
                  <span className="bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full border border-gray-200">
                    Term: 30 years
                  </span>
                </div>

                <button
                  type="button"
                  className="text-[13px] font-bold text-[#339390] underline cursor-pointer block"
                >
                  Recalculate
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button
                    type="button"
                    className="w-full sm:w-auto bg-[#0f172a] text-white text-[14px] font-bold px-6 py-3 rounded-[4px] hover:bg-slate-800 cursor-pointer"
                  >
                    Get a Mortgage in Principle
                  </button>
                  <span className="text-xs text-gray-500">
                    Powered by <strong className="text-[#0f172a]">NatWest</strong>
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
                  These results are estimates and are only intended as a guide. Make sure you obtain accurate figures from your lender before committing to any mortgage. Your home may be repossessed if you do not keep up repayments on a mortgage.
                </p>
              </div>

              {/* ── About Agent Section ── */}
              <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0f172a]">
                      About {property.agent.name}
                    </h2>
                    <p className="text-[13px] text-gray-500">
                      {property.agent.address}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#0f172a] rounded flex items-center justify-center text-green-300 font-bold text-xs shrink-0">
                    jtm
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-gray-500">
                    Industry affiliations:
                  </span>
                  <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    propertymark
                  </span>
                  <span className="bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    The Property Ombudsman
                  </span>
                </div>

                <p className="text-[13.5px] text-[#334155] leading-relaxed font-normal">
                  {property.agent.description}
                </p>

                <button
                  type="button"
                  className="text-[13.5px] font-bold text-[#339390] hover:underline cursor-pointer"
                >
                  Read more
                </button>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Marketed By Sticky Card (~32% width) ── */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-[90px]">
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
                    <p className="text-[12.5px] text-gray-500 mt-1">
                      {property.agent.address}
                    </p>
                    <button
                      type="button"
                      className="text-[12px] font-semibold text-[#339390] hover:underline mt-1 cursor-pointer block"
                    >
                      More properties from this agent
                    </button>
                  </div>
                  {/* Agent Logo Box */}
                  <div className="w-16 h-16 bg-[#0f172a] rounded flex items-center justify-center text-green-300 font-extrabold text-sm shrink-0 shadow-sm overflow-hidden">
                    {property.agent.logoUrl ? (
                      <img
                        src={property.agent.logoUrl}
                        alt="Agent Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>jtm</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (property.agent?.phone) {
                        window.location.href = `tel:${property.agent.phone}`;
                      } else {
                        alert(`Call Agent at 020 3907 2747`);
                      }
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] py-3 px-4 rounded-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Phone className="w-4 h-4 stroke-[2.5]" />
                    Call agent
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] py-3 px-4 rounded-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Mail className="w-4 h-4 stroke-[2.5]" />
                    Request details
                  </button>
                </div>
              </div>

              {/* Agent Valuation Ad Banner */}
              {/* STATIC FALLBACK: valuation ad card */}
              <div className="bg-[#0f172a] text-white rounded-[4px] p-6 text-center space-y-4 shadow-sm border border-slate-800">
                <h3 className="text-[20px] font-bold leading-tight">
                  Request an <span className="text-[#3db2ad]">agent valuation</span> for your home
                </h3>
                <div className="w-20 h-20 mx-auto bg-[#3db2ad]/20 border border-[#3db2ad] rounded-lg flex items-center justify-center text-[#3db2ad] text-2xl font-bold">
                  £??????
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Ask MYKEYS AI Assistant Pill (Bottom Left Fixed) ── */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          className="bg-green-100 text-green-800 font-bold text-[13px] px-4 py-2.5 rounded-xl shadow-lg border border-green-200 flex items-center gap-2 hover:bg-green-200 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-green-700" />
          Ask MYKEYS
          <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>

      {/* ── Inquiry Modal ── */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
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
      </main>
      <Footer />
    </>
  );
}