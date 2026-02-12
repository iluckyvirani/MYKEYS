"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ShortBookingDTO, BookingStatus } from "@/types/bookings";
import { Calendar, Users, MapPin, CreditCard, AlertCircle, Check, X, Clock } from "lucide-react";
import CancelBookingModal from "@/components/dashboard/UserDashboard/CancelBookingModal";
import ReviewModal from "@/components/dashboard/UserDashboard/ReviewModal";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case BookingStatus.CONFIRMED:
      return <Check className="w-5 h-5 text-green-600" />;
    case BookingStatus.COMPLETED:
      return <Check className="w-5 h-5 text-blue-600" />;
    case BookingStatus.CANCELLED:
      return <X className="w-5 h-5 text-red-600" />;
    case BookingStatus.PENDING:
      return <Clock className="w-5 h-5 text-yellow-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case BookingStatus.CONFIRMED:
      return 'bg-green-100 text-green-800';
    case 'completed':
    case BookingStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
    case BookingStatus.CANCELLED:
      return 'bg-red-100 text-red-800';
    case 'pending':
    case BookingStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-orange-100 text-orange-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<ShortBookingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/bookings/${bookingId}`);

        if (response.data?.success && response.data.data) {
          setBooking(response.data.data);
          setError(null);
        } else {
          setError("Failed to load booking details");
        }
      } catch (err: any) {
        console.error("Error fetching booking:", err);
        setError(err.message || "Failed to fetch booking");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleCancelConfirm = async () => {
    if (!booking) return;

    try {
      setIsLoading(true);
      const response = await api.patch(`/bookings/${booking.id}`, {
        status: BookingStatus.CANCELLED,
      });

      if (response.data?.success) {
        setCancelModalOpen(false);
        // Update local state
        setBooking({ ...booking, status: BookingStatus.CANCELLED });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (review: any) => {
    if (!booking) return;

    try {
      setIsLoading(true);
      const response = await api.post("/reviews", {
        propertyId: booking.propertyId,
        bookingId: booking.id,
        rating: review.rating,
        comment: review.comment,
        cleanlinessRating: review.cleanlinessRating,
        communicationRating: review.communicationRating,
        accuracyRating: review.accuracyRating,
        locationRating: review.locationRating,
        valueRating: review.valueRating,
      });

      if (response.data?.success) {
        setReviewModalOpen(false);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout defaultRole="user">
        <div className="bg-white rounded-[5px] border p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading booking details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !booking) {
    return (
      <DashboardLayout defaultRole="user">
        <div className="bg-white rounded-[5px] border p-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading booking</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/dashboard/bookings">Back to Bookings</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{booking.propertyTitle}</h1>
            <p className="text-gray-600 mt-2">Booking ID: {booking.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(booking.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Status Summary */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded-[5px]">
                <div className="text-xs text-gray-600 mb-1">Check-in</div>
                <div className="font-semibold text-gray-900">{formatDate(booking.checkInDate)}</div>
                <div className="text-xs text-gray-500">After 2:00 PM</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-[5px]">
                <div className="text-xs text-gray-600 mb-1">Check-out</div>
                <div className="font-semibold text-gray-900">{formatDate(booking.checkOutDate)}</div>
                <div className="text-xs text-gray-500">Before 11:00 AM</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-[5px]">
                <div className="text-xs text-gray-600 mb-1">Duration</div>
                <div className="font-semibold text-gray-900">{booking.numberOfNights} Nights</div>
                <div className="text-xs text-gray-500">
                  {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-[5px]">
                <div className="text-xs text-gray-600 mb-1">Guests</div>
                <div className="font-semibold text-gray-900">{booking.numberOfGuests}</div>
                <div className="text-xs text-gray-500">{booking.numberOfGuests === 1 ? 'Guest' : 'Guests'}</div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Guest Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="font-medium text-gray-900">{booking.guestName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-900">{booking.guestEmail}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone Number</label>
                <p className="font-medium text-gray-900">{booking.guestPhone}</p>
              </div>
              {booking.specialRequests && (
                <div>
                  <label className="text-sm text-gray-600">Special Requests</label>
                  <p className="font-medium text-gray-900">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{formatCurrency(booking.pricePerNight)} × {booking.numberOfNights} nights</span>
                <span className="font-medium text-gray-900">{formatCurrency(booking.subtotal)}</span>
              </div>
              {booking.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleaning Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(booking.cleaningFee)}</span>
                </div>
              )}
              {booking.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(booking.serviceFee)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment & Actions */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-[5px]">
                <div className="text-sm text-gray-600 mb-1">Amount Paid</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(booking.paidAmount)}
                </div>
              </div>

              {booking.balanceAmount > 0 && (
                <div className="p-3 bg-red-50 rounded-[5px] border border-red-200">
                  <div className="text-sm text-red-600 mb-1">Remaining Balance</div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(booking.balanceAmount)}
                  </div>
                </div>
              )}

              {booking.paymentMethod && (
                <div>
                  <label className="text-sm text-gray-600">Payment Method</label>
                  <p className="font-medium text-gray-900">
                    {booking.paymentMethod.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-[5px] border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED) && (
                <Button
                  onClick={() => setCancelModalOpen(true)}
                  disabled={isLoading}
                  className="w-full rounded-[5px] bg-red-600 hover:bg-red-700"
                >
                  Cancel Booking
                </Button>
              )}

              {booking.status === BookingStatus.COMPLETED && (
                <Button
                  onClick={() => setReviewModalOpen(true)}
                  disabled={isLoading}
                  className="w-full rounded-[5px]"
                >
                  Write Review
                </Button>
              )}

              {booking.status === BookingStatus.CANCELLED && (
                <Button asChild className="w-full rounded-[5px]">
                  <Link href={`/property/${booking.propertyId}`}>
                    Rebook Property
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full rounded-[5px]"
              >
                Back to Bookings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        bookingId={booking.id}
        propertyTitle={booking.propertyTitle}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        bookingId={booking.id}
        propertyTitle={booking.propertyTitle}
      />
    </DashboardLayout>
  );
}
