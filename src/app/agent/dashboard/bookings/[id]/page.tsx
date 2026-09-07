"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Home,
  Users,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface BookingDetails {
  id: string;
  propertyTitle: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  status: string;
  paymentStatus: string;
  specialRequests: string;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/bookings/${bookingId}`);

      if (response.data?.success && response.data.data) {
        setBooking(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError("Failed to load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Confirmed",
          icon: CheckCircle,
        };
      case "PENDING":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Pending",
          icon: Clock,
        };
      case "COMPLETED":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Completed",
          icon: CheckCircle,
        };
      case "CANCELLED":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Cancelled",
          icon: AlertCircle,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: status || "Unknown",
          icon: AlertCircle,
        };
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return { color: "bg-green-100 text-green-800", label: "Paid" };
      case "PENDING":
        return { color: "bg-orange-100 text-orange-800", label: "Pending" };
      case "PARTIAL":
        return { color: "bg-yellow-100 text-yellow-800", label: "Partial" };
      case "REFUNDED":
        return { color: "bg-purple-100 text-purple-800", label: "Refunded" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status || "Unknown" };
    }
  };

  if (loading) {
    return (
      <DashboardLayout defaultRole="agent">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !booking) {
    return (
      <DashboardLayout defaultRole="agent">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-[5px] p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700 mb-4">{error || "Booking not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
const paymentConfig = getPaymentStatusConfig(booking.paymentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout defaultRole="agent">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-1">Booking ID: {booking.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-4 py-2 rounded-[5px] border font-medium flex items-center gap-2 ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>
            <div className={`px-4 py-2 rounded-[5px] border font-medium ${paymentConfig.color}`}>
              {paymentConfig.label}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property & Guest Information */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property & Guest Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Property */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">PROPERTY</p>
                    <Link href={`/agent/dashboard/properties/${booking.propertyId}`}>
                      <p className="font-semibold text-gray-900 hover:text-green-600">
                        {booking.propertyTitle}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Guest */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">GUEST</p>
                    <p className="font-semibold text-gray-900">{booking.guestName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-4 border-t pt-4">
              <p className="text-xs font-medium text-gray-500 mb-3">CONTACT INFORMATION</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${booking.guestEmail}`} className="hover:text-green-600">
                    {booking.guestEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${booking.guestPhone}`} className="hover:text-green-600">
                    {booking.guestPhone || "Not provided"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Guests */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-in & Check-out</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">CHECK-IN</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(booking.checkInDate).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">CHECK-OUT</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(booking.checkOutDate).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">DURATION</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.numberOfNights} night{booking.numberOfNights !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">GUESTS</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-white rounded-[5px] border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h2>
              <p className="text-gray-700">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium text-gray-900">
                  £{booking.subtotal.toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cleaning Fee</span>
                <span className="font-medium text-gray-900">
                  £{booking.cleaningFee.toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-medium text-gray-900">
                  £{booking.serviceFee.toLocaleString("en-GB")}
                </span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-green-600">
                  £{booking.totalAmount.toLocaleString("en-GB")}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">AMOUNT PAID</p>
                <p className="text-xl font-bold text-gray-900">
                  £{booking.paidAmount.toLocaleString("en-GB")}
                </p>
              </div>

              {booking.balanceAmount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-[5px] p-3">
                  <p className="text-xs font-medium text-orange-700 mb-1">BALANCE DUE</p>
                  <p className="text-lg font-bold text-orange-800">
                    £{booking.balanceAmount.toLocaleString("en-GB")}
                  </p>
                </div>
              )}

              <div className={`rounded-[5px] p-3 ${paymentConfig.color.split(" ")[0]} ${paymentConfig.color.split(" ")[1]}`}>
                <p className="text-xs font-medium mb-1">PAYMENT STATUS</p>
                <p className="font-semibold">{paymentConfig.label}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>

            <div className="space-y-2">
              {/* <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Guest
              </Button> */}
              <Button className="w-full justify-start" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
              {/* <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Block Dates After
              </Button> */}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-gray-500">CREATED</p>
                <p className="text-gray-900">
                  {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">LAST UPDATED</p>
                <p className="text-gray-900">
                  {new Date(booking.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
