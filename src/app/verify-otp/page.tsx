"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/otpConstants";
import { Mail } from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.replace("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const otpValue = digits.join("");

  const focusIndex = (idx: number) => {
    inputsRef.current[idx]?.focus();
    inputsRef.current[idx]?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Paste full OTP
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      const next = ["", "", "", "", "", ""];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      setDigits(next);
      focusIndex(Math.min(chars.length, 5));
      return;
    }

    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (index < 5) focusIndex(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusIndex(index - 1);
    }
    if (e.key === "Enter") {
      void verify();
    }
  };

  const verify = useCallback(async () => {
    if (!email) return;
    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: otpValue });
      if (res.data?.success && res.data.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        setSuccess("Verified! Signing you in…");
        router.push("/");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [email, otpValue, router]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/auth/resend-otp", { email });
      if (res.data?.success) {
        setSuccess("A new OTP has been sent to your email.");
        setCooldown(
          res.data.data?.resendCooldownSeconds || OTP_RESEND_COOLDOWN_SECONDS
        );
        setDigits(["", "", "", "", "", ""]);
        focusIndex(0);
      }
    } catch (err: any) {
      const retry =
        err.response?.data?.errors?.retryAfter?.[0] ||
        err.response?.data?.message;
      if (err.response?.status === 429) {
        const match = String(retry || "").match(/(\d+)/);
        if (match) setCooldown(Number(match[1]));
      }
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <>
      <h2 className="text-2xl font-spartan font-bold mb-2 text-center text-[#0f172a]">
        Verify your email
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-[#339390]">{email || "your email"}</span>
      </p>

      <div className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-[#f0fafa] border border-[#b6e2e0] text-[#1f6f6c] px-4 py-3 rounded-[5px] text-sm">
            {success}
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-[#cfe8e6] bg-[#f8fcfc] text-[#0f172a] outline-none focus:border-[#339390] focus:ring-2 focus:ring-[#339390]/25 disabled:opacity-50"
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-[#339390]" />
          {cooldown > 0 ? (
            <span>
              Resend code in{" "}
              <span className="font-semibold text-[#339390]">
                {formatTime(cooldown)}
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="font-semibold text-[#339390] hover:underline cursor-pointer disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          )}
        </div>

        <Button
          onClick={verify}
          disabled={loading || otpValue.length !== 6}
          className="w-full bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-11"
        >
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Wrong email?{" "}
          <Link href="/signup" className="text-[#339390] font-semibold">
            Sign up again
          </Link>
        </p>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <p className="text-center text-gray-500 text-sm">Loading…</p>
        }
      >
        <VerifyOtpContent />
      </Suspense>
    </AuthLayout>
  );
}
