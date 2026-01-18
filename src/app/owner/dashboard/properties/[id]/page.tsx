"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  MapPin, 
  Star, 
  Bed, 
  Bath, 
  Maximize2,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Share2,
  Download,
  TrendingUp,
  Hotel,
  Home,
  Users,
  Wifi,
  Car,
  Wind,
  Utensils,
  Tv,
  Shield,
  ChevronLeft,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

// Mock property data - in real app, fetch from API
const mockProperty = {
  id: "PROP001",
  title: "Seaside Luxury Villa",
  address: "Beach Road, Goa, India",
  description: "Stunning modern villa with panoramic ocean views, private pool, and premium amenities. Perfect for luxury vacations and special occasions.",
  
  listingType: "rent",
  rentalType: "short",
  
  pricing: {
    nightly: 45000,
    monthly: 1200000,
    cleaningFee: 5000,
    serviceFee: 3500,
    securityDeposit: 90000,
  },
  
  details: {
    propertyType: "villa",
    beds: 4,
    baths: 3,
    sqft: 2800,
    guests: 8,
    minStay: 2,
    maxStay: 30,
    yearBuilt: 2020,
    parking: 2,
  },
  
  amenities: ["wifi", "parking", "ac", "kitchen", "tv", "pool", "gym", "security"],
  
  images: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070",
    "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?q=80&w=2068",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974",
  ],
  
  performance: {
    rating: 4.8,
    reviews: 124,
    bookings: 12,
    revenue: 540000,
    occupancy: 85,
    lastBooking: "2024-01-05",
    averageStay: 4,
    conversion: 42,
  },
  
  status: "active",
  createdAt: "2023-11-15",
  lastUpdated: "2024-01-10",
};

const amenitiesList = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "tv", label: "TV", icon: Tv },
  { id: "pool", label: "Swimming Pool", icon: Wind },
  { id: "gym", label: "Gym", icon: Wind },
  { id: "security", label: "Security", icon: Shield },
];

export default function PropertyDetailsPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const property = mockProperty;

  const getListingTypeBadge = () => {
    if (property.listingType === "buy") {
      return {
        text: "For Sale",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: TrendingUp,
      };
    }
    if (property.rentalType === "short") {
      return {
        text: "Short Stay",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: Hotel,
      };
    }
    return {
      text: "Long Term",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Calendar,
    };
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case "active":
        return {
          text: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "inactive":
        return {
          text: "Inactive",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: XCircle,
        };
      case "maintenance":
        return {
          text: "Maintenance",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertCircle,
        };
      default:
        return {
          text: "Draft",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Clock,
        };
    }
  };

  const listingBadge = getListingTypeBadge();
  const ListingIcon = listingBadge.icon;
  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/owner/dashboard/properties" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Properties
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                {property.address}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${listingBadge.color}`}>
                <ListingIcon className="w-3 h-3 inline mr-1" />
                {listingBadge.text}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{property.performance.rating}</span>
                <span className="text-gray-500">({property.performance.reviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Link href={`/owner/dashboard/properties/${property.id}/edit`}>
              <Button>
                <Edit className="w-4 h-4 mr-2" />
                Edit Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-[5px] border overflow-hidden">
            <div className="relative h-64 md:h-96">
              <img
                src={property.images[selectedImage]}
                alt={property.title}
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
                {selectedImage + 1} / {property.images.length}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 p-4">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-green-500" : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Property ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700">{property.description}</p>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bed className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.details.beds}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bath className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.details.baths}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Maximize2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.details.sqft.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Square Feet</div>
              </div>

              {property.listingType === "rent" && property.rentalType === "short" && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{property.details.guests}</div>
                  <div className="text-sm text-gray-600">Max Guests</div>
                </div>
              )}

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Home className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.details.yearBuilt}</div>
                <div className="text-sm text-gray-600">Year Built</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Car className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.details.parking}</div>
                <div className="text-sm text-gray-600">Parking Spaces</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesList.map((amenity) => {
                const Icon = amenity.icon;
                const hasAmenity = property.amenities.includes(amenity.id);
                
                return (
                  <div 
                    key={amenity.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      hasAmenity ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${hasAmenity ? "text-green-600" : "text-gray-400"}`} />
                    <span className={`font-medium ${hasAmenity ? "text-green-700" : "text-gray-700"}`}>
                      {amenity.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <div className="bg-white rounded-[5px] border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${statusBadge.color.includes('green') ? 'text-green-600' : 
                  statusBadge.color.includes('yellow') ? 'text-yellow-600' : 'text-gray-600'}`} />
                <span className="font-medium">Status</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                {statusBadge.text}
              </div>
            </div>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                View Public Listing
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Occupancy Rate</span>
                  <span className={`font-bold ${property.performance.occupancy >= 80 ? "text-green-600" : "text-yellow-600"}`}>
                    {property.performance.occupancy}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${property.performance.occupancy >= 80 ? "bg-green-500" : "bg-yellow-500"}`}
                    style={{ width: `${property.performance.occupancy}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Bookings</div>
                  <div className="text-xl font-bold text-gray-900">{property.performance.bookings}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                  <div className="text-xl font-bold text-gray-900">{property.performance.conversion}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Avg Stay</div>
                  <div className="text-xl font-bold text-gray-900">{property.performance.averageStay} days</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className="text-xl font-bold text-gray-900">{property.performance.rating}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(property.performance.revenue)}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h3>
            
            <div className="space-y-4">
              {property.listingType === "rent" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {property.rentalType === "short" ? "Per night" : "Monthly rent"}
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        property.rentalType === "short" 
                          ? property.pricing.nightly 
                          : property.pricing.monthly
                      )}
                    </span>
                  </div>
                  
                  {property.rentalType === "short" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cleaning fee</span>
                        <span className="font-medium">{formatCurrency(property.pricing.cleaningFee)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-medium">{formatCurrency(property.pricing.serviceFee)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Security deposit</span>
                        <span className="font-medium">{formatCurrency(property.pricing.securityDeposit)}</span>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Min stay</span>
                          <span className="font-medium">{property.details.minStay} nights</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Max stay</span>
                          <span className="font-medium">{property.details.maxStay} nights</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sale Price</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(property.pricing.nightly * 240)} {/* Example calculation */}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Property ID</span>
                <span className="font-medium">{property.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Listed on</span>
                <span className="font-medium">{new Date(property.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last updated</span>
                <span className="font-medium">{new Date(property.lastUpdated).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last booking</span>
                <span className="font-medium">{new Date(property.performance.lastBooking).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}