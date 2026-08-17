"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import GoogleAuthButton, {
  AuthDivider,
} from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

type Step = "email" | "password";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState<{
    emailMasked: string;
  } | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) setError(oauthError);
  }, [searchParams]);

  const goToPasswordStep = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setEmail(trimmed);
    setError("");
    setPassword("");
    setStep("password");
  };

  const goBackToEmail = () => {
    setStep("email");
    setPassword("");
    setError("");
    setMagicSent(null);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginData: LoginRequest = { email, password };
      const response = await api.post<LoginResponse>("/auth/login", loginData);

      if (response.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        if (staySignedIn) {
          localStorage.setItem("staySignedIn", "1");
        }

        router.push(redirectTo);
      }
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";

      if (code === "ACCOUNT_PENDING") {
        router.push(
          `/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`
        );
        return;
      }

      setError(message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError("Enter your email address to receive a one-time link.");
      return;
    }

    setMagicLoading(true);
    setError("");

    try {
      const timeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
      const res = await fetch("/api/auth/magic-link/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirect: redirectTo,
          timeZone,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        if (json?.code === "ACCOUNT_PENDING") {
          router.push(
            `/verify-otp?email=${encodeURIComponent(
              email.trim().toLowerCase()
            )}`
          );
          return;
        }
        throw new Error(json?.message || "Could not send sign-in link");
      }

      setMagicSent({
        emailMasked: json.data?.emailMasked || email.trim().toLowerCase(),
      });
    } catch (err: any) {
      setError(
        err?.message || "Could not send sign-in link. Please try again."
      );
    } finally {
      setMagicLoading(false);
    }
  };

  const busy = loading || magicLoading;

  if (magicSent) {
    return (
      <AuthLayout compact>
        <h2 className="text-xl font-spartan font-bold mb-2 text-[#0f172a]">
          Check your email
        </h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          We sent a one-time sign-in link to{" "}
          <span className="font-semibold text-[#0f172a]">
            {magicSent.emailMasked}
          </span>
          . It expires in <strong>10 minutes</strong>.
        </p>
        <Button
          type="button"
          onClick={() => {
            setMagicSent(null);
            setStep("password");
          }}
          className="w-full h-10 bg-[#e8f6f5] hover:bg-[#d5efed] text-[#0f172a] border border-[#339390] rounded-[5px]"
        >
          Back to sign in
        </Button>
      </AuthLayout>
    );
  }

  if (step === "email") {
    return (
      <AuthLayout compact>
        <h2 className="text-xl font-spartan font-bold mb-4">Sign in</h2>

        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-[5px] text-sm">
              {error}
            </div>
          )}

          <GoogleAuthButton redirect={redirectTo} label="Continue with Google" />
          <AuthDivider text="or" />

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
              <input
                type="email"
                placeholder="Email address"
                className="input-field bg-gray-50 pl-10 h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") goToPasswordStep();
                }}
                autoFocus
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={goToPasswordStep}
            className="w-full h-10 bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px]"
          >
            Continue
          </Button>

          <p className="text-center text-sm pt-1">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#339390] font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout compact>
      <h2 className="text-xl font-spartan font-bold mb-4">Sign in</h2>

      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        <div className="rounded-[5px] bg-gray-50 border border-gray-100 px-3 py-2">
          <p className="text-xs text-gray-500">Signing in as</p>
          <p className="text-sm font-semibold text-[#0f172a] truncate">{email}</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0f172a] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field bg-gray-50 pl-10 pr-14 h-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              disabled={busy}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-700"
              disabled={busy}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="mt-1.5">
            <Link
              href="/forgot-password"
              className="text-sm text-[#339390] font-semibold hover:underline"
            >
              Forgotten your password?
            </Link>
          </div>
        </div>

        <label className="flex items-center gap-2.5 rounded-[5px] bg-gray-100 px-3 py-2.5 text-sm text-[#334155] cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#339390]"
            checked={staySignedIn}
            onChange={(e) => setStaySignedIn(e.target.checked)}
            disabled={busy}
          />
          Stay signed in
        </label>

        <Button
          onClick={handleLogin}
          disabled={busy}
          className="w-full h-10 bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <AuthDivider text="OR" />

        <Button
          type="button"
          onClick={handleMagicLink}
          disabled={busy}
          className="w-full h-10 bg-[#e8f6f5] hover:bg-[#d5efed] text-[#0f172a] font-semibold border-2 border-[#339390] rounded-[5px] disabled:opacity-50"
        >
          {magicLoading
            ? "Sending link..."
            : "Sign in with a one-time link"}
        </Button>

        <button
          type="button"
          onClick={goBackToEmail}
          disabled={busy}
          className="w-full text-center text-sm text-[#339390] font-semibold hover:underline pt-1"
        >
          Sign in with a different email
        </button>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout compact>
          <h2 className="text-xl font-spartan font-bold mb-4">Sign in</h2>
          <p className="text-gray-500 text-sm">Loading...</p>
        </AuthLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
