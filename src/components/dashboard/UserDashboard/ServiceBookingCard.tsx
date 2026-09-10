"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/common/UserAvatar";
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
import ServiceLiveTrackPanel from "@/components/services/ServiceLiveTrackPanel";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ServiceBooking {
  id: string;
  serviceId: string;
  providerId: string;
  serviceName: string;
  providerName: string;
  providerImage?: string | null;
  status: "pending" | "confirmed" | "on-the-way" | "in-progress" | "completed" | "cancelled";
  trackingActive?: boolean;
  bookingType: "instant" | "schedule";
  scheduledDate?: string;
  scheduledTime?: string;
  totalAmount: number;
  createdAt: string;
  completedAt?: string;
  rating?: number;
  review?: string;
  pendingAction?: "COMPLETE" | "CANCEL" | null;
  paymentStatus?: string;
}

interface ServiceBookingCardProps {
  booking: ServiceBooking;
  onBookingUpdated: (notice?: string) => void;
}

export default function ServiceBookingCard({
  booking,
  onBookingUpdated,
}: ServiceBookingCardProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyLoading, setModifyLoading] = useState(false);
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [newScheduledDate, setNewScheduledDate] = useState(booking.scheduledDate || "");
  const [newScheduledTime, setNewScheduledTime] = useState(booking.scheduledTime || "");
  const [newLocation, setNewLocation] = useState((booking as any).location || "");
  const [newDescription, setNewDescription] = useState((booking as any).description || "");

  const pendingAction = booking.pendingAction;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "on-the-way":
        return "bg-emerald-100 text-emerald-800";
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

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Enter the 6-digit code from your email");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const response = await api.post(
        `/user/service-bookings/${booking.id}/verify-otp`,
        { otp: otp.trim() }
      );
      if (response.data?.success) {
        const completed = pendingAction === "COMPLETE";
        const successMessage =
          response.data.message ||
          (completed
            ? "Your service was completed successfully"
            : "Your booking was cancelled successfully");
        setOtpSuccess(successMessage);
        toast({
          title: completed ? "Service completed" : "Booking cancelled",
          description: successMessage,
        });
        setOtp("");
        onBookingUpdated(successMessage);
      } else {
        throw new Error(response.data?.message || "Verification failed");
      }
    } catch (error: any) {
      setOtpError(
        error.response?.data?.message ||
          error.message ||
          "Invalid or expired OTP"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await api.delete(`/user/service-bookings/${booking.id}`);
      
      if (response.data?.success) {
        alert('Booking cancelled successfully!');
        onBookingUpdated();
        setShowCancelConfirm(false);
      } else {
        throw new Error(response.data?.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to cancel booking. Please try again.';
      alert(errorMsg);
    }
  };

  const handleModify = async () => {
    const isScheduled = booking.bookingType === "schedule";
    if (isScheduled && (!newScheduledDate || !newScheduledTime)) {
      alert("Please select both date and time");
      return;
    }

    setModifyLoading(true);
    try {
      const response = await api.patch(`/user/service-bookings/${booking.id}`, {
        scheduledDate: newScheduledDate || undefined,
        scheduledTime: newScheduledTime || undefined,
        location: newLocation || undefined,
        description: newDescription || undefined,
      });
      
      if (response.data?.success) {
        alert('Booking updated successfully!');
        onBookingUpdated();
        setShowModifyModal(false);
      } else {
        throw new Error(response.data?.message || 'Failed to update booking');
      }
    } catch (error: any) {
      console.error("Failed to modify booking:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update booking. Please try again.';
      alert(errorMsg);
    } finally {
      setModifyLoading(false);
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
          <div className="shrink-0">
            <UserAvatar
              name={booking.providerName}
              src={booking.providerImage}
              size="xl"
              className="rounded-lg"
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
                {booking.status === "on-the-way"
                  ? "On the way"
                  : booking.status === "in-progress"
                    ? "In progress"
                    : (booking.status || "pending").charAt(0).toUpperCase() +
                      (booking.status || "pending").slice(1)}
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
              {formatCurrency(booking.totalAmount)}
            </div>

            {(booking.status === "confirmed" ||
              booking.status === "on-the-way" ||
              booking.status === "in-progress" ||
              booking.trackingActive) && (
              <div className="mb-4">
                <ServiceLiveTrackPanel
                  bookingId={booking.id}
                  role="client"
                  compact
                />
              </div>
            )}

            {otpSuccess ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800">{otpSuccess}</p>
              </div>
            ) : pendingAction ? (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Provider requested{" "}
                  {pendingAction === "COMPLETE" ? "completion" : "cancellation"}
                </p>
                <p className="text-sm text-amber-800 mb-3">
                  Enter the 6-digit code we emailed you to confirm.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full sm:w-36 px-3 py-2 border border-amber-300 rounded-lg tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Button
                    className="bg-amber-600 hover:bg-amber-700 cursor-pointer"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? "Verifying..." : "Confirm with OTP"}
                  </Button>
                </div>
                {otpError && (
                  <p className="text-sm text-red-600 mt-2">{otpError}</p>
                )}
              </div>
            ) : null}

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
          <div className="shrink-0 flex flex-col gap-2">
            {booking.status === "confirmed" ||
            booking.status === "pending" ||
            booking.status === "on-the-way" ||
            booking.status === "in-progress" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 cursor-pointer"
                  onClick={() => setShowContactModal(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 cursor-pointer"
                  onClick={() => setShowModifyModal(true)}
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

      {/* Contact Provider Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Provider
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={booking.providerName}
                  src={booking.providerImage}
                  size="lg"
                  className="rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{booking.providerName}</h4>
                  <p className="text-sm text-gray-600">{booking.serviceName}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  We'll connect you with {booking.providerName} shortly.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Booking ID:</strong> {booking.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Service:</strong> {booking.serviceName}
                  </p>
                  {booking.scheduledDate && (
                    <p className="text-sm text-gray-600">
                      <strong>Scheduled:</strong> {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                  onClick={() => alert("Chat feature coming soon!")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={() => alert("Call feature coming soon!")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Request Callback
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowContactModal(false)}
                className="w-full cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Booking Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modify Booking
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{booking.serviceName}</strong>
                </p>
                <p className="text-sm text-gray-600">Provider: {booking.providerName}</p>
              </div>

              {booking.bookingType === "schedule" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      New Date
                    </label>
                    <input
                      type="date"
                      value={newScheduledDate}
                      onChange={(e) => setNewScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      New Time
                    </label>
                    <input
                      type="time"
                      value={newScheduledTime}
                      onChange={(e) => setNewScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Service Location
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Enter service location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Any specific requirements or instructions"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModifyModal(false)}
                  className="flex-1 cursor-pointer"
                  disabled={modifyLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                  onClick={handleModify}
                  disabled={modifyLoading}
                >
                  {modifyLoading ? "Updating..." : "Update Booking"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
