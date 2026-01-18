"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = () => {
    if (!email || !password || !name) {
      alert("Please enter name, email and password");
      return;
    }

    // dummy token (replace with API later)
    localStorage.setItem("auth_token", "demo_auth_token_123");
    localStorage.setItem("user_email", email);

    router.push("/");
  };
  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-6">Signup</h2>

      <div className="space-y-4">
        <div className="col-span-3 relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="text"
            placeholder="Your Name"
            className="input-field bg-gray-50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="col-span-3 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="text"
            placeholder="Email Address"
            className="input-field bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="col-span-3 relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="password"
            placeholder="Password"
            className="input-field bg-gray-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input type="checkbox" />
          <span>
            I Accept <span className="text-green-600">Terms and Condition</span>
          </span>
        </div>

        <Button onClick={handleLogin} className="w-full bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer">
          Register
        </Button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
