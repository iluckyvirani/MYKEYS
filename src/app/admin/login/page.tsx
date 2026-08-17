"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LoginRequest, LoginResponse } from "@/types/auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        // Check if user is admin
        if (!user.roles.includes("ADMIN")) {
          setError("Unauthorized: Admin access only");
          setLoading(false);
          return;
        }

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("admin_auth_verified", "true");

        // Full navigation so admin layout re-runs auth for the dashboard
        router.replace("/admin/dashboard");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setError(message);
      console.error("Admin login error:", err);
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
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 rounded-lg bg-linear-to-r from-green-600 to-emerald-500 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
      </div>

      <h2 className="text-2xl font-spartan font-bold mb-2 text-center">Admin Portal</h2>
      <p className="text-center text-gray-600 text-sm mb-6">Secure access for administrators</p>

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
            placeholder="Admin Email Address"
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
            type={showPassword ? "text" : "password"}
            placeholder="Admin Password"
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
          {loading ? "Logging in..." : "Admin Login"}
        </Button>

        <div className="text-center text-sm text-gray-600 pt-2 border-t">
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">
            Back to Regular Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
