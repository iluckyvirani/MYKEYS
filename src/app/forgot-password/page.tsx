"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
    } catch (err: any) {
      if (err.response?.status === 429) {
        // Still take them to reset page so they can wait / use existing OTP
        router.push(
          `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`
        );
        return;
      }
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to process request. Please try again.";
      setError(message);
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleForgotPassword();
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-2 text-[#0f172a]">
        Forgot Password?
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Enter your email and we&apos;ll send a 6-digit OTP to reset your
        password.
      </p>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field bg-gray-50 pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <Button
          onClick={handleForgotPassword}
          disabled={loading || !email}
          className="w-full bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP…" : "Send OTP"}
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full text-[#339390] hover:underline font-semibold text-sm mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
