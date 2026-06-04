import type { StripeElementsOptions } from "@stripe/stripe-js";

/** Shared Stripe Elements appearance for checkout modals. */
export function buildStripeElementsOptions(
  clientSecret: string
): StripeElementsOptions {
  return {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: { colorPrimary: "#16a34a" },
    },
  };
}

/** Payment Element options — enables saved cards when PI has a customer. */
export const stripePaymentElementOptions = {
  layout: "tabs" as const,
  paymentMethodOrder: ["card", "link"],
};
