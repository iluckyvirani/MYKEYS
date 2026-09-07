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
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim().toLowerCase();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_SECONDS);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace("/forgot-password");
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
  };

  const passwordOk =
    newPassword.length >= 8 &&
    /[a-z]/.test(newPassword) &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  const submit = useCallback(async () => {
    if (!email) return;
    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    if (!passwordOk) {
      setError(
        "Password must be 8+ chars with upper, lower, number, and special character"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: otpValue,
        newPassword,
        confirmPassword,
      });
      setSuccess("Password updated! Redirecting to login…");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [email, otpValue, newPassword, confirmPassword, passwordOk, router]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("A new OTP has been sent to your email.");
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setDigits(["", "", "", "", "", ""]);
      focusIndex(0);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      if (err.response?.status === 429) {
        const match = String(msg || "").match(/(\d+)/);
        if (match) setCooldown(Number(match[1]));
      }
      setError(msg || "Could not resend OTP.");
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
        Reset password
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        Enter the OTP sent to{" "}
        <span className="font-semibold text-[#339390]">{email}</span>, then
        choose a new password.
      </p>

      <div className="space-y-4">
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

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            className="input-field bg-gray-50 pl-10 pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm new password"
            className="input-field bg-gray-50 pl-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button
          onClick={submit}
          disabled={
            loading ||
            otpValue.length !== 6 ||
            !newPassword ||
            !confirmPassword
          }
          className="w-full bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px] cursor-pointer disabled:opacity-50 h-11"
        >
          {loading ? "Updating…" : "Reset password"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-[#339390] font-semibold">
            Back to login
          </Link>
        </p>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <p className="text-center text-gray-500 text-sm">Loading…</p>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
