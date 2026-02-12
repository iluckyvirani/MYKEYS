"use client";

import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { ShortBookingDTO, BookingStatus } from "@/types/bookings";
import CancelBookingModal from "./CancelBookingModal";
import ReviewModal from "./ReviewModal";

interface BookingListProps {
  bookings: ShortBookingDTO[];
  emptyMessage: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  onBookingUpdated?: () => void;
}

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
    month: 'short',
    day: 'numeric',
  });
};

export default function BookingList({ 
  bookings, 
  emptyMessage, 
  emptyAction,
  onBookingUpdated 
}: BookingListProps) {
  const router = useRouter();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ShortBookingDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelClick = (booking: ShortBookingDTO) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      const response = await api.patch(`/bookings/${selectedBooking.id}`, {
        status: BookingStatus.CANCELLED,
      });

      if (response.data?.success) {
        setCancelModalOpen(false);
        // Refresh the bookings list
        if (onBookingUpdated) {
          onBookingUpdated();
        }
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClick = (booking: ShortBookingDTO) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (review: any) => {
    if (!selectedBooking) return;

    try {
      setIsLoading(true);
      const response = await api.post("/reviews", {
        propertyId: selectedBooking.propertyId,
        bookingId: selectedBooking.id,
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
        // Refresh the bookings list
        if (onBookingUpdated) {
          onBookingUpdated();
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRebook = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        {emptyAction && (
          <Button asChild className="mt-4">
            <Link href={emptyAction.href}>{emptyAction.label}</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-6 border rounded-[5px] hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Property Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.propertyTitle}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.checkInDate)} -{" "}
                        {formatDate(booking.checkOutDate)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        {booking.numberOfGuests}{" "}
                        {booking.numberOfGuests === 1 ? "guest" : "guests"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.numberOfNights} nights
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Check-in</div>
                    <div className="font-medium">
                      {formatDate(booking.checkInDate)}
                    </div>
                    <div className="text-xs text-gray-500">After 2:00 PM</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Check-out</div>
                    <div className="font-medium">
                      {formatDate(booking.checkOutDate)}
                    </div>
                    <div className="text-xs text-gray-500">Before 11:00 AM</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Payment Status</div>
                    <div className="font-medium">
                      {booking.paymentStatus.charAt(0).toUpperCase() +
                        booking.paymentStatus.slice(1).toLowerCase()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.paidAmount > 0
                        ? formatCurrency(booking.paidAmount)
                        : "Not paid"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="lg:w-64">
                <div className="text-right mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total amount
                    {booking.balanceAmount > 0 && (
                      <div className="text-red-600 text-xs mt-1">
                        Balance: {formatCurrency(booking.balanceAmount)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1 cursor-pointer rounded-[5px]"
                  >
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      View Details
                    </Link>
                  </Button>

                  {(booking.status === BookingStatus.PENDING ||
                    booking.status === BookingStatus.CONFIRMED) && (
                    <Button
                      onClick={() => handleCancelClick(booking)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="flex-1 cursor-pointer rounded-[5px] text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}

                  {booking.status === BookingStatus.COMPLETED && (
                    <Button
                      onClick={() => handleReviewClick(booking)}
                      disabled={isLoading}
                      size="sm"
                      className="flex-1 cursor-pointer rounded-[5px]"
                    >
                      Write Review
                    </Button>
                  )}

                  {booking.status === BookingStatus.CANCELLED && (
                    <Button
                      onClick={() => handleRebook(booking.propertyId)}
                      size="sm"
                      className="flex-1 cursor-pointer rounded-[5px]"
                    >
                      Rebook
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedBooking && (
        <>
          <CancelBookingModal
            isOpen={cancelModalOpen}
            onClose={() => {
              setCancelModalOpen(false);
              setSelectedBooking(null);
            }}
            onConfirm={handleCancelConfirm}
            bookingId={selectedBooking.id}
            propertyTitle={selectedBooking.propertyTitle}
          />
          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedBooking(null);
            }}
            onSubmit={handleReviewSubmit}
            bookingId={selectedBooking.id}
            propertyTitle={selectedBooking.propertyTitle}
          />
        </>
      )}
    </>
  );
}