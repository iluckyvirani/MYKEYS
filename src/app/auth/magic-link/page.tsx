"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import { sanitizeRedirect } from "@/lib/auth/googleOAuthClient";

function MagicLinkCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;
    const token = searchParams.get("token") || "";
    const redirect = sanitizeRedirect(searchParams.get("redirect") || "/");

    (async () => {
      if (!token) {
        if (!cancelled) {
          setError("This sign-in link is missing or incomplete.");
          setStatus("Sign-in failed");
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/magic-link/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Could not complete sign-in");
        }

        const { accessToken, refreshToken, user } = json.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        if (!cancelled) {
          setStatus("Signed in — redirecting…");
          router.replace(redirect);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Sign-in link failed";
        if (!cancelled) {
          setError(message);
          setStatus("Sign-in failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-4 text-[#0f172a]">
        {status}
      </h2>
      {error ? (
        <div className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <p className="text-sm text-gray-600">
            Links expire after 10 minutes and can only be used once.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-semibold text-[#339390] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Completing your one-time link sign-in. Please wait.
        </p>
      )}
    </AuthLayout>
  );
}

export default function MagicLinkCompletePage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <h2 className="text-2xl font-spartan font-bold mb-4">
            Signing you in…
          </h2>
          <p className="text-sm text-gray-600">Please wait.</p>
        </AuthLayout>
      }
    >
      <MagicLinkCompleteContent />
    </Suspense>
  );
}
