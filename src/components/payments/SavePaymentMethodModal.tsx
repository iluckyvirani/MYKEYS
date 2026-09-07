"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getStripePromise } from "@/lib/stripe-client";
import {
  buildStripeElementsOptions,
  stripePaymentElementOptions,
} from "@/lib/stripe/elementsOptions";

interface SavePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function SetupForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !ready) return;

    setSubmitting(true);
    setError(null);

    try {
      const { error: stripeError } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (stripeError) {
        const msg = stripeError.message || "Could not save card";
        setError(msg);
        onError(msg);
        return;
      }

      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "Could not save card";
      setError(msg);
      onError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Your card is stored securely by Stripe. You can use it for faster checkout next time.
      </p>
      <PaymentElement
        options={stripePaymentElementOptions}
        onReady={() => setReady(true)}
      />
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <Button type="submit" disabled={!stripe || !ready || submitting} className="w-full">
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving…
          </span>
        ) : (
          "Save card"
        )}
      </Button>
    </form>
  );
}

export function SavePaymentMethodModal({
  isOpen,
  onClose,
  onSaved,
}: SavePaymentMethodModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setError(null);
      return;
    }
    setStripePromise(getStripePromise());

    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post<{ success: boolean; data: { clientSecret: string } }>(
          "/payments/setup-intent"
        );
        const secret = res.data?.data?.clientSecret;
        if (!secret) throw new Error("Failed to start card setup");
        setClientSecret(secret);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })
            ?.response?.data?.message ||
          (err as Error)?.message ||
          "Failed to load payment form";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Add payment method</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-10 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">Loading secure form…</p>
          </div>
        )}

        {!loading && error && !clientSecret && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {!loading && clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={buildStripeElementsOptions(clientSecret)}>
            <SetupForm
              onSuccess={() => {
                onSaved?.();
                onClose();
              }}
              onError={setError}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
