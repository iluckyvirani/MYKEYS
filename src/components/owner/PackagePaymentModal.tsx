/**
 * Package Payment Modal
 * Opens Stripe Elements checkout for an owner package subscription.
 * Calls POST /api/packages/:ownerPackageId/payments to create the PaymentIntent,
 * then POST /api/payments/:paymentId/verify to confirm and activate the package.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { X, Loader2, AlertCircle, CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getStripePromise } from "@/lib/stripe-client";
import {
  buildStripeElementsOptions,
  stripePaymentElementOptions,
} from "@/lib/stripe/elementsOptions";
import { useDashboardBase } from "@/lib/dashboard/DashboardContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackagePaymentModalProps {
  isOpen: boolean;
  ownerPackageId: string;
  packageName: string;
  amount: number;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaymentFormProps {
  paymentId: string;
  packageName: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// ─── Inner form ───────────────────────────────────────────────────────────────

function PaymentForm({ paymentId, packageName, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { basePath } = useDashboardBase();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elementsReady, setElementsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !elementsReady) return;

    setSubmitting(true);
    setError(null);

    try {
      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}${basePath}/packages?payment=return`
          : `${basePath}/packages?payment=return`;

      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: returnUrl,
        },
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

      await api.post(`/payments/${paymentId}/verify`, {
        stripePaymentIntentId: paymentIntent.id,
      });

      onSuccess();
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
          <span className="text-gray-600">Package:</span>
          <span className="font-medium text-gray-900">{packageName}</span>
        </div>
        <div className="flex justify-between text-sm border-t pt-2">
          <span className="text-gray-600 font-semibold">Total:</span>
          <span className="font-bold text-gray-900 text-base">
            £{amount.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Saved cards appear automatically. Tick save in Stripe to store your card for future payments.
      </p>

      <PaymentElement
        options={stripePaymentElementOptions}
        onReady={() => setElementsReady(true)}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !elementsReady || submitting}
        className="w-full rounded-lg py-3 text-base font-semibold bg-green-600 hover:bg-green-700"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </span>
        ) : (
          `Pay £${amount.toLocaleString()} & Activate`
        )}
      </Button>
    </form>
  );
}

// ─── Outer modal ──────────────────────────────────────────────────────────────

export default function PackagePaymentModal({
  isOpen,
  ownerPackageId,
  packageName,
  amount,
  onClose,
  onSuccess,
  onError,
}: PackagePaymentModalProps) {
  const router = useRouter();
  const { basePath } = useDashboardBase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStripePromise(getStripePromise());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || clientSecret) return;

    const initiate = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.post(`/packages/${ownerPackageId}/payments`, {
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
        onError?.(msg);
      } finally {
        setLoading(false);
      }
    };

    initiate();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when modal closes
  const handleClose = () => {
    setClientSecret(null);
    setPaymentId(null);
    setError(null);
    setActivated(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[min(92vh,720px)] flex flex-col overflow-hidden">
        {/* Sticky header — close always visible on laptop scroll */}
        {!activated && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-white shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Activate Package
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>
        )}

        <div className="px-5 py-5 overflow-y-auto flex-1 min-h-0">

        {/* Success state */}
        {activated && (
          <div className="text-center py-4">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Package Activated!</h3>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">{packageName}</span> is now active on your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You can now publish listings under this package.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-green-50 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">£{amount.toLocaleString()} paid</span>
            </div>
            <Button
              onClick={() => {
                handleClose();
                router.push(basePath);
              }}
              className="w-full rounded-lg bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {/* Loading */}
        {!activated && loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-gray-600 text-sm">Preparing secure checkout…</p>
          </div>
        )}

        {/* Init error */}
        {!activated && !loading && error && !clientSecret && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
            <Button variant="outline" onClick={handleClose} className="w-full rounded-lg">
              Close
            </Button>
          </div>
        )}

        {/* Stripe form */}
        {!activated && !loading && clientSecret && paymentId && stripePromise && (
          <Elements
            stripe={stripePromise}
            options={buildStripeElementsOptions(clientSecret)}
          >
            <PaymentForm
              paymentId={paymentId}
              packageName={packageName}
              amount={amount}
              onSuccess={() => {
                setActivated(true);
                onSuccess?.();
              }}
              onError={(msg) => {
                setError(msg);
                onError?.(msg);
              }}
            />
          </Elements>
        )}
        </div>
      </div>
    </div>
  );
}
