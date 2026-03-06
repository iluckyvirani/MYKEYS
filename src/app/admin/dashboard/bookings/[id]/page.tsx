"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Building, AlertCircle, Users, DollarSign, Calendar, CheckCircle, Clock, AlertCircle as AlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setBookingId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/admin/bookings/${bookingId}`);
      if (response.data?.data) {
        setBookingData(response.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching booking data:", err);
      setError(err.response?.data?.message || "Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "FAILED":
        return <AlertIcon className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            {bookingData && <p className="text-gray-600 mt-2">Booking #{bookingData.booking.id.substring(0, 8).toUpperCase()}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : bookingData ? (
        <div className="space-y-6">
          {/* Booking Status */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-[8px] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{bookingData.property.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {bookingData.property.address}, {bookingData.property.city}
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(bookingData.booking.status)}`}>
                  {bookingData.booking.status}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-[8px] p-4 border-l-4 border-l-indigo-500">
              <p className="text-sm text-gray-600 mb-2">Check-in</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(bookingData.booking.checkIn).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(bookingData.booking.checkIn).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Card>

            <Card className="rounded-[8px] p-4 border-l-4 border-l-purple-500">
              <p className="text-sm text-gray-600 mb-2">Check-out</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(bookingData.booking.checkOut).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(bookingData.booking.checkOut).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Card>

            <Card className="rounded-[8px] p-4 border-l-4 border-l-blue-500">
              <p className="text-sm text-gray-600 mb-2">Duration</p>
              <p className="text-lg font-bold text-gray-900">{bookingData.booking.nights} nights</p>
              <p className="text-xs text-gray-500 mt-1">{bookingData.booking.guests} guest(s)</p>
            </Card>
          </div>

          {/* Guest & Owner Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guest Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Guest Information</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {bookingData.guest.avatar ? (
                    <img
                      src={bookingData.guest.avatar}
                      alt={bookingData.guest.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">
                        {bookingData.guest.firstName.charAt(0)}{bookingData.guest.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{bookingData.guest.fullName}</p>
                    <p className="text-sm text-gray-600">{bookingData.guest.email}</p>
                  </div>
                </div>
                {bookingData.guest.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{bookingData.guest.phone}</span>
                  </div>
                )}
                {bookingData.guest.city && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{bookingData.guest.city}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Property Owner</h3>
              <div className="bg-orange-50 border border-orange-200 rounded-[8px] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {bookingData.owner.avatar ? (
                    <img
                      src={bookingData.owner.avatar}
                      alt={bookingData.owner.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-700">
                        {bookingData.owner.firstName.charAt(0)}{bookingData.owner.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{bookingData.owner.fullName}</p>
                    <p className="text-sm text-gray-600">{bookingData.owner.email}</p>
                  </div>
                </div>
                {bookingData.owner.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700">{bookingData.owner.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
            <Card className="rounded-[8px] p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Base Price ({bookingData.booking.nights} nights)</span>
                <span className="font-semibold text-gray-900">₹{bookingData.booking.basePrice.toLocaleString("en-IN")}</span>
              </div>
              {bookingData.booking.cleaningFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Cleaning Fee</span>
                  <span className="font-semibold text-gray-900">₹{bookingData.booking.cleaningFee.toLocaleString("en-IN")}</span>
                </div>
              )}
              {bookingData.booking.serviceFee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Service Fee</span>
                  <span className="font-semibold text-gray-900">₹{bookingData.booking.serviceFee.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-indigo-600">₹{bookingData.booking.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </Card>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
            <Card className="rounded-[8px] p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-gray-900">₹{bookingData.booking.paidAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Balance Amount</p>
                  <p className="text-2xl font-bold text-orange-600">₹{bookingData.booking.balanceAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPaymentStatusIcon(bookingData.booking.paymentStatus)}
                    <span className="font-semibold text-gray-900">{bookingData.booking.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {bookingData.booking.paymentMethod && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900 mt-1">{bookingData.booking.paymentMethod}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Special Requests & Notes */}
          {(bookingData.booking.specialRequests || bookingData.booking.notes) && (
            <div className="space-y-4">
              {bookingData.booking.specialRequests && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Special Requests</h3>
                  <Card className="rounded-[8px] p-4 bg-yellow-50 border-yellow-200">
                    <p className="text-gray-700">{bookingData.booking.specialRequests}</p>
                  </Card>
                </div>
              )}

              {bookingData.booking.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <Card className="rounded-[8px] p-4 bg-blue-50 border-blue-200">
                    <p className="text-gray-700">{bookingData.booking.notes}</p>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Review Section */}
          {bookingData.review && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Guest Review</h3>
              <Card className="rounded-[8px] p-6 border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < (bookingData.review.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(bookingData.review.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-gray-700">{bookingData.review.comment}</p>
              </Card>
            </div>
          )}
        </div>
      ) : null}
    </AdminDashboardLayout>
  );
}
