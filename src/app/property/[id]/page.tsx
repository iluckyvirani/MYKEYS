"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Bed,
    Bath,
    Maximize2,
    MapPin,
    Star,
    Heart,
    Share2,
    Calendar,
    CheckCircle,
    Wifi,
    Car,
    Wind,
    Utensils,
    Tv,
    Droplets,
    Shield,
    ChevronLeft,
    MessageCircle,
    Phone,
    Mail,
    Clock,
    Users,
    KeyRound,
    FileText,
    PoundSterling,
    Home,
    Building,
    Check,
    X,
    User,
    FileCheck,
    FileSearch,
    Scale,
    ShoppingBag,
    ParkingCircle,
    Train,
    ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RazorpayPaymentModal } from "@/components/RazorpayPaymentModal";
import { api } from "@/lib/api";
import { CreateShortBookingRequest, PaymentMethod } from "@/types/bookings";
import { formatDateToReadable } from "@/utils/utils";
import { MeResponse } from "@/types/auth";
import dynamic from "next/dynamic";

import img from '../../../assets/user.png'

// Dynamically import leaflet components with ssr: false to avoid window is not defined error
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

// Initialize marker icon fix only in browser
if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
}



// Default empty property object
const emptyPropertyData = {
    id: "",
    title: "",
    address: "",
    description: "",
    listingType: "rent",
    rentalType: "short" as const,
    priceType: "nightly" as const,
    price: "0",
    cleaningFee: "0",
    serviceFee: "0",
    beds: 0,
    baths: 0,
    sqft: 0,
    guests: 0,
    propertyType: "",
    minStay: 0,
    maxStay: 0,
    minTerm: 0,
    maxTerm: 0,
    freeparking: false,
    availableFrom: "",
    securityDeposit: "0",
    billsIncluded: false,
    epcRating: "",
    councilTaxBand: "",
    propertyPrice: "0",
    propertyTax: "0",
    hoaFee: "0",
    leasehold: false,
    leaseYears: 0,
    groundRent: "0",
    amenities: [] as any[],
    images: [] as string[],
    owner: null,
    averageRating: 0,
    reviewsCount: 0,
    reviews: [] as any[],
    latitude: 51.5074,
    longitude: -0.1278,
    requiredDocuments: {
        common: [
            "Proof of identity (Passport/Driving License)",
            "Proof of address (Utility bill/Bank statement)",
        ],
        rent: [
            "Right to Rent check (for UK tenants)",
            "Employment reference letter",
            "Previous landlord reference",
            "Credit check authorization",
            "Guarantor details (if required)",
        ],
        buy: [
            "Mortgage Agreement in Principle",
            "Proof of funds/savings",
            "Solicitor details",
            "Surveyor report",
            "Local searches documentation",
        ],
        shortStay: [
            "Security deposit",
            "Booking confirmation",
        ]
    },
};

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(2);
    const [activeTab, setActiveTab] = useState("overview");
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [showInquiryModal, setShowInquiryModal] = useState(false);
    const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
    const [inquiryLoading, setInquiryLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        budget: "",
        duration: "",
        type: ""
    });
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [property, setProperty] = useState<any>(emptyPropertyData);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState<{ bookingId: string, amount: number, propertyTitle: string } | null>(null);
    const [nights, setNights] = useState(0);
    const [subtotal, setSubtotal] = useState(0);
    const [cleaningFeeAmount, setCleaningFeeAmount] = useState(0);
    const [serviceFeeAmount, setServiceFeeAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    // Helper function to extract numeric value from price strings
    const parsePrice = (priceString: string): number => {
        return parseFloat(priceString.replace(/[^0-9.]/g, ''));
    };

    // Calculate price when dates or property change
    useEffect(() => {
        if (checkInDate && checkOutDate && property.priceType === "nightly") {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);

            if (checkOut > checkIn) {
                // Calculate number of nights
                const nightsCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
                setNights(nightsCount);

                // Parse the price
                const pricePerNight = parsePrice(property.price);

                // Calculate subtotal
                const subTotal = pricePerNight * nightsCount;
                setSubtotal(subTotal);

                // Parse fees
                const cleaningFee = parsePrice(property.cleaningFee || "0");
                const serviceFee = parsePrice(property.serviceFee || "0");

                setCleaningFeeAmount(cleaningFee);
                setServiceFeeAmount(serviceFee);

                // Calculate total
                const total = subTotal + cleaningFee + serviceFee;
                setTotalAmount(total);
            } else {
                // Reset if dates are invalid
                setNights(0);
                setSubtotal(0);
                setCleaningFeeAmount(0);
                setServiceFeeAmount(0);
                setTotalAmount(0);
            }
        } else {
            // Reset if no dates selected
            setNights(0);
            setSubtotal(0);
            setCleaningFeeAmount(0);
            setServiceFeeAmount(0);
            setTotalAmount(0);
        }
    }, [checkInDate, checkOutDate, property]);

    // Fetch property data from API
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const id = params?.id;
                if (!id) return;

                const response = await api.get(`/properties/${id}`);

                if (response.data?.success && response.data.data) {
                    const apiData = response.data.data;

                    // Map API response to component format, fallback to empty data for missing fields
                    const mappedData = {
                        ...emptyPropertyData,
                        id: apiData.id || emptyPropertyData.id,
                        title: apiData.title || emptyPropertyData.title,
                        address: `${apiData.address || emptyPropertyData.address}`,
                        city: apiData.city || "London",
                        state: apiData.state || "UK",
                        description: apiData.description || emptyPropertyData.description,
                        listingType: apiData.listingType?.toLowerCase() || emptyPropertyData.listingType,
                        rentalType: apiData.rentalType?.toLowerCase() === "short_term" ? "short" : "long",
                        priceType: apiData.priceType?.toLowerCase() || emptyPropertyData.priceType,
                        price: `£${apiData.price}` || emptyPropertyData.price,
                        cleaningFee: `£${apiData.cleaningFee}` || emptyPropertyData.cleaningFee,
                        serviceFee: `£${apiData.serviceFee}` || emptyPropertyData.serviceFee,
                        beds: apiData.bedrooms || emptyPropertyData.beds,
                        baths: apiData.bathrooms || emptyPropertyData.baths,
                        sqft: apiData.sqft || emptyPropertyData.sqft,
                        propertyType: apiData.propertyType || emptyPropertyData.propertyType,
                        minStay: apiData.minStay || emptyPropertyData.minStay,
                        maxStay: apiData.maxStay || emptyPropertyData.maxStay,
                        minTerm: apiData.minTerm || emptyPropertyData.minTerm,
                        maxTerm: apiData.maxTerm || emptyPropertyData.maxTerm,
                        freeparking: apiData.parking || emptyPropertyData.freeparking,
                        guests: apiData.guests || emptyPropertyData.guests,
                        availableFrom: apiData.availableFrom || emptyPropertyData.availableFrom,
                        securityDeposit: `£${apiData.securityDeposit}` || emptyPropertyData.securityDeposit,
                        billsIncluded: apiData.billsIncluded || false,
                        epcRating: apiData.epcRating || emptyPropertyData.epcRating,
                        councilTaxBand: apiData.councilTaxBand || emptyPropertyData.councilTaxBand,
                        propertyPrice: apiData.propertyPrice || emptyPropertyData.propertyPrice,
                        propertyTax: `£${apiData.propertyTax}` || emptyPropertyData.propertyTax,
                        hoaFee: `£${apiData.hoaFee}` || emptyPropertyData.hoaFee,
                        leasehold: apiData.leasehold,
                        leaseYears: apiData.leaseYears || emptyPropertyData.leaseYears,
                        groundRent: apiData.groundRent || emptyPropertyData.groundRent,
                        images: apiData.images?.map((img: any) => img.url) || emptyPropertyData.images,
                        amenities: apiData.amenities?.map((amenity: any) => ({
                            name: amenity.amenity.name,
                            icon: <Wifi className="w-5 h-5" /> // Fallback icon
                        })) || emptyPropertyData.amenities,
                        averageRating: apiData.averageRating || emptyPropertyData.averageRating,
                        reviewsCount: apiData.reviewCount || emptyPropertyData.reviewsCount,
                        reviews: apiData.reviews || emptyPropertyData.reviews,
                        owner: apiData.owner ? {
                            name: `${apiData.owner.firstName} ${apiData.owner.lastName}` || "Property Owner",
                            joined: "Active",
                            verified: true,
                            responseRate: "95%",
                            responseTime: "within 2 hours",
                            avatar: apiData.owner.avatar || img,
                        } : emptyPropertyData.owner,
                        latitude: apiData.latitude || emptyPropertyData.latitude,
                        longitude: apiData.longitude || emptyPropertyData.longitude,
                    };

                    setProperty(mappedData);
                }
            } catch (error) {
                console.error("Error fetching property:", error);
                // Keep using empty data on error
                setProperty(emptyPropertyData);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [params?.id]);

    // Check if user is logged in and prefill form
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await api.get<MeResponse>("/auth/me");
                if (response.data && response.data.data) {
                    const userData = response.data.data;
                    localStorage.setItem("user", JSON.stringify(response.data));
                    setIsLoggedIn(true);
                    setInquiryForm({
                        name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
                        email: userData.email || "",
                        phone: userData.phone || "",
                        message: "",
                        budget: "",
                        duration: "",
                        type: ""
                    });
                }
            } catch (error) {
                console.log("User not logged in");
                setIsLoggedIn(false);
            }
        };

        fetchUserDetails();
    }, []);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            const propertyId = params?.id;
            if (!propertyId) return;

            if (!isLoggedIn) {
                setIsLiked(false);
                return;
            }

            try {
                const response = await api.get(`/favorites/check/${propertyId}`);
                if (response.data?.success && response.data.data) {
                    setIsLiked(!!response.data.data.isFavorite);
                }
            } catch (error) {
                console.error("Error checking favorite status:", error);
                setIsLiked(false);
            }
        };

        fetchFavoriteStatus();
    }, [params?.id, isLoggedIn]);


    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInquirySuccess(null);

        try {
            setInquiryLoading(true);
            // Determine inquiry type based on property listing type
            let inquiryType = "purchase";
            if (property.listingType === "rent") {
                inquiryType = property.rentalType === "long" ? "long_term" : "short_term";
            }

            let inquiryData: any = {
                propertyId: property.id,
                message: inquiryForm.message,
                name: inquiryForm.name,
                email: inquiryForm.email,
                phone: inquiryForm.phone,
                type: inquiryType,
                budget: inquiryForm.budget ? parseFloat(inquiryForm.budget) : undefined,
            };

            // Add duration for long-term rental
            if (inquiryType === "long_term") {
                if (!inquiryForm.duration) {
                    alert("Please enter desired rental duration");
                    return;
                }
                inquiryData.duration = inquiryForm.duration;
            }

            const response = await api.post("/inquiries", inquiryData);

            if (response.data?.success) {
                const newInquiryId = response.data.data?.id;
                setShowInquiryModal(false);
                setInquiryForm({ name: "", phone: "", message: "", email: "", budget: "", duration: "", type: "" });
                // Redirect to chat window
                if (newInquiryId) {
                    router.push(`/dashboard/inquiries/${newInquiryId}`);
                } else {
                    setInquirySuccess("Inquiry sent successfully! The owner will review your message and get back to you soon.");
                    setTimeout(() => setInquirySuccess(null), 4000);
                }
            } else {
                alert(response.data?.message || "Failed to send inquiry");
            }
        } catch (error: any) {
            console.error("Error sending inquiry:", error);
            alert(error.response?.data?.message || "Failed to send inquiry. Please try again.");
        } finally {
            setInquiryLoading(false);
        }
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingError(null);
        setBookingSuccess(null);

        // Validation
        if (!checkInDate || !checkOutDate) {
            setBookingError("Please select both check-in and check-out dates");
            return;
        }

        if (!guests || guests < 1) {
            setBookingError("Please select number of guests");
            return;
        }

        if (guests > property.guests) {
            setBookingError(`Maximum ${property.guests} guests allowed for this property`);
            return;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkOut <= checkIn) {
            setBookingError("Check-out date must be after check-in date");
            return;
        }

        // Validate minimum and maximum stay
        const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        if (numberOfNights < property.minStay) {
            setBookingError(`You can book at least ${property.minStay} night${property.minStay !== 1 ? 's' : ''}`);
            return;
        }

        if (property.maxStay && numberOfNights > property.maxStay) {
            setBookingError(`Maximum stay is ${property.maxStay} night${property.maxStay !== 1 ? 's' : ''}`);
            return;
        }

        try {
            setBookingLoading(true);

            const bookingRequest: CreateShortBookingRequest = {
                propertyId: property.id,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                numberOfGuests: guests,
                paymentMethod: paymentMethod,
                specialRequests: ""
            };

            const response = await api.post("/bookings", bookingRequest);

            if (response.data?.success) {
                // Booking created successfully
                const bookingData = response.data.data;

                // Set payment data and show payment modal
                if (bookingData?.id && totalAmount > 0) {
                    setPaymentData({
                        bookingId: bookingData.id,
                        amount: totalAmount,
                        propertyTitle: property.title
                    });
                    setShowPaymentModal(true);
                }
                setBookingSuccess("Booking confirmed! Now complete the payment.");
            } else {
                setBookingError(response.data?.message || "Failed to create booking");
            }
        } catch (error: any) {
            console.error("Error creating booking:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to create booking. Please try again.";
            setBookingError(errorMessage);
        } finally {
            setBookingLoading(false);
        }
    };

    const handleToggleFavorite = async () => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }
        try {
            const response = await api.post("/favorites/toggle", {
                propertyId: property.id
            });

            if (response.data?.success) {
                const action = response.data.data?.action;
                setIsLiked(action === "added");
            }
        } catch (error: any) {
            console.error("Error toggling favorite:", error);
        }
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareText = `Check out this property: ${property.title}`;

        try {
            // Try using Web Share API if available
            if (navigator.share) {
                await navigator.share({
                    title: property.title,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            }
        } catch (error) {
            console.error("Error sharing:", error);
            // Fallback on error
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert("Link copied to clipboard!");
            } catch (clipboardError) {
                alert("Could not copy link. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Navigation */}
            <div className="sticky top-0 z-40 bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Search
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">Loading property details...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Property Header */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-medium">{property.rating}</span>
                                        <span className="text-gray-500">({property.reviewsCount} reviews)</span>
                                        <span className="mx-2">•</span>
                                        <MapPin className="w-4 h-4" />
                                        <span>{property.address}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleToggleFavorite}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                        {isLiked ? "Saved" : "Save"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={handleShare}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Share2 className="w-5 h-5" />
                                        Share
                                    </Button>
                                </div>
                            </div>

                            {/* Property Type Badges */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {property.listingType === "rent" &&
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                        {property.rentalType === "short" ? "Short Rent" : "Long Term"}
                                    </span>
                                }
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    {property.propertyType}
                                </span>
                                {property.listingType === "buy" && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                        For Sale
                                    </span>
                                )}
                                {property.epcRating && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                        EPC: {property.epcRating}
                                    </span>
                                )}
                                {property.councilTaxBand && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                        Council Tax: Band {property.councilTaxBand}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="relative mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-[5px] overflow-hidden">

                                {/* Left big image */}
                                <div
                                    className="md:col-span-2 h-105 cursor-pointer"
                                    onClick={() => setIsGalleryOpen(true)}
                                >
                                    <img
                                        src={property.images[0]}
                                        className="w-full h-full object-cover"
                                        alt="Main"
                                    />
                                </div>

                                {/* Right images */}
                                <div className="md:col-span-2 grid grid-cols-2 grid-rows-2 gap-2 h-105">
                                    {property.images.slice(1, 5).map((img: string, i: number) => (
                                        <div
                                            key={i}
                                            className="relative cursor-pointer"
                                            onClick={() => {
                                                setSelectedImage(i + 1);
                                                setIsGalleryOpen(true);
                                            }}
                                        >
                                            <img
                                                src={img}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />

                                            {/* Show all photos button */}
                                            {i === 3 && (
                                                <button className="absolute cursor-pointer bottom-3 right-3 bg-white text-sm px-4 py-2 rounded-lg shadow-md font-medium">
                                                    Show all photos
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                        {isGalleryOpen && (
                            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">

                                {/* Top bar */}
                                <div className="absolute top-4 left-4 text-white cursor-pointer"
                                    onClick={() => setIsGalleryOpen(false)}
                                >
                                    ✕ Close
                                </div>

                                <div className="absolute top-4 right-4 flex gap-4 text-white">
                                    <Share2 
                                        className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" 
                                        onClick={handleShare}
                                    />
                                    <Heart className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" />
                                </div>

                                <div className="absolute top-4 text-white text-sm">
                                    {selectedImage + 1} / {property.images.length}
                                </div>

                                {/* Image */}
                                <img
                                    src={property.images[selectedImage]}
                                    className="max-h-[85vh] max-w-[90vw] object-contain"
                                    alt=""
                                />

                                {/* Navigation */}
                                <button
                                    onClick={() =>
                                        setSelectedImage((prev) =>
                                            prev === 0 ? property.images.length - 1 : prev - 1
                                        )
                                    }
                                    className="absolute left-6 text-white text-3xl"
                                >
                                    ‹
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedImage((prev) =>
                                            prev === property.images.length - 1 ? 0 : prev + 1
                                        )
                                    }
                                    className="absolute right-6 text-white text-3xl"
                                >
                                    ›
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Images & Details */}
                            <div className="lg:col-span-2">
                                {/* Image Gallery */}



                                {/* Property Details Tabs */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                                    <TabsList className="grid w-full grid-cols-5 rounded-[5px]">
                                        <TabsTrigger className="rounded-[5px]" value="overview">Overview</TabsTrigger>
                                        <TabsTrigger className="rounded-[5px]" value="amenities">Amenities</TabsTrigger>
                                        <TabsTrigger className="rounded-[5px]" value="documents">Documents</TabsTrigger>
                                        <TabsTrigger className="rounded-[5px]" value="location">Location</TabsTrigger>
                                        <TabsTrigger className="rounded-[5px]" value="reviews">Reviews ({property.reviewsCount || 0})</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="mt-6">
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700 text-lg mb-6">{property.description}</p>

                                            {/* Property Specs Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <Bed className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold">{property.beds}</div>
                                                    <div className="text-gray-600">Bedrooms</div>
                                                </div>

                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <Bath className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold">{property.baths}</div>
                                                    <div className="text-gray-600">Bathrooms</div>
                                                </div>

                                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                    <Maximize2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                    <div className="text-2xl font-bold">{property.sqft.toLocaleString()}</div>
                                                    <div className="text-gray-600">Square Feet</div>
                                                </div>

                                                {/* Show Max Guests ONLY for Short Stay */}
                                                {property.rentalType === "short" && property.listingType === "rent" ? (
                                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                        <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                        <div className="text-2xl font-bold">{property.guests}</div>
                                                        <div className="text-gray-600">Max Guests</div>
                                                    </div>
                                                ) : (
                                                    // Show EPC Rating for Long Rent/Buy (UK requirement)
                                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                        <Home className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                                        <div className="text-2xl font-bold">{property.epcRating}</div>
                                                        <div className="text-gray-600">EPC Rating</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Additional Details based on Business Model */}
                                            {property.rentalType === "short" && property.listingType === "rent" && (
                                                <div className="mb-8">
                                                    <h3 className="text-xl font-bold mb-4">Short Rent Features</h3>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Minimum Stay</p>
                                                        <p className="font-medium text-lg">{property.minStay} Nights</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Maximum Stay</p>
                                                        <p className="font-medium text-lg">{property.maxStay} Nights</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {property.selfCheckIn && (
                                                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                                <KeyRound className="w-5 h-5 text-blue-600" />
                                                                <div>
                                                                    <p className="font-medium">Self check-in</p>
                                                                    <p className="text-sm text-gray-600">Check yourself in with the lockbox.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {property.freeParking && (
                                                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                                                <Car className="w-5 h-5 text-blue-600" />
                                                                <div>
                                                                    <p className="font-medium">Park for free</p>
                                                                    <p className="text-sm text-gray-600">This is one of the few places in the area with free parking.</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                                        <p className="font-medium text-green-800">
                                                            Free cancellation up to 48 hours before check-in
                                                        </p>
                                                        <p className="text-sm text-green-700 mt-1">
                                                            Get a full refund if you change your mind.
                                                        </p>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h4 className="font-bold mb-2">Cancellation policy</h4>
                                                        <p className="text-gray-700">
                                                            Free cancellation up to 48 hours before check-in.
                                                            If you cancel within 48 hours of check-in, a 50% refund will be provided.
                                                            No refund will be issued after the check-in time.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {property.rentalType === "long" && property.listingType === "rent" && (
                                                <div className="mb-8">
                                                    <h3 className="text-xl font-bold mb-4">Long Term Rental Details</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Available from</p>
                                                                <p className="font-medium text-lg">{formatDateToReadable(property.availableFrom)}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">Minimum term</p>
                                                                <p className="font-medium text-lg">{property.minTerm} months</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">Maximum term</p>
                                                                <p className="font-medium text-lg">{property.maxTerm} months</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Council Tax Band</p>
                                                                <p className="font-medium text-lg">{property.councilTaxBand}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">Bills included?</p>
                                                                <p className="font-medium text-lg">{property.billsIncluded ? "Yes" : "No"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">EPC Rating</p>
                                                                <p className="font-medium text-lg">{property.epcRating}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {property.listingType === "buy" && (
                                                <div className="mb-8">
                                                    <h3 className="text-xl font-bold mb-4">Property Sale Details</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Tenure</p>
                                                                <p className="font-medium text-lg">{property.leasehold ? "Leasehold" : "Freehold"}</p>
                                                            </div>
                                                            {property.leasehold && (
                                                                <>
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">Lease Years Remaining</p>
                                                                        <p className="font-medium text-lg">{property.leaseYears} years</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">Annual Ground Rent</p>
                                                                        <p className="font-medium text-lg">{property.groundRent}</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Council Tax Band</p>
                                                                <p className="font-medium text-lg">{property.councilTaxBand}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">Annual Council Tax</p>
                                                                <p className="font-medium text-lg">{property.propertyTax}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-600">Service Charge</p>
                                                                <p className="font-medium text-lg">{property.hoaFee}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="amenities" className="mt-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {property.amenities.slice(0, showAllAmenities ? property.amenities.length : 8).map((amenity: { icon: React.ReactNode; name: string }, index: number) => (
                                                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                                    <div className="text-green-600">{amenity.icon}</div>
                                                    <span>{amenity.name}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {property.amenities.length > 8 && !showAllAmenities && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowAllAmenities(true)}
                                                className="mt-4"
                                            >
                                                Show all {property.amenities.length} amenities
                                            </Button>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="documents" className="mt-6">
                                        <div className="space-y-6">
                                            <div className="bg-white border rounded-lg p-6">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <FileCheck className="w-6 h-6 text-green-600" />
                                                    <h3 className="text-xl font-bold">Required Documents</h3>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-2 text-gray-700">Common Requirements:</h4>
                                                        <ul className="space-y-2">
                                                            {property.requiredDocuments.common.map((doc: string, index: number) => (
                                                                <li key={index} className="flex items-center gap-2">
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                    <span>{doc}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {property.listingType === "rent" && property.rentalType === "short" && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-blue-700">Short Rent Requirements:</h4>
                                                            <ul className="space-y-2">
                                                                {property.requiredDocuments.shortStay.map((doc: string, index: number) => (
                                                                    <li key={index} className="flex items-center gap-2">
                                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                                        <span>{doc}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {property.listingType === "rent" && property.rentalType === "long" && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-blue-700">Long Term Rental Requirements:</h4>
                                                            <ul className="space-y-2">
                                                                {property.requiredDocuments.rent.map((doc: string, index: number) => (
                                                                    <li key={index} className="flex items-center gap-2">
                                                                        <FileSearch className="w-4 h-4 text-blue-600" />
                                                                        <span>{doc}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {property.listingType === "buy" && (
                                                        <div>
                                                            <h4 className="font-semibold mb-2 text-purple-700">Purchase Requirements:</h4>
                                                            <ul className="space-y-2">
                                                                {property.requiredDocuments.buy.map((doc: string, index: number) => (
                                                                    <li key={index} className="flex items-center gap-2">
                                                                        <Scale className="w-4 h-4 text-purple-600" />
                                                                        <span>{doc}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                                                    <p className="text-sm text-amber-800">
                                                        <strong>Note:</strong> All documents must be provided before proceeding with the transaction.
                                                        For UK properties, Right to Rent checks are mandatory for tenancies.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="reviews" className="mt-6">
                                        <div className="space-y-6">
                                            <div className="border rounded-[5px] p-6">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="flex items-center">
                                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-2xl font-bold ml-2">{property.averageRating || 0}</span>
                                                    </div>
                                                    <div className="text-gray-600">·</div>
                                                    <div>
                                                        <span className="font-medium">{property.reviewsCount || 0} reviews</span>
                                                    </div>
                                                </div>

                                                {property.reviews.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {property.reviews.map((review: any) => (
                                                            <div key={review.id} className="border-b pb-6 last:border-0">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <img
                                                                        src={review.user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070"}
                                                                        alt={`${review.user?.firstName} ${review.user?.lastName || ""}` || "Reviewer"}
                                                                        className="w-10 h-10 rounded-full object-cover"
                                                                    />
                                                                    <div>
                                                                        <p className="font-medium">{`${review.user?.firstName} ${review.user?.lastName || ""}` || "Anonymous"}</p>
                                                                        <p className="text-sm text-gray-600">
                                                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recently"}
                                                                        </p>
                                                                    </div>
                                                                    {review.isVerified && (
                                                                        <div className="ml-auto flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                            <span className="text-xs font-medium text-green-600">Verified</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex mb-2">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            size={16}
                                                                            className={`${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <p className="text-gray-700 mb-2">{review.comment}</p>
                                                                {review.helpfulCount > 0 && (
                                                                    <p className="text-sm text-gray-500">
                                                                        <ThumbsUp className="w-4 h-4 inline mr-1" />
                                                                        {review.helpfulCount} found this helpful
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                        <p className="text-gray-600">No reviews yet. Be the first to review this property!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="location" className="mt-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="">
                                                <div className="h-96 rounded-[5px] overflow-hidden">
                                                    <MapContainer
                                                        center={[property?.latitude, property?.longitude]}
                                                        zoom={13}
                                                        scrollWheelZoom={true}
                                                        style={{ height: "100%", width: "100%" }}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; OpenStreetMap contributors'
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        />

                                                        <Marker position={[property?.latitude, property?.longitude]}>
                                                            <Popup>
                                                                {property.address}
                                                            </Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="bg-white border rounded-[5px] p-6">
                                                    <h4 className="font-bold text-lg mb-4">Location Highlights</h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                                <Train className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Transport Links</p>
                                                                <p className="text-sm text-gray-600 mt-1">Canary Wharf Station (0.2 miles)</p>
                                                                <p className="text-sm text-gray-600">Jubilee Line • DLR</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                                                <ShoppingBag className="w-4 h-4 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Shopping & Dining</p>
                                                                <p className="text-sm text-gray-600 mt-1">Canary Wharf Shopping Centre</p>
                                                                <p className="text-sm text-gray-600">Multiple restaurants & cafes</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                                                <ParkingCircle className="w-4 h-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Parking</p>
                                                                <p className="text-sm text-gray-600 mt-1">Underground parking available</p>
                                                                <p className="text-sm text-gray-600">Permit zone: E14</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white border rounded-[5px] p-6">
                                                    <h4 className="font-bold text-lg mb-4">Nearby Amenities</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700">Supermarkets</span>
                                                            <span className="text-sm font-medium">3 within 0.5 miles</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700">Schools</span>
                                                            <span className="text-sm font-medium">4 within 1 mile</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700">Hospitals</span>
                                                            <span className="text-sm font-medium">Royal London (2.1 miles)</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-700">Parks</span>
                                                            <span className="text-sm font-medium">Mudchute Park (0.8 miles)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Right Column - Booking/Inquiry Panel */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 bg-white rounded-[5px] shadow-lg border p-5">
                                    {/* Price Display - DIFFERENT FOR EACH BUSINESS MODEL */}
                                    <div className="mb-6">
                                        {property.listingType === "buy" ? (
                                            // BUY: Show total amount
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-gray-900">{property.propertyPrice}</span>
                                                    <span className="text-gray-600">total</span>
                                                </div>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Council Tax (Band {property.councilTaxBand})</span>
                                                        <span className="font-medium">{property.propertyTax}</span>
                                                    </div>
                                                    {property.leasehold && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Service Charge</span>
                                                                <span className="font-medium">{property.hoaFee}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Ground Rent</span>
                                                                <span className="font-medium">{property.groundRent}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : property.rentalType === "long" ? (
                                            // LONG RENT: Show monthly price with deposit
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-gray-900">{property.price}</span>
                                                    <span className="text-gray-600">/ month</span>
                                                </div>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Security Deposit</span>
                                                        <span className="font-medium">{property.securityDeposit}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Council Tax (Band {property.councilTaxBand})</span>
                                                        <span className="font-medium">{property.propertyTax}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Bills included?</span>
                                                        <span className="font-medium">{property.billsIncluded ? "Yes" : "No"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // SHORT STAY: Show nightly price
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-bold text-gray-900">{property.price}</span>
                                                    <span className="text-gray-600">/ night</span>
                                                </div>
                                                {property.originalPrice && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-lg text-gray-500 line-through">{property.originalPrice}</span>
                                                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                                            7% off
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Dynamic Form based on Business Model */}
                                    {property.rentalType === "short" && property.listingType === "rent" ? (
                                        // Short Stay Booking Form
                                        <form onSubmit={handleBookingSubmit} className="space-y-4 mb-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Check-in
                                                    </label>
                                                    <input
                                                        type="date"
                                                        title="Check-in date"
                                                        value={checkInDate}
                                                        onChange={(e) => setCheckInDate(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Check-out
                                                    </label>
                                                    <input
                                                        type="date"
                                                        title="Check-out date"
                                                        value={checkOutDate}
                                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Guests (Max: {property.guests})
                                                </label>
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                                        className="px-3 py-2 text-gray-600 hover:text-gray-900"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="flex-1 text-center">{guests} guests</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setGuests(Math.min(property.guests, guests + 1))}
                                                        className="px-3 py-2 text-gray-600 hover:text-gray-900"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Payment Method
                                                </label>
                                                <select
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    <option value={PaymentMethod.CREDIT_CARD}>Credit Card</option>
                                                    <option value={PaymentMethod.DEBIT_CARD}>Debit Card</option>
                                                    <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</option>
                                                    <option value={PaymentMethod.WALLET}>Wallet</option>
                                                </select>
                                            </div>

                                            {/* Price Breakdown - Show only when dates are selected */}
                                            {nights > 0 && (
                                                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                                    <h4 className="font-bold text-gray-900">Price Breakdown</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                £{parsePrice(property.price).toFixed(2)} × {nights} night{nights !== 1 ? 's' : ''}
                                                            </span>
                                                            <span className="font-medium">£{subtotal.toFixed(2)}</span>
                                                        </div>
                                                        {cleaningFeeAmount > 0 && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Cleaning fee</span>
                                                                <span className="font-medium">£{cleaningFeeAmount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        {serviceFeeAmount > 0 && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Service fee</span>
                                                                <span className="font-medium">£{serviceFeeAmount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                            <span className="font-bold text-gray-900">Total</span>
                                                            <span className="text-2xl font-bold text-green-600">£{totalAmount.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error Message */}
                                            {bookingError && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                                    {bookingError}
                                                </div>
                                            )}

                                            {/* Success Message with Booking Confirmation */}
                                            {bookingSuccess && (
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-start gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-green-900">{bookingSuccess}</p>
                                                            <p className="text-sm text-green-700 mt-1">
                                                                Check your email for booking confirmation and payment details.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Book Now Button for Short Stay */}
                                            <Button
                                                type="submit"
                                                disabled={bookingLoading}
                                                className="w-full rounded-[5px] py-6 text-lg font-semibold mb-4 bg-linear-to-r from-green-600 to-emerald-600 cursor-pointer disabled:opacity-50"
                                            >
                                                {bookingLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Calendar className="w-5 h-5" />
                                                        Book Now
                                                    </span>
                                                )}
                                            </Button>

                                            <div className="text-center text-sm text-gray-500">
                                                <p>🔒 Secure payment processed by Hously</p>
                                            </div>
                                        </form>
                                    ) : (
                                        // Long Rent or Buy - Inquiry Button
                                        <div className="space-y-4 mb-6">
                                            {isLoggedIn ? (
                                                <Button
                                                    onClick={() => setShowInquiryModal(true)}
                                                    className="w-full rounded-[5px] py-6 text-lg font-semibold mb-4 bg-linear-to-r from-green-600 to-emerald-600 cursor-pointer"
                                                >
                                                    <MessageCircle className="w-5 h-5 mr-2" />
                                                    Send Inquiry
                                                </Button>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-gray-600 text-center">Sign in to contact the owner</p>
                                                    <Button
                                                        onClick={() => router.push(`/login?redirect=/property/${property.id}`)}
                                                        className="w-full rounded-[5px] py-5 font-semibold bg-linear-to-r from-green-600 to-emerald-600 cursor-pointer"
                                                    >
                                                        Log In to Send Inquiry
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push(`/signup?redirect=/property/${property.id}`)}
                                                        className="w-full rounded-[5px] py-5 font-semibold cursor-pointer"
                                                    >
                                                        Create Account
                                                    </Button>
                                                </div>
                                            )}
                                            <div className="text-center text-sm text-gray-500">
                                                <p>Contact owner directly via inquiry</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Owner/Contact Info - Only for Short Stay */}
                                    {/* {property.rentalType === "short" && property.listingType === "rent" && ( */}
                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-bold mb-4">Contact</h4>
                                            <div className="flex items-center gap-3 mb-4">
                                                <img
                                                    src={property.owner.avatar || img}
                                                    alt={property.owner.name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-medium">{property.owner.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {property.owner.verified && (
                                                            <span className="text-green-600 mr-2">✓ Verified</span>
                                                        )}
                                                        Joined {property.owner.joined}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Response time: {property.owner.responseTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>Response rate: {property.owner.responseRate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    {/* )} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Modal */}
                    {showInquiryModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-[5px] shadow-xl max-w-md w-full p-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold">
                                        {property.listingType === "buy" ? "Property Inquiry" : "Rental Inquiry"}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowInquiryModal(false)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <form onSubmit={handleInquirySubmit} className="space-y-4">
                                    {!isLoggedIn ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={inquiryForm.name}
                                                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[5px]"
                                                    placeholder="Enter your name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={inquiryForm.phone}
                                                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[5px]"
                                                    placeholder="Enter your phone number"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={inquiryForm.email}
                                                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-[5px]"
                                                    placeholder="Enter your email address"
                                                    required
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <User className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <p className="font-medium">Logged in as User</p>
                                                <p className="text-sm text-gray-600">Your details will be shared with the owner</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Duration Field - Only for Long-term Rental */}
                                    {property.listingType === "rent" && property.rentalType === "long" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Desired Duration (Months) (Required)
                                            </label>
                                            <input
                                                type="number"
                                                value={inquiryForm.duration}
                                                onChange={(e) => setInquiryForm({ ...inquiryForm, duration: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-[5px]"
                                                placeholder="Enter number of months"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Message {isLoggedIn && "(Required)"}
                                        </label>
                                        <textarea
                                            value={inquiryForm.message}
                                            onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-[5px] h-32"
                                            placeholder={
                                                property.listingType === "buy"
                                                    ? "I'm interested in viewing this property. Please provide more details about..."
                                                    : property.rentalType === "long"
                                                        ? "I'm interested in renting this property starting from [date]. Please send availability and terms..."
                                                        : "Tell the owner about your interest..."
                                            }
                                            required
                                        />
                                    </div>

                                    <Button type="submit" disabled={inquiryLoading} className="w-full py-3 rounded-[5px] cursor-pointer disabled:opacity-50">
                                        {inquiryLoading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Mail className="w-5 h-5" />
                                                Send Inquiry
                                            </span>
                                        )}
                                    </Button>

                                    <p className="text-xs text-gray-500 text-center">
                                        Your inquiry will be sent directly to the property owner.
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Inquiry Success Modal */}
                    {inquirySuccess && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-[5px] shadow-xl max-w-md w-full p-6 text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Sent!</h3>
                                <p className="text-gray-600 mb-6">
                                    {inquirySuccess}
                                </p>

                                <div className="space-y-3">
                                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        We've sent you a confirmation email
                                    </p>
                                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 8a1 1 0 000 2h6a1 1 0 100-2H8zm0 4a1 1 0 100 2h3a1 1 0 100-2H8z" clipRule="evenodd" />
                                        </svg>
                                        Owner will review your message soon
                                    </p>
                                </div>

                                <Button
                                    onClick={() => setInquirySuccess(null)}
                                    className="w-full mt-6 rounded-[5px] py-2 cursor-pointer"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Razorpay Payment Modal */}
                    {showPaymentModal && paymentData && (
                        <RazorpayPaymentModal
                            isOpen={showPaymentModal}
                            bookingId={paymentData.bookingId}
                            amount={paymentData.amount}
                            propertyTitle={paymentData.propertyTitle}
                            onClose={() => {
                                setShowPaymentModal(false);
                                setPaymentData(null);
                            }}
                            onPaymentSuccess={() => {
                                setShowPaymentModal(false);
                                setPaymentData(null);
                                setCheckInDate("");
                                setCheckOutDate("");
                                setGuests(2);
                                // Show success message
                                setBookingSuccess("Payment completed successfully! Your booking is confirmed.");
                                setTimeout(() => setBookingSuccess(null), 5000);
                            }}
                            onPaymentError={(error: string) => {
                                setBookingError(error);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}