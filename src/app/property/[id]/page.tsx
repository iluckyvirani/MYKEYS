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
    Train
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

// Mock property data - London based
const mockPropertyData = {
    id: 1,
    title: "Modern Luxury Apartment in Canary Wharf",
    address: "25 Harbour Exchange Square, Canary Wharf, London E14 9GE",
    description: "Stunning modern apartment with panoramic views of the River Thames. Features 3 bedrooms, 2 bathrooms, open-plan living, and premium finishes throughout. Perfect for city living or investment.",

    // Property types based on your business model
    listingType: "buy", // "rent" or "buy"
    rentalType: "long", // "short" or "long"
    priceType: "nightly", // "nightly", "monthly", "total"

    // Pricing - UK format
    price: "£2,800",
    originalPrice: "£3,000",
    securityDeposit: "£3,360", // Typically 5-6 weeks rent in UK
    cleaningFee: "£150",
    serviceFee: "£85",

    // Property specs
    beds: 3,
    baths: 2,
    sqft: 1200,
    guests: 4,
    propertyType: "Apartment",

    // Short Stay specific
    minStay: 2,
    maxStay: 30,
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    selfCheckIn: true,
    freeParking: false,
    cancellationPolicy: "Free cancellation up to 48 hours before check-in. Cancel within 48 hours for a 50% refund.",

    // Long Rent specific
    availableFrom: "1st March 2024",
    minTerm: 12, // months (standard in UK)
    maxTerm: 24, // months
    billsIncluded: false,
    councilTaxBand: "D", // UK specific
    epcRating: "B", // UK Energy Performance Certificate

    // Sale specific
    propertyPrice: "£850,000",
    propertyTax: "£2,500/year", // UK council tax
    hoaFee: "£250/month", // Service charge in UK
    leasehold: true, // Common in UK
    leaseYears: 125,
    groundRent: "£350/year",

    // Required Documents for UK properties
    requiredDocuments: {
        // Common for all types
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

    // Amenities
    amenities: [
        { name: "Fibre Broadband", icon: <Wifi className="w-5 h-5" /> },
        { name: "Underground Parking", icon: <Car className="w-5 h-5" /> },
        { name: "Central Heating", icon: <Wind className="w-5 h-5" /> },
        { name: "Fitted Kitchen", icon: <Utensils className="w-5 h-5" /> },
        { name: "Smart TV", icon: <Tv className="w-5 h-5" /> },
        { name: "Balcony", icon: <Droplets className="w-5 h-5" /> },
        { name: "Concierge", icon: <Shield className="w-5 h-5" /> },
    ],

    // Images
    images: [
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070",
        "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=2068",
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974",
    ],

    // Owner info (only for short stay)
    owner: {
        name: "James Wilson",
        joined: "January 2019",
        verified: true,
        responseRate: "95%",
        responseTime: "within 2 hours",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070",
    },

    // Reviews
    rating: 4.85,
    reviewsCount: 89,
    reviews: [
        {
            id: 1,
            user: "Emily Thompson",
            date: "January 2024",
            rating: 5,
            comment: "Excellent location and beautifully maintained property. The process was smooth and professional.",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1974",
        },
    ],
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [inquiryForm, setInquiryForm] = useState({
        name: "",
        phone: "",
        message: ""
    });
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [property, setProperty] = useState<any>(mockPropertyData);
    const [loading, setLoading] = useState(true);

    // Fetch property data from API
    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const id = params?.id;
                if (!id) return;

                const response = await api.get(`/properties/${id}`);

                if (response.data?.success && response.data.data) {
                    const apiData = response.data.data;

                    // Map API response to component format, fallback to mock data for missing fields
                    const mappedData = {
                        ...mockPropertyData,
                        id: apiData.id || mockPropertyData.id,
                        title: apiData.title || mockPropertyData.title,
                        address: `${apiData.address || mockPropertyData.address}`,
                        city: apiData.city || "London",
                        state: apiData.state || "UK",
                        description: apiData.description || mockPropertyData.description,
                        listingType: apiData.listingType?.toLowerCase() || mockPropertyData.listingType,
                        rentalType: apiData.rentalType?.toLowerCase() === "short_term" ? "short" : "long",
                        priceType: apiData.priceType?.toLowerCase() || mockPropertyData.priceType,
                        price: `£${apiData.price}` || mockPropertyData.price,
                        beds: apiData.bedrooms || mockPropertyData.beds,
                        baths: apiData.bathrooms || mockPropertyData.baths,
                        sqft: apiData.sqft || mockPropertyData.sqft,
                        propertyType: apiData.propertyType || mockPropertyData.propertyType,
                        minStay: apiData.minStay || mockPropertyData.minStay,
                        maxStay: apiData.maxStay || mockPropertyData.maxStay,
                        minLease: apiData.minLease || mockPropertyData.minTerm,
                        images: apiData.images?.map((img: any) => img.url) || mockPropertyData.images,
                        amenities: apiData.amenities?.map((amenity: any) => ({
                            name: amenity.name,
                            icon: <Wifi className="w-5 h-5" /> // Fallback icon
                        })) || mockPropertyData.amenities,
                        rating: apiData.averageRating || mockPropertyData.rating,
                        reviewsCount: apiData.reviewCount || mockPropertyData.reviewsCount,
                        reviews: apiData.reviews || mockPropertyData.reviews,
                        owner: apiData.owner ? {
                            name: apiData.owner.name || "Property Owner",
                            joined: "Active",
                            verified: true,
                            responseRate: "95%",
                            responseTime: "within 2 hours",
                            avatar: apiData.owner.profileImage || mockPropertyData.owner.avatar,
                        } : mockPropertyData.owner,
                    };

                    setProperty(mappedData);
                }
            } catch (error) {
                console.error("Error fetching property:", error);
                // Keep using mock data on error
                setProperty(mockPropertyData);
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [params?.id]);

    // Get documents based on listing type
    const getRequiredDocuments = () => {
        const docs = [...property.requiredDocuments.common];

        if (property.listingType === "rent") {
            if (property.rentalType === "short") {
                docs.push(...property.requiredDocuments.shortStay);
            } else {
                docs.push(...property.requiredDocuments.rent);
            }
        } else if (property.listingType === "buy") {
            docs.push(...property.requiredDocuments.buy);
        }

        return docs;
    };

    const handleInquirySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Inquiry submitted:", inquiryForm);
        setShowInquiryModal(false);
        setInquiryForm({ name: "", phone: "", message: "" });
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
                                        onClick={() => setIsLiked(!isLiked)}
                                        className="flex items-center gap-2"
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                        Save
                                    </Button>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Share2 className="w-5 h-5" />
                                        Share
                                    </Button>
                                </div>
                            </div>

                            {/* Property Type Badges */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {property.rentalType === "short" ? "Short Rent" : "Long Term"}
                                </span>
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
                                    <Share2 className="w-5 h-5 cursor-pointer" />
                                    <Heart className="w-5 h-5 cursor-pointer" />
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

                                        <TabsTrigger className="rounded-[5px]" value="reviews">Reviews ({property.reviewsCount})</TabsTrigger>
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
                                                        <p className="text-gray-700">{property.cancellationPolicy}</p>
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
                                                                <p className="font-medium text-lg">{property.availableFrom}</p>
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
                                                        <span className="text-2xl font-bold ml-2">{property.rating}</span>
                                                    </div>
                                                    <div className="text-gray-600">·</div>
                                                    <div>
                                                        <span className="font-medium">{property.reviewsCount} reviews</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {property.reviews.map((review: { id: number; avatar: string; user: string; date: string; rating: number; comment: string }) => (
                                                        <div key={review.id} className="border-b pb-6 last:border-0">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <img
                                                                    src={review.avatar}
                                                                    alt={review.user}
                                                                    className="w-10 h-10 rounded-full"
                                                                />
                                                                <div>
                                                                    <p className="font-medium">{review.user}</p>
                                                                    <p className="text-sm text-gray-600">{review.date}</p>
                                                                </div>
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
                                                            <p className="text-gray-700">{review.comment}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="location" className="mt-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="">
                                                <div className="h-96 bg-gray-200 rounded-[5px] overflow-hidden relative">
                                                    {/* Interactive Map Placeholder - You can integrate Google Maps or Mapbox here */}
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <MapPin className="w-8 h-8 text-green-600" />
                                                            </div>
                                                            <p className="text-gray-600 font-medium">Interactive Map</p>
                                                            <p className="text-gray-500 text-sm mt-1">Google Maps or Mapbox integration</p>
                                                        </div>
                                                    </div>

                                                    {/* Map controls overlay */}
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button className="bg-white p-2 rounded-[5px] shadow-lg hover:bg-gray-50 transition-colors">
                                                            <span className="text-sm font-medium">Satellite</span>
                                                        </button>
                                                        <button className="bg-white p-2 rounded-[5px] shadow-lg hover:bg-gray-50 transition-colors">
                                                            <span className="text-sm font-medium">Street View</span>
                                                        </button>
                                                    </div>

                                                    {/* Location pin */}
                                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                        <div className="relative">
                                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                                                <MapPin className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                                                                <span className="text-sm font-medium">{property.address.split(',')[0]}</span>
                                                            </div>
                                                        </div>
                                                    </div>
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
                                        <div className="space-y-4 mb-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Check-in
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={checkInDate}
                                                        onChange={(e) => setCheckInDate(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Check-out
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={checkOutDate}
                                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Guests
                                                </label>
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                                        className="px-3 py-2 text-gray-600 hover:text-gray-900"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="flex-1 text-center">{guests} guests</span>
                                                    <button
                                                        onClick={() => setGuests(guests + 1)}
                                                        className="px-3 py-2 text-gray-600 hover:text-gray-900"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Book Now Button for Short Stay */}
                                            <Button className="w-full rounded-[5px] py-6 text-lg font-semibold mb-4 bg-linear-to-r from-green-600 to-emerald-600 cursor-pointer">
                                                <Calendar className="w-5 h-5 mr-2" />
                                                Book Now
                                            </Button>

                                            <div className="text-center text-sm text-gray-500">
                                                <p>🔒 Secure payment processed by Hously</p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Long Rent or Buy - Inquiry Button
                                        <div className="space-y-4 mb-6">
                                            <Button
                                                onClick={() => setShowInquiryModal(true)}
                                                className="w-full rounded-[5px] py-6 text-lg font-semibold mb-4 bg-linear-to-r from-green-600 to-emerald-600 cursor-pointer"
                                            >
                                                <MessageCircle className="w-5 h-5 mr-2" />
                                                Send Inquiry
                                            </Button>

                                            <div className="text-center text-sm text-gray-500">
                                                <p>Contact owner directly via call or message</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Owner/Contact Info - Only for Short Stay */}
                                    {property.rentalType === "short" && property.listingType === "rent" && (
                                        <div className="mt-6 pt-6 border-t">
                                            <h4 className="font-bold mb-4">Contact</h4>
                                            <div className="flex items-center gap-3 mb-4">
                                                <img
                                                    src={property.owner.avatar}
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

            // {/* Inquiry Modal */}
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

                                    <Button type="submit" className="w-full py-3 rounded-[5px] cursor-pointer">
                                        <Mail className="w-5 h-5 mr-2" />
                                        Send Inquiry
                                    </Button>

                                    <p className="text-xs text-gray-500 text-center">
                                        Your inquiry will be sent directly to the property owner.
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}