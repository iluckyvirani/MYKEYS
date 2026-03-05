"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Building, Star, Home, AlertCircle, Users, DollarSign, Eye, Calendar, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    params.then((resolvedParams) => {
      setPropertyId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyData();
    }
  }, [propertyId]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/admin/properties/${propertyId}`);
      if (response.data?.data) {
        setPropertyData(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching property data:", err);
      setError(err.response?.data?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Details</h1>
            {propertyData && <p className="text-gray-600 mt-2">{propertyData.property.title}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : propertyData ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-[8px] border p-4 flex gap-2 border-b overflow-x-auto">
            {["overview", "owner", "bookings", "reviews", "inquiries"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Property Image */}
              {propertyData.images?.length > 0 && (
                <Card className="rounded-[8px] overflow-hidden">
                  <img
                    src={propertyData.images[0]?.url || "/api/placeholder/800/400"}
                    alt={propertyData.property.title}
                    className="w-full h-96 object-cover"
                  />
                </Card>
              )}

              {/* Basic Info Card */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-[8px] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{propertyData.property.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {propertyData.property.address}, {propertyData.property.city}, {propertyData.property.state}
                    </div>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {propertyData.property.propertyType}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        propertyData.property.status === "ACTIVE" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {propertyData.property.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {propertyData.avgRating > 0 && (
                      <div className="flex items-center gap-1 justify-end mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(propertyData.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="ml-2 font-bold text-gray-900">{propertyData.avgRating}</span>
                      </div>
                    )}
                    <p className="text-lg font-bold text-orange-600">₹{propertyData.property.price.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-gray-600">{propertyData.property.priceType}</p>
                  </div>
                </div>
              </div>

              {/* Property Details Grid */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-[8px] p-4">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="text-2xl font-bold text-gray-900">{propertyData.property.bedrooms}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="rounded-[8px] p-4">
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="text-2xl font-bold text-gray-900">{propertyData.property.bathrooms}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="rounded-[8px] p-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Max Guests</p>
                        <p className="text-2xl font-bold text-gray-900">{propertyData.property.guests}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="rounded-[8px] p-4">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Occupancy</p>
                        <p className="text-2xl font-bold text-gray-900">{propertyData.property.occupancy}%</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Description */}
              {propertyData.property.description && (
                <div className="bg-white rounded-[8px] border p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{propertyData.property.description}</p>
                </div>
              )}

              {/* Amenities */}
              {propertyData.amenities?.length > 0 && (
                <div className="bg-white rounded-[8px] border p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {propertyData.amenities.map((item: any) => (
                      <div key={item.amenity.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-orange-600">{item.amenity.icon}</span>
                        <span className="text-sm text-gray-700">{item.amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-[8px] p-4 text-center bg-blue-50 border-blue-200">
                    <p className="text-2xl font-bold text-blue-600"><Eye className="w-5 h-5 inline mr-1" />{propertyData.property.views}</p>
                    <p className="text-xs text-gray-600 mt-1">Views</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-orange-50 border-orange-200">
                    <p className="text-2xl font-bold text-orange-600">{propertyData.counts.bookings}</p>
                    <p className="text-xs text-gray-600 mt-1">Bookings</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-yellow-50 border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">{propertyData.counts.reviews}</p>
                    <p className="text-xs text-gray-600 mt-1">Reviews</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-purple-50 border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">₹{(propertyData.property.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-600 mt-1">Revenue</p>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Owner Tab */}
          {activeTab === "owner" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-[8px] p-6">
                <div className="flex items-start gap-4">
                  {propertyData.owner.avatar ? (
                    <img
                      src={propertyData.owner.avatar}
                      alt={propertyData.owner.fullName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-700">
                        {propertyData.owner.firstName.charAt(0)}{propertyData.owner.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{propertyData.owner.fullName}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <p className="text-sm text-gray-600">{propertyData.owner.email}</p>
                    </div>
                    {propertyData.owner.phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-gray-600">{propertyData.owner.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-[8px] border p-6">
              {propertyData.bookings?.length > 0 ? (
                <div className="space-y-3">
                  {propertyData.bookings.map((booking: any) => (
                    <Card key={booking.id} className="rounded-[8px] p-4 border-l-4 border-l-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{booking.guest?.firstName} {booking.guest?.lastName}</p>
                          <p className="text-sm text-gray-600 mt-1">{booking.guest?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-orange-600">{booking.status}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No bookings found</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-[8px] border p-6">
              {propertyData.reviews?.length > 0 ? (
                <div className="space-y-3">
                  {propertyData.reviews.map((review: any) => (
                    <Card key={review.id} className="rounded-[8px] p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <p className="font-medium text-gray-900">{review.user?.firstName} {review.user?.lastName}</p>
                          <p className="text-sm text-gray-600 mt-1">{review.comment?.substring(0, 150) || "No comment"}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No reviews found</p>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === "inquiries" && (
            <div className="bg-white rounded-[8px] border p-6">
              {propertyData.inquiries?.length > 0 ? (
                <div className="space-y-3">
                  {propertyData.inquiries.map((inquiry: any) => (
                    <Card key={inquiry.id} className="rounded-[8px] p-4 border-l-4 border-l-purple-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{inquiry.user?.firstName} {inquiry.user?.lastName}</p>
                          <p className="text-sm text-gray-600 mt-1">{inquiry.user?.email}</p>
                          <p className="text-sm text-gray-700 mt-2">{inquiry.message?.substring(0, 100) || "No message"}</p>
                        </div>
                        <p className="text-xs font-medium text-purple-600">{inquiry.status}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No inquiries found</p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </AdminDashboardLayout>
  );
}
