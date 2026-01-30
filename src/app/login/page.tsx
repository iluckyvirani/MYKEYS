"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on user role
        if (user.role === "OWNER") {
          router.push("/owner/dashboard");
        } else {
          router.push("/user/dashboard");
        }
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
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

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="password"
            placeholder="Password"
            className="input-field bg-gray-50 pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <label className="flex items-center gap-2">
            <input type="checkbox" disabled={loading} /> Remember me
          </label>
          <Link
            href="/forgot-password"
            className="hover:text-green-600 cursor-pointer font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login / Sign in"}
        </Button>

        <p className="text-center text-sm mt-2">
          Don't have an account?{" "}
          <Link href="/signup" className="text-green-600 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
