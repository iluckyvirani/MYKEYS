/**
 * Stripe Configuration
 * Server-side Stripe SDK instance and helpers
 */

import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    'Missing Stripe credentials. Please set STRIPE_SECRET_KEY in environment variables.'
  );
}

/**
 * Server-side Stripe instance (used in API routes and server actions only)
 */
export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-04-22.dahlia',
});

/**
 * Convert a GBP amount (decimal) to the smallest currency unit (pence)
 */
export function toPence(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert pence back to a GBP decimal amount
 */
export function fromPence(pence: number): number {
  return Math.round(pence) / 100;
}

export default stripe;
