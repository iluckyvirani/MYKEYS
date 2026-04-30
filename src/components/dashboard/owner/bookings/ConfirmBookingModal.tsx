"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookingTitle: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  loading?: boolean;
}

export function ConfirmBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingTitle,
  guestName,
  checkInDate,
  checkOutDate,
  totalAmount,
  loading = false,
}: ConfirmBookingModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error confirming booking:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-[5px] p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              You're about to confirm this booking. The guest will receive a confirmation notification.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500">PROPERTY</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{bookingTitle}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">GUEST</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{guestName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">CHECK-IN</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(checkInDate).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">CHECK-OUT</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {new Date(checkOutDate).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">TOTAL AMOUNT</label>
              <p className="text-lg font-bold text-green-600 mt-1">
                £{totalAmount.toLocaleString('en-GB')}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Confirming..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
