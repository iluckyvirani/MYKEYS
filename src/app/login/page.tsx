import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DollarSign, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <AuthLayout>
      <h2 className="text-2xl font-spartan font-bold mb-6">Login</h2>

      <div className="space-y-4">
        <div className="col-span-3 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field bg-gray-50"
          />
        </div>

        <div className="col-span-3 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            type="password"
            placeholder="Password"
            className="input-field bg-gray-50"
          />
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <input type="checkbox" /> Remember me
          </div>
          <span className="hover:text-green-600 cursor-pointer">
            Forgot password?
          </span>
        </div>

        <Button className="w-full bg-green-600 hover:bg-green-700 rounded-[5px] cursor-pointer">
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
