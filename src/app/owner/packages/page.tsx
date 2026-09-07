"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OwnerPackageManager from "@/components/owner/OwnerPackageManager";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getStoredUserFromLocalStorage } from "@/lib/auth/storedUser";
import { Package } from "lucide-react";

function userHasOwnerRole(roles: string[] | undefined) {
  return Array.isArray(roles) && roles.some((role) => role === "OWNER" || role === "ADMIN");
}

export default function OwnerPackagesPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "allowed" | "guest" | "user">("loading");
  const [showBecomeOwnerModal, setShowBecomeOwnerModal] = useState(false);
  const [becomingOwner, setBecomingOwner] = useState(false);
  const [becomeOwnerError, setBecomeOwnerError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login?redirect=/owner/packages");
      setAuthState("guest");
      return;
    }

    const user = getStoredUserFromLocalStorage();
    if (userHasOwnerRole(user?.roles)) {
      setAuthState("allowed");
      return;
    }

    setAuthState("user");
    setShowBecomeOwnerModal(true);
  }, [router]);

  const handleBecomeOwner = async () => {
    setBecomingOwner(true);
    setBecomeOwnerError("");
    try {
      const response = await api.post("/users/become-owner");

      if (response.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
      }
      if (response.data?.data?.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }
      if (response.data?.data?.user) {
        const { setStoredUser } = await import("@/lib/auth/storedUser");
        setStoredUser(response.data.data.user);
      }

      setShowBecomeOwnerModal(false);
      setAuthState("allowed");
      router.replace("/owner/packages");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to become owner. Please try again.";
      setBecomeOwnerError(message);
    } finally {
      setBecomingOwner(false);
    }
  };

  if (authState === "loading" || authState === "guest") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-green-600" /> My Packages
          </h1>
          <p className="text-gray-500 mt-1">
            Sale packages for Buy listings · Rent packages for Long Rent
          </p>
        </div>
        {authState === "allowed" && <OwnerPackageManager />}
      </main>
      <Footer />

      {showBecomeOwnerModal && authState === "user" && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" aria-hidden />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Become an Owner</h3>
            <p className="text-gray-600 mb-6">
              You are signed in as a guest user. Become an owner to view and subscribe to listing
              packages.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push("/owner/dashboard")}
                variant="outline"
                className="flex-1 rounded-[5px]"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={handleBecomeOwner}
                disabled={becomingOwner}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
              >
                {becomingOwner ? "Processing..." : "Become Owner"}
              </Button>
            </div>
            {becomeOwnerError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-[5px]">
                {becomeOwnerError}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
