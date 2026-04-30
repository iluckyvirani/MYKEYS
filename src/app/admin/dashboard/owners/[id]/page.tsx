"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Building, Star, Home, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface OwnerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OwnerDetailPage({ params }: OwnerDetailPageProps) {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [ownerData, setOwnerData] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    params.then((resolvedParams) => {
      setOwnerId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (ownerId) {
      fetchOwnerData();
    }
  }, [ownerId]);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/admin/owners/${ownerId}`);
      if (response.data?.data) {
        setOwnerData(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching owner data:", err);
      setError(err.response?.data?.message || "Failed to fetch owner details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Details</h1>
            {ownerData && <p className="text-gray-600 mt-2">{ownerData.user.fullName}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : ownerData ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-[8px] border p-4 flex gap-2 border-b overflow-x-auto">
            {["overview", "properties", "bookings", "payments", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                    ? "border-blue-600 text-blue-600"
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
              {/* Owner Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-[8px] p-6">
                <div className="flex items-start gap-4">
                  {ownerData.user.avatar ? (
                    <img
                      src={ownerData.user.avatar}
                      alt={ownerData.user.fullName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-blue-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-700">
                        {ownerData.user.firstName.charAt(0)}{ownerData.user.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{ownerData.user.fullName}</h2>
                    <p className="text-sm text-gray-600">{ownerData.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        OWNER
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-[8px] p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{ownerData.user.email}</p>
                    </div>
                  </div>
                </Card>
                {ownerData.user.phone && (
                  <Card className="rounded-[8px] p-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{ownerData.user.phone}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Address Information */}
              {(ownerData.user.address || ownerData.user.city) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownerData.user.address && (
                      <Card className="rounded-[8px] p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-sm font-medium text-gray-900">{ownerData.user.address}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {ownerData.user.city && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">City</p>
                        <p className="text-sm font-medium text-gray-900">{ownerData.user.city}</p>
                      </Card>
                    )}
                    {ownerData.user.state && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">State</p>
                        <p className="text-sm font-medium text-gray-900">{ownerData.user.state}</p>
                      </Card>
                    )}
                    {ownerData.user.country && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">Country</p>
                        <p className="text-sm font-medium text-gray-900">{ownerData.user.country}</p>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Business Information */}
              {(ownerData.user.companyName || ownerData.user.website) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ownerData.user.companyName && (
                      <Card className="rounded-[8px] p-4">
                        <div className="flex items-start gap-3">
                          <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Company Name</p>
                            <p className="text-sm font-medium text-gray-900">{ownerData.user.companyName}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {ownerData.user.website && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">Website</p>
                        <a
                          href={ownerData.user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {ownerData.user.website}
                        </a>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="rounded-[8px] p-4 text-center bg-blue-50 border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{ownerData.counts.properties}</p>
                    <p className="text-xs text-gray-600 mt-1">Properties</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-blue-50 border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{ownerData.counts.bookingsAsOwner}</p>
                    <p className="text-xs text-gray-600 mt-1">Bookings</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-orange-50 border-orange-200">
                    <p className="text-2xl font-bold text-orange-600">{ownerData.counts.payments}</p>
                    <p className="text-xs text-gray-600 mt-1">Payments</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-yellow-50 border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">{ownerData.counts.reviews}</p>
                    <p className="text-xs text-gray-600 mt-1">Reviews</p>
                  </Card>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-gray-50 rounded-[8px] p-4 space-y-2 text-sm border">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${ownerData.user.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                    {ownerData.user.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(ownerData.user.createdAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {ownerData.user.lastLoginAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">
                      {new Date(ownerData.user.lastLoginAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === "properties" && (
            <div className="bg-white rounded-[8px] border p-6">
              {ownerData.properties?.length > 0 ? (
                <div className="space-y-3">
                  {ownerData.properties.map((property: any) => (
                    <Card key={property.id} className="rounded-[8px] p-4 border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{property.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {property.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {property.bedrooms}bed {property.bathrooms}bath
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">£{property.price.toLocaleString("en-GB")}</p>
                          <p className={`text-xs font-medium ${property.status === "ACTIVE" ? "text-green-600" : "text-yellow-600"}`}>
                            {property.status}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No properties found</p>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="bg-white rounded-[8px] border p-6">
              {ownerData.bookingsAsOwner?.length > 0 ? (
                <div className="space-y-3">
                  {ownerData.bookingsAsOwner.map((booking: any) => (
                    <Card key={booking.id} className="rounded-[8px] p-4 border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{booking.property?.title}</p>
                          <p className="text-sm text-gray-600 mt-1">Guest: {booking.guest?.firstName} {booking.guest?.lastName}</p>
                        </div>
                        <p className="text-xs font-medium text-blue-600">{booking.status}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No bookings found</p>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-[8px] border p-6">
              {ownerData.payments?.length > 0 ? (
                <div className="space-y-3">
                  {ownerData.payments.map((payment: any) => (
                    <Card key={payment.id} className="rounded-[8px] p-4 border-l-4 border-l-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">£{payment.amount?.toLocaleString("en-GB")}</p>
                          <p className="text-sm text-gray-600">{payment.booking?.property?.title}</p>
                        </div>
                        <p className={`text-xs font-medium ${payment.status === "COMPLETED" ? "text-green-600" : "text-yellow-600"}`}>
                          {payment.status}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No payments found</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-[8px] border p-6">
              {ownerData.reviews?.length > 0 ? (
                <div className="space-y-3">
                  {ownerData.reviews.map((review: any) => (
                    <Card key={review.id} className="rounded-[8px] p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <p className="font-medium text-gray-900">{review.property?.title}</p>
                          <p className="text-sm text-gray-600 mt-1">By: {review.user?.firstName} {review.user?.lastName}</p>
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
        </div>
      ) : null}
    </AdminDashboardLayout>
  );
}
