import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

/**
 * Get or create a Stripe Customer for the user (required for saved payment methods).
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.stripeCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!existing.deleted) {
        return user.stripeCustomerId;
      }
    } catch {
      // Customer missing in Stripe — create a new one below
    }
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim() || undefined,
    metadata: { userId: user.id },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/** Attach customer + save-for-future flag to PaymentIntent creation. */
export async function withStripeCustomerForPayment(
  userId: string,
  params: Stripe.PaymentIntentCreateParams,
  opts?: { saveForFuture?: boolean }
): Promise<Stripe.PaymentIntentCreateParams> {
  const customerId = await getOrCreateStripeCustomer(userId);
  return {
    ...params,
    customer: customerId,
    ...(opts?.saveForFuture === false
      ? {}
      : { setup_future_usage: "off_session" }),
  };
}

export type SavedPaymentMethodDTO = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export async function listSavedPaymentMethods(
  userId: string
): Promise<SavedPaymentMethodDTO[]> {
  const customerId = await getOrCreateStripeCustomer(userId);
  const customer = await stripe.customers.retrieve(customerId);
  const defaultPmId =
    typeof customer !== "string" && !customer.deleted
      ? (customer.invoice_settings?.default_payment_method as string | null)
      : null;

  const methods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  return methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand || "card",
    last4: pm.card?.last4 || "****",
    expMonth: pm.card?.exp_month || 0,
    expYear: pm.card?.exp_year || 0,
    isDefault: pm.id === defaultPmId,
  }));
}

export async function detachPaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  const customerId = await getOrCreateStripeCustomer(userId);
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== customerId) {
    throw new Error("Payment method does not belong to this account");
  }
  await stripe.paymentMethods.detach(paymentMethodId);
}

export async function createSetupIntent(userId: string): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(userId);
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: { enabled: true },
    usage: "off_session",
  });
  if (!setupIntent.client_secret) {
    throw new Error("Failed to create setup intent");
  }
  return setupIntent.client_secret;
}
