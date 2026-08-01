"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { sanitizeRedirect } from "@/lib/auth/googleOAuthClient";

function GoogleCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/google/session", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Could not complete Google Sign-In");
        }

        const { accessToken, refreshToken, user } = json.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        if (!cancelled) {
          router.replace(sanitizeRedirect(searchParams.get("redirect") || "/"));
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Google Sign-In failed";
        if (!cancelled) {
          setError(message);
          setTimeout(() => {
            router.replace(
              `/login?error=${encodeURIComponent(message)}`
            );
          }, 2000);
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
        Signing you in…
      </h2>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-sm text-gray-600">
          Finishing Google Sign-In. Please wait.
        </p>
      )}
    </AuthLayout>
  );
}

export default function GoogleCompletePage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <h2 className="text-2xl font-spartan font-bold mb-4">Signing you in…</h2>
          <p className="text-sm text-gray-600">Please wait.</p>
        </AuthLayout>
      }
    >
      <GoogleCompleteContent />
    </Suspense>
  );
}
