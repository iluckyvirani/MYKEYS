/**
 * Stripe env helpers — no Stripe SDK import (safe for validation only)
 */

function extractStripeKey(value: string, prefix: "pk_" | "sk_"): string | null {
  const match = value.match(new RegExp(`(${prefix}[A-Za-z0-9_]+)`));
  return match?.[1] ?? null;
}

function looksLikeEnvVarName(value: string): boolean {
  return (
    value.includes("NEXT_PUBLIC") ||
    value.startsWith("NEXT_") ||
    value === "STRIPE_SECRET_KEY" ||
    value === "STRIPE_WEBHOOK_SECRET" ||
    value === "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ||
    /^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\s*=/.test(value)
  );
}

export function readStripeSecretKey(): string {
  const raw = process.env.STRIPE_SECRET_KEY?.trim();

  if (!raw) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add your sk_test_... or sk_live_... key in Vercel environment variables."
    );
  }

  const key = raw.startsWith("sk_") ? raw : extractStripeKey(raw, "sk_");
  if (!key) {
    if (looksLikeEnvVarName(raw)) {
      throw new Error(
        "STRIPE_SECRET_KEY looks like a variable name, not a real Stripe secret key. Paste only the sk_... value from Stripe Dashboard → Developers → API keys."
      );
    }
    throw new Error("STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.");
  }

  if (key.startsWith("pk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must be a secret key (sk_...), not the publishable key (pk_...)."
    );
  }

  return key;
}

export function readStripePublishableKey(): string {
  const raw = (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY
  )?.trim();

  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Add your pk_test_... or pk_live_... key in Vercel and redeploy."
    );
  }

  const key = raw.startsWith("pk_") ? raw : extractStripeKey(raw, "pk_");
  if (!key) {
    if (looksLikeEnvVarName(raw)) {
      throw new Error(
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY looks like a variable name, not a real Stripe publishable key. Paste only the pk_... value from Stripe Dashboard (not the line NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...)."
      );
    }
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_."
    );
  }

  if (key.startsWith("sk_")) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must be a publishable key (pk_...), not sk_..."
    );
  }

  return key;
}
