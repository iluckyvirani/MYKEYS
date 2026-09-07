"use client";

import { loadStripe, Stripe } from "@stripe/stripe-js";
import { api } from "@/lib/api";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Load Stripe.js with publishable key from build env or server config API.
 * Server fallback fixes Vercel deploys where NEXT_PUBLIC_* was added after build.
 */
export function getStripePromise(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = resolveStripePublishableKey().then((key) => loadStripe(key));
  }
  return stripePromise;
}

async function resolveStripePublishableKey(): Promise<string> {
  const envKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  if (envKey?.startsWith("pk_") && !envKey.includes("NEXT_PUBLIC")) {
    return envKey;
  }
  const embedded = envKey?.match(/(pk_[A-Za-z0-9_]+)/)?.[1];
  if (embedded) {
    return embedded;
  }

  const response = await api.get<{ success: boolean; data: { publishableKey: string } }>(
    "/payments/stripe-config"
  );
  const key = response.data?.data?.publishableKey?.trim();
  if (!key) {
    throw new Error("Stripe publishable key is not configured on the server.");
  }
  return key;
}
