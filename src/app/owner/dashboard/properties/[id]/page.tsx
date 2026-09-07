"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { renderAmenityIcon } from "@/components/dashboard/AdminAmenityModal";
import PropertyDocumentsTab from "@/components/owner/PropertyDocumentsTab";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  MapPin, 
  Star, 
  Bed, 
  Bath, 
  Maximize2,
  Calendar,
  Edit,
  Download,
  TrendingUp,
  Hotel,
  Home,
  Users,
  Car,
  ChevronLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface PropertyData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  propertyType: string;
  listingType: string;
  rentalType: string | null;
  price: number;
  priceType: string;
  originalPrice: number | null;
  cleaningFee: number | null;
  serviceFee: number | null;
  securityDeposit: number | null;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  guests: number;
  minStay: number;
  maxStay: number | null;
  yearBuilt: number | null;
  checkInTime: string;
  checkOutTime: string;
  selfCheckIn: boolean;
  parking: boolean;
  status: string;
  isFeatured: boolean;
  isVerified: boolean;
  views: number;
  saves: number;
  occupancy: number;
  revenue: number;
  propertyPrice: number | null;
  propertyTax: number | null;
  hoaFee: number | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  images: {
    id: string;
    url: string;
    caption: string | null;
    isPrimary: boolean;
  }[];
  amenities: {
    id: string;
    amenity: {
      id: string;
      name: string;
      icon: string | null;
      category: string;
    };
  }[];
  reviews: any[];
  bookings: any[];
  averageRating: number;
  reviewCount: number;
}



