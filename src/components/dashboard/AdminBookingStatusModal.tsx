"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Home, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Booking {
  id: string;
  guestName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus?: string;
}

interface AdminBookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, status: string, paymentStatus?: string, notes?: string) => void;
  booking: Booking | null;
  loading?: boolean;
}

const BOOKING_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "CHECKED_IN", label: "Checked In", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "CHECKED_OUT", label: "Checked Out", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { value: "COMPLETED", label: "Completed", color: "bg-gray-100 text-gray-700 border-gray-300" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700 border-red-300" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "PAID", label: "Paid", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "PARTIAL", label: "Partial", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "FAILED", label: "Failed", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "REFUNDED", label: "Refunded", color: "bg-purple-100 text-purple-700 border-purple-300" },
];

export function AdminBookingStatusModal({
  isOpen,
  onClose,
  onSave,
  booking,
  loading = false,
}: AdminBookingStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("PENDING");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (booking) {
      setSelectedStatus(booking.status.toUpperCase());
      setSelectedPaymentStatus(booking.paymentStatus?.toUpperCase() || "PENDING");
      setNotes("");
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSave = () => {
    onSave(booking.id, selectedStatus, selectedPaymentStatus, notes || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4 rounded-[5px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Update Booking Status</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Booking Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{booking.propertyTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{booking.guestName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {booking.checkIn} - {booking.checkOut}
              </span>
            </div>
          </div>

          {/* Booking Status Selection */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Booking Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BOOKING_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    selectedStatus === option.value
                      ? `${option.color} border-current`
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status Selection */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CreditCard className="w-4 h-4" />
              Payment Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPaymentStatus(option.value)}
                  className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                    selectedPaymentStatus === option.value
                      ? `${option.color} border-current`
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Warning for cancellation */}
          {selectedStatus === "CANCELLED" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> Cancelling this booking will notify the guest and may trigger a refund process.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Admin Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-[5px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 rounded-[5px]"
            >
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
