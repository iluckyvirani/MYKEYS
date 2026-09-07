import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStoredUserFromLocalStorage } from "@/lib/auth/storedUser";

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

/** Compact card-only Payment Element for service checkout. */
export const compactStripePaymentElementOptions = {
  layout: "tabs" as const,
  paymentMethodOrder: ["card"],
  wallets: {
    applePay: "never" as const,
    googlePay: "never" as const,
    link: "never" as const,
  },
  fields: {
    billingDetails: {
      email: "never" as const,
      phone: "never" as const,
      name: "never" as const,
    },
  },
};

/**
 * Required when Payment Element hides billing fields (`never`).
 * Stripe rejects confirmPayment unless those values are supplied here.
 */
export function buildCompactStripeConfirmParams(returnUrl?: string) {
  const user = getStoredUserFromLocalStorage();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.email ||
    "MYKEYS customer";

  return {
    ...(returnUrl ? { return_url: returnUrl } : {}),
    payment_method_data: {
      billing_details: {
        name,
        email: user?.email || undefined,
        phone: user?.phone || undefined,
      },
    },
  };
}
