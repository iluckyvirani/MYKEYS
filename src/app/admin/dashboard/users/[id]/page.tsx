"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Building, Star, Home, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/admin/users/${userId}`);
      if (response.data?.data) {
        setUserData(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching user data:", err);
      setError(err.response?.data?.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
            {userData && <p className="text-gray-600 mt-2">{userData.user.fullName}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : userData ? (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-[8px] border p-4 flex gap-2 border-b overflow-x-auto">
            {["overview", "properties", "bookings", "inquiries", "payments", "reviews", "favorites"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-green-600 text-green-600"
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
              {/* User Info Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-[8px] p-6">
                <div className="flex items-start gap-4">
                  {userData.user.avatar ? (
                    <img
                      src={userData.user.avatar}
                      alt={userData.user.fullName}
                      className="w-24 h-24 rounded-full object-cover border-2 border-green-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-700">
                        {userData.user.firstName.charAt(0)}{userData.user.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{userData.user.fullName}</h2>
                    <p className="text-sm text-gray-600">{userData.user.email}</p>
                    <div className="flex gap-2 mt-2">
                      {userData.user.roles.map((role: string) => (
                        <span
                          key={role}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            role === "OWNER"
                              ? "bg-blue-100 text-blue-700"
                              : role === "SERVICE"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-[8px] p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{userData.user.email}</p>
                    </div>
                  </div>
                </Card>
                {userData.user.phone && (
                  <Card className="rounded-[8px] p-4">
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{userData.user.phone}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Personal Information */}
              {(userData.user.address || userData.user.city) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.user.address && (
                      <Card className="rounded-[8px] p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-sm font-medium text-gray-900">{userData.user.address}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {userData.user.city && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">City</p>
                        <p className="text-sm font-medium text-gray-900">{userData.user.city}</p>
                      </Card>
                    )}
                    {userData.user.state && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">State</p>
                        <p className="text-sm font-medium text-gray-900">{userData.user.state}</p>
                      </Card>
                    )}
                    {userData.user.country && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">Country</p>
                        <p className="text-sm font-medium text-gray-900">{userData.user.country}</p>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Owner Information */}
              {userData.user.roles.includes("OWNER") && (userData.user.companyName || userData.user.website) && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.user.companyName && (
                      <Card className="rounded-[8px] p-4">
                        <div className="flex items-start gap-3">
                          <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-gray-600">Company Name</p>
                            <p className="text-sm font-medium text-gray-900">{userData.user.companyName}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    {userData.user.website && (
                      <Card className="rounded-[8px] p-4">
                        <p className="text-sm text-gray-600">Website</p>
                        <a
                          href={userData.user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {userData.user.website}
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
                  <Card className="rounded-[8px] p-4 text-center bg-green-50 border-green-200">
                    <p className="text-2xl font-bold text-green-600">{userData.counts.bookingsAsGuest}</p>
                    <p className="text-xs text-gray-600 mt-1">Bookings as Guest</p>
                  </Card>
                  {userData.user.roles.includes("OWNER") && (
                    <>
                      <Card className="rounded-[8px] p-4 text-center bg-blue-50 border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{userData.counts.bookingsAsOwner}</p>
                        <p className="text-xs text-gray-600 mt-1">Bookings as Owner</p>
                      </Card>
                      <Card className="rounded-[8px] p-4 text-center bg-blue-50 border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{userData.counts.properties}</p>
                        <p className="text-xs text-gray-600 mt-1">Properties</p>
                      </Card>
                    </>
                  )}
                  <Card className="rounded-[8px] p-4 text-center bg-purple-50 border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{userData.counts.inquiries}</p>
                    <p className="text-xs text-gray-600 mt-1">Inquiries</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-orange-50 border-orange-200">
                    <p className="text-2xl font-bold text-orange-600">{userData.counts.payments}</p>
                    <p className="text-xs text-gray-600 mt-1">Payments</p>
                  </Card>
                  <Card className="rounded-[8px] p-4 text-center bg-yellow-50 border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">{userData.counts.reviews}</p>
                    <p className="text-xs text-gray-600 mt-1">Reviews</p>
                  </Card>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-gray-50 rounded-[8px] p-4 space-y-2 text-sm border">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${userData.user.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                    {userData.user.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(userData.user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {userData.user.lastLoginAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">
                      {new Date(userData.user.lastLoginAt).toLocaleDateString("en-IN", {
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
              {userData.properties && userData.properties.length > 0 ? (
                <div className="space-y-3">
                  {userData.properties.map((property: any) => (
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
                          <p className="text-lg font-bold text-green-600">₹{property.price.toLocaleString("en-IN")}</p>
                          <p className={`text-xs font-medium ${
                            property.status === "ACTIVE" ? "text-green-600" : "text-yellow-600"
                          }`}>
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
            <div className="bg-white rounded-[8px] border p-6 space-y-4">
              {userData.bookingsAsGuest?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bookings as Guest</h4>
                  <div className="space-y-2">
                    {userData.bookingsAsGuest.map((booking: any) => (
                      <Card key={booking.id} className="rounded-[8px] p-4 border-l-4 border-l-green-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{booking.property?.title}</p>
                            <p className="text-sm text-gray-600">{booking.property?.city}</p>
                          </div>
                          <p className="text-xs font-medium text-green-600">{booking.status}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {userData.bookingsAsOwner?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bookings as Owner</h4>
                  <div className="space-y-2">
                    {userData.bookingsAsOwner.map((booking: any) => (
                      <Card key={booking.id} className="rounded-[8px] p-4 border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{booking.property?.title}</p>
                            <p className="text-sm text-gray-600">Guest: {booking.guest?.firstName} {booking.guest?.lastName}</p>
                          </div>
                          <p className="text-xs font-medium text-blue-600">{booking.status}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!userData.bookingsAsGuest?.length && !userData.bookingsAsOwner?.length && (
                <p className="text-center text-gray-500 py-8">No bookings found</p>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === "inquiries" && (
            <div className="bg-white rounded-[8px] border p-6">
              {userData.inquiries?.length > 0 ? (
                <div className="space-y-3">
                  {userData.inquiries.map((inquiry: any) => (
                    <Card key={inquiry.id} className="rounded-[8px] p-4 border-l-4 border-l-purple-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{inquiry.property?.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{inquiry.message?.substring(0, 100) || "No message"}</p>
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

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <div className="bg-white rounded-[8px] border p-6">
              {userData.payments?.length > 0 ? (
                <div className="space-y-3">
                  {userData.payments.map((payment: any) => (
                    <Card key={payment.id} className="rounded-[8px] p-4 border-l-4 border-l-orange-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">₹{payment.amount?.toLocaleString("en-IN")}</p>
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
              {userData.reviews?.length > 0 ? (
                <div className="space-y-3">
                  {userData.reviews.map((review: any) => (
                    <Card key={review.id} className="rounded-[8px] p-4 border-l-4 border-l-yellow-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                          <p className="font-medium text-gray-900">{review.property?.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{review.comment?.substring(0, 100) || "No comment"}</p>
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

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div className="bg-white rounded-[8px] border p-6">
              {userData.favorites?.length > 0 ? (
                <div className="space-y-3">
                  {userData.favorites.map((favorite: any) => (
                    <Card key={favorite.id} className="rounded-[8px] p-4 border-l-4 border-l-red-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 fill-red-500 text-red-500" />
                            <h4 className="font-semibold text-gray-900">{favorite.property?.title}</h4>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {favorite.property?.city}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-red-600 flex items-center gap-1 justify-end">
                            <Star className="w-4 h-4 fill-red-500 text-red-500" />
                            Favorite
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No favorite properties found</p>
              )}
            </div>
          )}
        </div>
      ) : null}
    </AdminDashboardLayout>
  );
}
