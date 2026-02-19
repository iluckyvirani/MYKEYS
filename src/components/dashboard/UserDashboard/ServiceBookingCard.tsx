"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Phone,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ServiceRatingModal from "./ServiceRatingModal";

interface ServiceBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerImage: string;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  bookingType: "instant" | "schedule";
  scheduledDate?: string;
  scheduledTime?: string;
  totalAmount: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  review?: string;
}

interface ServiceBookingCardProps {
  booking: ServiceBooking;
  onBookingUpdated: () => void;
}

export default function ServiceBookingCard({
  booking,
  onBookingUpdated,
}: ServiceBookingCardProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = async () => {
    try {
      // API call to cancel booking
      // await api.post(`/service-bookings/${booking.id}/cancel`);
      onBookingUpdated();
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex gap-6">
          {/* Provider Image */}
          <div className="flex-shrink-0">
            <Image
              src={booking.providerImage}
              alt={booking.providerName}
              width={100}
              height={100}
              className="w-24 h-24 rounded-lg object-cover"
            />
          </div>

          {/* Booking Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {booking.serviceName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.providerName}
                </p>
              </div>
              <Badge className={`${getStatusColor(booking.status)} font-medium`}>
                {booking.status.charAt(0).toUpperCase() +
                  booking.status.slice(1)}
              </Badge>
            </div>

            {/* Booking Type */}
            <div className="flex items-center gap-4 mb-3 text-sm">
              {booking.bookingType === "instant" ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" />
                  Instant Service
                </div>
              ) : (
                <div className="flex items-center gap-1 text-blue-600">
                  <Calendar className="w-4 h-4" />
                  Scheduled Service
                </div>
              )}
              <div className="text-gray-600">{booking.bookingType === "schedule" && `${formatDate(booking.scheduledDate || "")} at ${booking.scheduledTime}`}</div>
            </div>

            {/* Pricing */}
            <div className="text-lg font-semibold text-gray-900 mb-4">
              ₹{booking.totalAmount}
            </div>

            {/* Rating for completed bookings */}
            {booking.status === "completed" && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                {booking.rating ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: booking.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {booking.rating}.0
                      </span>
                    </div>
                    {booking.review && (
                      <p className="text-sm text-gray-700">"{booking.review}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Share your experience with this service
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex flex-col gap-2">
            {booking.status === "confirmed" ||
            booking.status === "pending" ||
            booking.status === "in-progress" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : booking.status === "completed" && !booking.rating ? (
              <Button
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
                onClick={() => setShowRatingModal(true)}
              >
                <Star className="w-4 h-4 mr-2" />
                Rate Service
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <ServiceRatingModal
          booking={booking}
          onClose={() => setShowRatingModal(false)}
          onSubmit={() => {
            setShowRatingModal(false);
            onBookingUpdated();
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancel Booking?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this service booking? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 cursor-pointer"
              >
                Keep Booking
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                onClick={handleCancel}
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
