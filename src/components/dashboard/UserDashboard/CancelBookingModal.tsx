"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookingId: string;
  propertyTitle: string;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
  propertyTitle,
}: CancelBookingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to cancel booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[5px]">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-[5px]">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Property:</strong> {propertyTitle}
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. You may be eligible for a partial
              refund based on the cancellation policy.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[5px]">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-[5px]"
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 rounded-[5px] bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
