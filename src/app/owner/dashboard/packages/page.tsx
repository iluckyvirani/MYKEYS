"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import CurrentPackage from "@/components/dashboard/OwnerDashboard/Packages/CurrentPackage";
import AvailablePackages from "@/components/dashboard/OwnerDashboard/Packages/AvailablePackages";
import PackageHistory from "@/components/dashboard/OwnerDashboard/Packages/PackageHistory";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwnerActivePackages, PackageCategory } from "@/types/package";
import { useToast } from "@/hooks/use-toast";
import { setStoredUser } from "@/lib/auth/storedUser";

function OwnerPackagesContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<OwnerActivePackages>({ SALE: null, RENT: null });
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [category, setCategory] = useState<PackageCategory>("RENT");
  const [refreshKey, setRefreshKey] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [currentPkgRes, availablePkgsRes] = await Promise.all([
          api.get("/owner/packages"),
          api.get("/packages"),
        ]);

        const data = currentPkgRes.data?.data;
        setPackages({
          SALE: data?.SALE ?? null,
          RENT: data?.RENT ?? null,
        });
        setAvailablePackages(availablePkgsRes.data?.data || []);
      } catch (err: any) {
        console.error("Error fetching package data:", err);
        setError(err.response?.data?.error || "Failed to load package information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  // Stripe redirect return (Link / 3DS) — stay on owner packages
  useEffect(() => {
    const payment = searchParams.get("payment");
    const paymentIntent = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (payment !== "return" && !paymentIntent) return;

    let cancelled = false;
    (async () => {
      try {
        try {
          const me = await api.get("/auth/me");
          if (me.data?.data) setStoredUser(me.data.data);
        } catch {
          /* ignore */
        }

        if (paymentIntent && (redirectStatus === "succeeded" || payment === "return")) {
          try {
            await api.post("/payments/verify-by-intent", {
              stripePaymentIntentId: paymentIntent,
            });
          } catch {
            // webhook may have already activated
          }
          if (!cancelled) {
            toast({
              title: "Package Activated",
              description: "Your package payment completed successfully.",
            });
            setRefreshKey((k) => k + 1);
          }
        }
      } finally {
        if (!cancelled) {
          router.replace("/owner/dashboard/packages");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, toast]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const currentForCategory = packages[category];
  const filteredAvailable = availablePackages.filter(
    (p) => (p.category ?? "RENT") === category
  );

  if (loading) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-green-600 mb-4" />
            <p className="text-gray-600">Loading your package information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-gray-900 font-semibold mb-2">Failed to load packages</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={handleRefresh}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="owner">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages & Pricing</h1>
            <p className="text-gray-600 mt-2">
              Sale packages for Buy listings · Rent packages for Long Rent. Short stay needs no
              package.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {(["SALE", "RENT"] as PackageCategory[]).map((cat) => (
          <Button
            key={cat}
            type="button"
            variant={category === cat ? "default" : "outline"}
            className={
              category === cat
                ? "bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
                : "rounded-[5px]"
            }
            onClick={() => setCategory(cat)}
          >
            {cat === "SALE" ? "Sale packages" : "Rent packages"}
            {packages[cat] ? " · Active" : ""}
          </Button>
        ))}
      </div>

      <div className="mb-6">
        <CurrentPackage
          currentPackage={currentForCategory}
          packageUsage={currentForCategory}
          onRefresh={handleRefresh}
          categoryLabel={category === "SALE" ? "Sale" : "Rent"}
        />
      </div>

      <div className="mb-6">
        <AvailablePackages
          packages={filteredAvailable}
          currentPackageId={currentForCategory?.packageId || null}
          onSubscribe={handleRefresh}
          categoryLabel={category === "SALE" ? "Sale" : "Rent"}
        />
      </div>

      <div>
        <PackageHistory />
      </div>
    </DashboardLayout>
  );
}

export default function OwnerPackagesPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout defaultRole="owner">
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        </DashboardLayout>
      }
    >
      <OwnerPackagesContent />
    </Suspense>
  );
}
