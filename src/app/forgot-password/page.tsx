"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ForgotPasswordRequest } from "@/types/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data: ForgotPasswordRequest = {
        email,
      };

      await api.post("/auth/forgot-password", data);

      setSuccess(true);
      setEmail("");
    } catch (err: any) {
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
    if (e.key === "Enter") {
      handleForgotPassword();
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-[5px] p-6">
            <div className="text-green-600 mb-4 flex justify-center">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-spartan font-bold mb-2 text-green-600">
              Check Your Email
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              We've sent password reset instructions to your email address. 
              Please check your inbox and follow the link to reset your password.
            </p>
            <p className="text-gray-500 text-xs">
              If you don't see the email, please check your spam folder.
            </p>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-2">Forgot Password?</h2>
      <p className="text-gray-600 text-sm mb-6">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
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
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        <button
          onClick={() => router.push("/login")}
          className="flex items-center justify-center gap-2 w-full text-green-600 hover:text-green-700 font-semibold text-sm mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </AuthLayout>
  );
}