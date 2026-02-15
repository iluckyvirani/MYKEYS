"use client";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RegisterRequest, RegisterResponse } from "@/types/auth";

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
    const requirements = [
      { text: "At least 8 characters", check: (p: string) => p.length >= 8 },
      { text: "Not more than 128 characters", check: (p: string) => p.length <= 128 },
      { text: "At least one lowercase letter", check: (p: string) => /[a-z]/.test(p) },
      { text: "At least one uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
      { text: "At least one number", check: (p: string) => /[0-9]/.test(p) },
      { text: "At least one special character", check: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
      { 
        text: "Not a common password", 
        check: (p: string) => !["password", "12345678", "qwerty123", "admin123", "letmein"].includes(p.toLowerCase()) 
      },
    ];
    return requirements;
  };

  const passwordRequirements = checkPasswordRequirements(password);
  const allRequirementsMet = passwordRequirements.every(req => req.check(password));

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

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

      const response = await api.post<RegisterResponse>(
        "/auth/register",
        signupData
      );

      if (response.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to home page
        router.push("/");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-6">Signup</h2>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
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
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
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
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input-field bg-gray-50 pl-10 pr-10"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
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

        {password && (
          <div className={`border rounded-[5px] p-3 ${
            allRequirementsMet 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          }`}>
            <p className={`text-sm font-semibold mb-2 ${
              allRequirementsMet 
                ? "text-green-800" 
                : "text-yellow-800"
            }`}>
              Password Requirements:
            </p>
            <ul className="space-y-1">
              {passwordRequirements.map((req, index) => {
                const isMet = req.check(password);
                return (
                  <li 
                    key={index} 
                    className={`text-sm flex items-center gap-2 ${
                      isMet 
                        ? "text-green-700" 
                        : "text-yellow-700"
                    }`}
                  >
                    <span className={isMet ? "text-green-600" : "text-red-500"}>
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
          />
          <span>
            I Accept{" "}
            <span className="text-green-600">Terms and Condition</span>
          </span>
        </div>

        <Button
          onClick={handleSignup}
          disabled={loading || !firstName || !lastName || !email || !password || !allRequirementsMet || !termsAccepted}
          className="w-full bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Registering..." : "Register"}
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