export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/properties/${params.id}`);
        
        if (response.data?.success) {
          setProperty(response.data.data);
        } else {
          setError("Failed to load property");
        }
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err.response?.data?.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !property) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "The property you're looking for doesn't exist."}</p>
            <Link href="/owner/dashboard/properties">
              <Button variant="outline" className="flex items-center gap-2 rounded-[5px]">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getListingTypeBadge = () => {
    if (property.listingType === "BUY") {
      return {
        text: "For Sale",
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: TrendingUp,
      };
    }
    if (property.rentalType === "SHORT_TERM") {
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

  const getStatusBadge = () => {
    switch (property.status?.toUpperCase()) {
      case "ACTIVE":
        return {
          text: "Active",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case "INACTIVE":
        return {
          text: "Inactive",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: XCircle,
        };
      case "MAINTENANCE":
        return {
          text: "Maintenance",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertCircle,
        };
      case "SOLD":
        return {
          text: "Sold",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: CheckCircle,
        };
      case "RENTED":
        return {
          text: "Rented",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: CheckCircle,
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
  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const hasCoordinates =
    typeof property.latitude === "number" &&
    typeof property.longitude === "number" &&
    property.latitude >= -90 &&
    property.latitude <= 90 &&
    property.longitude >= -180 &&
    property.longitude <= 180;
  const mapEmbedUrl = hasCoordinates && mapApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=${property.latitude},${property.longitude}&zoom=15`
    : "";

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/owner/dashboard/properties" 
              className="flex items-center gap-2 hover:text-gray-900 mb-4"
            >
            <Button
            variant="outline"
            className="rounded-[5px] flex items-center gap-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
          </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-4 h-4" />
                {property.address}, {property.city}, {property.state}
                {property.zipCode ? ` ${property.zipCode}` : ""}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${listingBadge.color}`}>
                <ListingIcon className="w-3 h-3 inline mr-1" />
                {listingBadge.text}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{property.averageRating?.toFixed(1) || "0.0"}</span>
                <span className="text-gray-500">({property.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href={`/owner/dashboard/properties/${property.id}/edit`}>
              <Button className="cursor-pointer">
                <Edit className="w-4 h-4 mr-2" />
                Edit Property
              </Button>
            </Link>
            {property.listingType === "RENT" && property.rentalType === "SHORT_TERM" && (
              <Link href={`/owner/dashboard/properties/${property.id}/boost?from=property`}>
                <Button className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Boost
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-[5px] border overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <>
                <div className="relative h-64 md:h-96">
                  <img
                    src={property.images[selectedImage]?.url || ''}
                    alt={property.images[selectedImage]?.caption || property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
                    {selectedImage + 1} / {property.images.length}
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 p-4">
                  {property.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? "border-green-500" : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.caption || `Property ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 md:h-96 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700">{property.description}</p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">City</p>
                <p className="font-semibold text-gray-900">{property.city || "-"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">State</p>
                <p className="font-semibold text-gray-900">{property.state || "-"}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Zip Code</p>
                <p className="font-semibold text-gray-900">{property.zipCode || "-"}</p>
              </div>
            </div>

            <div className="h-56 rounded-[5px] border overflow-hidden bg-gray-50">
              {mapEmbedUrl ? (
                <iframe
                  title="Property location map"
                  src={mapEmbedUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 px-4 text-center">
                  Map preview unavailable. Add valid latitude and longitude for this property.
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bed className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                <div className="text-sm text-gray-600">Bedrooms</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bath className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                <div className="text-sm text-gray-600">Bathrooms</div>
              </div>

              {property.sqft && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Maximize2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{property.sqft.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Square Feet</div>
                </div>
              )}

              {property.listingType === "RENT" && property.rentalType === "SHORT_TERM" && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{property.guests}</div>
                  <div className="text-sm text-gray-600">Max Guests</div>
                </div>
              )}

              {property.yearBuilt && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{property.yearBuilt}</div>
                  <div className="text-sm text-gray-600">Year Built</div>
                </div>
              )}

              {property.parking && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Car className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{property.parking ? 'Yes' : 'No'}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Amenities</h3>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {property.amenities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                  >
                    <span className="text-green-600 shrink-0">
                      {renderAmenityIcon(item.amenity.icon as string ?? "", "w-5 h-5")}
                    </span>
                    <span className="font-medium text-green-700 text-sm">
                      {item.amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No amenities listed</p>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-[5px] border p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Property Documents</h3>
            </div>
            <PropertyDocumentsTab propertyId={property.id} />
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-[5px] border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold text-gray-900">{property.averageRating?.toFixed(1) || "0.0"}</span>
                <span className="text-gray-600">({property.reviewCount || 0} reviews)</span>
              </div>
            </div>
            
            {property.reviews && property.reviews.length > 0 ? (
              <div className="space-y-4">
                {property.reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{review.user?.firstName || 'Anonymous'} {review.user?.lastName || ''}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <div className="bg-white rounded-[5px] border p-6 space-y-4">
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
            
            <div className="flex gap-2 flex-col">
              <Link href="/owner/dashboard/bookings">
                <Button variant="outline" className="w-full justify-start cursor-pointer">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Bookings
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start cursor-pointer" onClick={() => {
                const data = JSON.stringify(property, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `property-${property.id}-data.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
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
                  <span className={`font-bold ${property.occupancy >= 80 ? "text-green-600" : "text-yellow-600"}`}>
                    {property.occupancy}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${property.occupancy >= 80 ? "bg-green-500" : "bg-yellow-500"}`}
                    style={{ width: `${property.occupancy}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Views</div>
                  <div className="text-xl font-bold text-gray-900">{property.views}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Saves</div>
                  <div className="text-xl font-bold text-gray-900">{property.saves}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Bookings</div>
                  <div className="text-xl font-bold text-gray-900">{property.bookings?.length || 0}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className="text-xl font-bold text-gray-900">{property.averageRating?.toFixed(1) || "0.0"}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(property.revenue)}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white rounded-[5px] border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h3>
            
            <div className="space-y-4">
              {property.listingType === "RENT" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {property.rentalType === "SHORT_TERM" ? "Per night" : "Monthly rent"}
                    </span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(property.price)}
                    </span>
                  </div>
                  
                  {property.rentalType === "SHORT_TERM" && (
                    <>
                      {property.cleaningFee && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Cleaning fee</span>
                          <span className="font-medium">{formatCurrency(property.cleaningFee)}</span>
                        </div>
                      )}
                      {property.serviceFee && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatCurrency(property.serviceFee)}</span>
                        </div>
                      )}
                      {property.securityDeposit && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Security deposit</span>
                          <span className="font-medium">{formatCurrency(property.securityDeposit)}</span>
                        </div>
                      )}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Min stay</span>
                          <span className="font-medium">{property.minStay} nights</span>
                        </div>
                        {property.maxStay && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Max stay</span>
                            <span className="font-medium">{property.maxStay} nights</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sale Price</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(property.propertyPrice || property.price)}
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
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">City</span>
                <span className="font-medium text-right">{property.city || "-"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">State</span>
                <span className="font-medium text-right">{property.state || "-"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-600">Zip Code</span>
                <span className="font-medium text-right">{property.zipCode || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last updated</span>
                <span className="font-medium">{new Date(property.updatedAt).toLocaleDateString()}</span>
              </div>
              {property.bookings && property.bookings.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Active bookings</span>
                  <span className="font-medium">{property.bookings.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}