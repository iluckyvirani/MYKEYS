"use client";

import { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getStripePromise } from "@/lib/stripe-client";
import {
  buildStripeElementsOptions,
  stripePaymentElementOptions,
} from "@/lib/stripe/elementsOptions";

function PaymentForm({
  bookingId,
  amount,
  onSuccess,
  onError,
}: {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        onError(error.message || "Payment failed");
        return;
      }
      await api.post(`/services/bookings/${bookingId}/confirm-payment`, {
        stripePaymentIntentId: paymentIntent?.id,
      });
      onSuccess();
    } catch (err: any) {
      onError(err?.response?.data?.message || err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={stripePaymentElementOptions} />
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
          </>
        ) : (
          `Pay £${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function ServiceBookingPaymentModal({
  isOpen,
  bookingId,
  serviceName,
  amount,
  clientSecret,
  publishableKey,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  bookingId: string;
  serviceName: string;
  amount: number;
  clientSecret: string;
  publishableKey?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDone(false);
    setError("");
    setStripePromise(getStripePromise());
  }, [isOpen, publishableKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Pay MYKEYS</h3>
            <p className="text-sm text-gray-500">{serviceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          {done ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-semibold">Payment successful</p>
            </div>
          ) : stripePromise && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={buildStripeElementsOptions(clientSecret)}
            >
              {error && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}
              <PaymentForm
                bookingId={bookingId}
                amount={amount}
                onSuccess={() => {
                  setDone(true);
                  setTimeout(onSuccess, 800);
                }}
                onError={setError}
              />
            </Elements>
          ) : (
            <div className="py-10 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
