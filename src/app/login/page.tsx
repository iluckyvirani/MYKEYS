"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // dummy token (replace with API later)
    localStorage.setItem("auth_token", "demo_auth_token_123");
    localStorage.setItem("user_email", email);

    router.push("/");
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-6">Login</h2>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field bg-gray-50 pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          />
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Remember me
          </label>
          <span className="hover:text-green-600 cursor-pointer">
            Forgot password?
          </span>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer"
        >
          Login / Sign in
        </Button>

        <p className="text-center text-sm mt-2">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-green-600 font-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
