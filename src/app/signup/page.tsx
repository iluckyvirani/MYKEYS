"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RegisterRequest } from "@/types/auth";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkPasswordRequirements = (pwd: string) => {
    return [
      { text: "At least 8 characters", check: (p: string) => p.length >= 8 },
      { text: "Not more than 128 characters", check: (p: string) => p.length <= 128 },
      { text: "At least one lowercase letter", check: (p: string) => /[a-z]/.test(p) },
      { text: "At least one uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
      { text: "At least one number", check: (p: string) => /[0-9]/.test(p) },
      {
        text: "At least one special character",
        check: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
      },
      {
        text: "Not a common password",
        check: (p: string) =>
          !["password", "12345678", "qwerty123", "admin123", "letmein"].includes(
            p.toLowerCase()
          ),
      },
    ];
  };

  const passwordRequirements = checkPasswordRequirements(password);
  const allRequirementsMet = passwordRequirements.every((req) =>
    req.check(password)
  );

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!allRequirementsMet) {
      setError("Please meet all password requirements before registering");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept terms and conditions");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const signupData: RegisterRequest = {
        email,
        password,
        firstName,
        lastName,
        phone: undefined,
      };

      const response = await api.post("/auth/register", signupData);

      if (response.data?.success) {
        const registeredEmail =
          response.data.data?.email || email.trim().toLowerCase();
        router.push(
          `/verify-otp?email=${encodeURIComponent(registeredEmail)}`
        );
        return;
      }

      // Even if email send failed after account create, go to OTP screen
      if (response.data?.data?.email || response.status === 502) {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }
    } catch (err: any) {
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      // If OTP email failed but account exists, still go verify
      if (code === "SERVICE_UNAVAILABLE" || err.response?.status === 502) {
        router.push(
          `/verify-otp?email=${encodeURIComponent(email.trim().toLowerCase())}`
        );
        return;
      }

      setError(message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-6 text-[#0f172a]">
        Signup
      </h2>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
          <input
            type="text"
            placeholder="First Name"
            className="input-field bg-gray-50 pl-10"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#339390]" />
          <input
            type="text"
            placeholder="Last Name"
            className="input-field bg-gray-50 pl-10"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

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
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {password && (
          <div
            className={`border rounded-[5px] p-3 ${
              allRequirementsMet
                ? "bg-[#f0fafa] border-[#b6e2e0]"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <p
              className={`text-sm font-semibold mb-2 ${
                allRequirementsMet ? "text-[#1f6f6c]" : "text-yellow-800"
              }`}
            >
              Password Requirements:
            </p>
            <ul className="space-y-1">
              {passwordRequirements.map((req, index) => {
                const isMet = req.check(password);
                return (
                  <li
                    key={index}
                    className={`text-sm flex items-center gap-2 ${
                      isMet ? "text-[#1f6f6c]" : "text-yellow-700"
                    }`}
                  >
                    <span className={isMet ? "text-[#339390]" : "text-red-500"}>
                      {isMet ? "✓" : "✕"}
                    </span>
                    {req.text}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            disabled={loading}
            id="accept-terms"
          />
          <span>
            <label htmlFor="accept-terms" className="cursor-pointer">
              I Accept{" "}
            </label>
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#339390] font-medium underline underline-offset-2 hover:opacity-80"
            >
              Terms and Condition
            </Link>
          </span>
        </div>

        <Button
          onClick={handleSignup}
          disabled={
            loading ||
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !allRequirementsMet ||
            !termsAccepted
          }
          className="w-full bg-[#339390] hover:bg-[#2a7a78] text-white rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending OTP…" : "Register"}
        </Button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#339390] font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
