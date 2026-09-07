/**
 * Stripe Configuration
 * Server-side Stripe SDK instance and helpers
 */

import Stripe from 'stripe';
import { readStripeSecretKey } from './stripe-config';

// Lazy singleton — validated at request time, not at build/import time.
// This prevents `next build` from crashing when env vars aren't set in CI.
let _stripe: Stripe | undefined;

function getStripeInstance(): Stripe {
  if (!_stripe) {
    const secretKey = readStripeSecretKey();
    _stripe = new Stripe(secretKey, {
      apiVersion: '2026-05-27.dahlia',
    });
  }
  return _stripe;
}

/**
 * Server-side Stripe instance (used in API routes and server actions only).
 * Proxy so call-sites keep the same `stripe.xyz` syntax unchanged.
 */
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => getStripeInstance()[prop as keyof Stripe],
});

/**
 * Convert a GBP amount (decimal) to the smallest currency unit (pence)
 */
export function toPence(amount: number): number {
  return Math.round(amount * 100);
}

/** Stripe's minimum charge for GBP (30 pence). */
export const STRIPE_MIN_AMOUNT_GBP = 0.3;

export function assertStripeMinAmount(amount: number, currency = "GBP") {
  const cur = currency.toUpperCase();
  if (cur === "GBP" && amount > 0 && amount < STRIPE_MIN_AMOUNT_GBP) {
    throw new Error(
      `Amount must be at least £${STRIPE_MIN_AMOUNT_GBP.toFixed(2)} GBP (Stripe minimum). This package is priced at £${Number(amount).toFixed(2)} — update the package price in Admin → Packages.`
    );
  }
}

/**
 * Convert pence back to a GBP decimal amount
 */
export function fromPence(pence: number): number {
  return Math.round(pence) / 100;
}

export default stripe;
