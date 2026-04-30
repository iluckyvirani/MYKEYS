/**
 * Razorpay Payment Modal Component
 * Handles payment gateway integration after booking
 */

"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  amount: number;
  propertyTitle: string;
  onClose: () => void;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

export function RazorpayPaymentModal({
  isOpen,
  bookingId,
  amount,
  propertyTitle,
  onClose,
  onPaymentSuccess,
  onPaymentError,
}: RazorpayPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Handle payment initiation
  const handlePaymentInitiation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initiate payment on backend
      const response = await api.post(`/bookings/${bookingId}/payments`, {
        amount,
        paymentMethod: "UPI", // Default to UPI, can be made dynamic
        currency: "GBP",
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to initiate payment");
      }

      const { payment, razorpayOrder } = response.data.data;

      // Open Razorpay checkout
      openRazorpayCheckout(payment, razorpayOrder);
      setPaymentInitiated(true);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to initiate payment";
      setError(errorMsg);
      onPaymentError?.(errorMsg);
      console.error("Payment initiation error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open Razorpay checkout
  const openRazorpayCheckout = (
    payment: any,
    razorpayOrder: any
  ) => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      setError("Razorpay configuration missing");
      return;
    }

    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount, // Amount in paise (smallest unit)
      currency: "GBP",
      order_id: razorpayOrder.orderId,
      name: "MYKEYS",
      description: `Booking for ${propertyTitle}`,
      prefill: {
        name: "Guest",
        email: "guest@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#16a34a", // Green color
      },
      handler: async (response: any) => {
        // Payment successful, verify signature
        await verifyPayment(payment.id, response);
      },
      modal: {
        ondismiss: () => {
          setError("Payment cancelled by user");
          setPaymentInitiated(false);
        },
      },
    };

    // Cast window to any to access Razorpay
    const Razorpay = (window as any).Razorpay;
    if (Razorpay) {
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } else {
      setError("Razorpay SDK not loaded. Please refresh the page.");
    }
  };

  // Verify payment signature
  const verifyPayment = async (paymentId: string, razorpayResponse: any) => {
    try {
      setVerifying(true);
      setError(null);

      const response = await api.post(`/payments/${paymentId}/verify`, {
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Payment verification failed"
        );
      }

      setPaymentCompleted(true);
      onPaymentSuccess?.(paymentId);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to verify payment";
      setError(errorMsg);
      onPaymentError?.(errorMsg);
      console.error("Payment verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        {!paymentInitiated && !paymentCompleted && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Payment Completed State */}
        {paymentCompleted ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-2">
              Your booking has been confirmed.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive a confirmation email shortly with your booking
              details.
            </p>

            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">£{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-sm">{bookingId}</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full py-2 rounded-lg cursor-pointer bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Complete Payment
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Secure payment gateway powered by Razorpay
              </p>
            </div>

            {/* Booking Details */}
            <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Property</p>
                  <p className="font-medium text-gray-900 line-clamp-2">
                    {propertyTitle}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <span className="text-gray-700 font-medium">Amount to Pay:</span>
                <span className="text-2xl font-bold text-green-600">
                  £{amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Payment Methods Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Accepted Payment Methods:</span>
                <br />
                Cards • UPI • Net Banking • Wallets
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePaymentInitiation}
                disabled={loading || verifying}
                className="w-full py-3 rounded-lg cursor-pointer bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Payment...
                  </>
                ) : (
                  `Pay £${amount.toLocaleString()}`
                )}
              </Button>

              {!loading && !verifying && (
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                Your payment is secure and encrypted by Razorpay
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
