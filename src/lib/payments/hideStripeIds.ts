/** Strip Stripe identifiers from payloads shown to non-admin users. */
export function hideStripeIds<T>(payment: T): T {
  return {
    ...(payment as object),
    stripePaymentIntentId: null,
    stripeChargeId: null,
  } as T;
}
