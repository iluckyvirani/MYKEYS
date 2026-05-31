/**
 * Stripe Payment Modal Component
 * Handles payment collection using Stripe Elements after a booking is made.
 */

"use client";

import { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getStripePromise } from "@/lib/stripe-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StripePaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  amount: number;
  propertyTitle: string;
  onClose: () => void;
  onPaymentSuccess?: (paymentId: string) => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentFormProps {
  paymentId: string;
  amount: number;
  propertyTitle: string;
  bookingId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

// ─── Inner form (needs access to Stripe hooks) ────────────────────────────────

function PaymentForm({
  paymentId,
  amount,
  propertyTitle,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (stripeError) {
        const msg = stripeError.message || "Payment failed. Please try again.";
        setError(msg);
        onError(msg);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        const msg = `Unexpected payment status: ${paymentIntent?.status}`;
        setError(msg);
        onError(msg);
        return;
      }

      // Notify backend to confirm and update DB
      await api.post(`/payments/${paymentId}/verify`, {
        stripePaymentIntentId: paymentIntent.id,
      });

      onSuccess(paymentId);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Payment processing failed";
      setError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Property:</span>
          <span className="font-medium text-gray-900 text-right max-w-[60%] truncate">
            {propertyTitle}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-900">
            £{amount.toLocaleString()}
          </span>
        </div>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-lg py-3 text-base font-semibold"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </span>
        ) : (
          `Pay £${amount.toLocaleString()}`
        )}
      </Button>
    </form>
  );
}

// ─── Outer modal (loads Elements when clientSecret is ready) ──────────────────

export function StripePaymentModal({
  isOpen,
  bookingId,
  amount,
  propertyTitle,
  onClose,
  onPaymentSuccess,
  onPaymentError,
}: StripePaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStripePromise(getStripePromise());
  }, [isOpen]);

  // Create the PaymentIntent when the modal opens
  useEffect(() => {
    if (!isOpen || clientSecret) return;

    const initiate = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post(`/bookings/${bookingId}/payments`, {
          amount,
          paymentMethod: "CREDIT_CARD",
          currency: "GBP",
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to initiate payment");
        }

        const { payment, clientSecret: secret } = response.data.data;
        setPaymentId(payment.id);
        setClientSecret(secret);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to initiate payment";
        setError(msg);
        onPaymentError?.(msg);
      } finally {
        setLoading(false);
      }
    };

    initiate();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        {!paymentCompleted && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
            {!loading && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Payment Completed */}
        {paymentCompleted && (
          <div className="text-center py-4">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-2">Your booking has been confirmed.</p>
            <p className="text-sm text-gray-500 mb-6">
              You will receive a confirmation email shortly.
            </p>
            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">£{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono">{bookingId}</span>
              </div>
            </div>
            <Button onClick={onClose} className="w-full rounded-lg">
              Done
            </Button>
          </div>
        )}

        {/* Loading state */}
        {!paymentCompleted && loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-gray-600 text-sm">Preparing secure checkout…</p>
          </div>
        )}

        {/* Error before form loaded */}
        {!paymentCompleted && !loading && error && !clientSecret && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full rounded-lg">
              Close
            </Button>
          </div>
        )}

        {/* Stripe Elements form */}
        {!paymentCompleted && !loading && clientSecret && paymentId && stripePromise && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: { colorPrimary: "#16a34a" },
              },
            }}
          >
            <PaymentForm
              paymentId={paymentId}
              amount={amount}
              propertyTitle={propertyTitle}
              bookingId={bookingId}
              onSuccess={(id) => {
                setPaymentCompleted(true);
                onPaymentSuccess?.(id);
              }}
              onError={(msg) => {
                setError(msg);
                onPaymentError?.(msg);
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
