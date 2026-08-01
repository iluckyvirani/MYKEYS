"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import GoogleAuthButton, {
  AuthDivider,
} from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) setError(oauthError);
  }, [searchParams]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginData: LoginRequest = {
        email,
        password,
      };

      const response = await api.post<LoginResponse>("/auth/login", loginData);

      if (response.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-6">Login</h2>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        <GoogleAuthButton redirect={redirectTo} label="Continue with Google" />
        <AuthDivider text="or continue with email" />

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

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input-field bg-gray-50 pl-10 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <label className="flex items-center gap-2">
            <input type="checkbox" disabled={loading} /> Remember me
          </label>
          <Link
            href="/forgot-password"
            className="hover:text-[#339390] cursor-pointer font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login / Sign in"}
        </Button>

        <p className="text-center text-sm mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#339390] font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <h2 className="text-2xl font-spartan font-bold mb-6">Login</h2>
          <p className="text-gray-500 text-sm">Loading...</p>
        </AuthLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
