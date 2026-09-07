"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { api } from "@/lib/api";
import { getStoredUserFromLocalStorage } from "@/lib/auth/storedUser";
import { Button } from "@/components/ui/button";
import { resolvePackageColor, withAlpha } from "@/lib/packages/packageColors";

type Audience = "OWNER" | "AGENT";
type Category = "SALE" | "RENT";

interface PackageItem {
  id: string;
  name: string;
  price: number;
  durationValue: number;
  durationUnit: string;
  propertyLimit: number;
  featuredLimit: number;
  shortDescription?: string | null;
  accentColor?: string | null;
  audience?: Audience;
  category?: Category;
  showOwnerName?: boolean;
  showOwnerPhone?: boolean;
  directInquiryToOwner?: boolean;
  adminCCOnInquiry?: boolean;
  fullAdminSupport?: boolean;
  docExpiryAlert?: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getDurationLabel(value: number, unit: string) {
  const unitMap: Record<string, string> = {
    days: "day",
    months: "month",
    years: "year",
  };
  const label = unitMap[unit] || unit;
  return `${value} ${label}${value !== 1 ? "s" : ""}`;
}

function buildPackageFeatures(pkg: PackageItem): string[] {
  const who = pkg.audience === "AGENT" ? "agent" : "owner";
  const features: string[] = [];

  if (pkg.shortDescription?.trim()) {
    features.push(pkg.shortDescription.trim());
  }

  features.push(
    pkg.propertyLimit === 0
      ? "Unlimited property listings"
      : `${pkg.propertyLimit} property listing${pkg.propertyLimit !== 1 ? "s" : ""}`
  );

  if (pkg.featuredLimit > 0) {
    features.push(
      `${pkg.featuredLimit} featured listing${pkg.featuredLimit !== 1 ? "s" : ""}`
    );
  }

  if (pkg.showOwnerName) features.push(`Show ${who} name on listings`);
  if (pkg.showOwnerPhone) features.push(`Show ${who} phone on listings`);
  if (pkg.directInquiryToOwner) features.push("Direct inquiries to you");
  if (pkg.adminCCOnInquiry) features.push("Admin CC on inquiries");
  if (pkg.fullAdminSupport) features.push("Full admin support");
  if (pkg.docExpiryAlert) features.push("Document expiry alerts");

  return features;
}

function hasRole(roles: string[] | undefined, role: string) {
  return Array.isArray(roles) && roles.includes(role);
}

export default function PublicListingPackages() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audience, setAudience] = useState<"ALL" | Audience>("ALL");
  const [category, setCategory] = useState<"ALL" | Category>("ALL");
  const [pending, setPending] = useState<PackageItem | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get("/packages?audience=ALL");
        const list: PackageItem[] = response.data?.data || [];
        setPackages([...list].sort((a, b) => a.price - b.price));
      } catch {
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const filtered = useMemo(
    () =>
      packages.filter((pkg) => {
        const aud = pkg.audience ?? "OWNER";
        const cat = pkg.category ?? "RENT";
        if (audience !== "ALL" && aud !== audience) return false;
        if (category !== "ALL" && cat !== category) return false;
        return true;
      }),
    [packages, audience, category]
  );

  const popularId = useMemo(() => {
    if (filtered.length < 2) return null;
    return filtered[Math.min(1, filtered.length - 1)].id;
  }, [filtered]);

  function checkoutPath(pkg: PackageItem) {
    return pkg.audience === "AGENT" ? "/agent/packages" : "/owner/packages";
  }

  function handlePackageClick(pkg: PackageItem) {
    const token = localStorage.getItem("accessToken");
    const needed = pkg.audience === "AGENT" ? "AGENT" : "OWNER";
    const path = checkoutPath(pkg);

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }

    const user = getStoredUserFromLocalStorage();
    if (hasRole(user?.roles, needed) || hasRole(user?.roles, "ADMIN")) {
      router.push(path);
      return;
    }

    setUpgradeError("");
    setPending(pkg);
  }

  async function handleBecomeRole() {
    if (!pending) return;
    setUpgrading(true);
    setUpgradeError("");
    try {
      const endpoint =
        pending.audience === "AGENT"
          ? "/users/become-agent"
          : "/users/become-owner";
      const response = await api.post(endpoint);
      if (response.data?.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
      }
      if (response.data?.data?.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }
      if (response.data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      const path = checkoutPath(pending);
      setPending(null);
      router.push(path);
    } catch (error: unknown) {
      setUpgradeError(
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Could not update your account. Please try again."
      );
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Choose Your Package
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Live plans from our platform — owner and agent, Sale and Rent
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <div className="flex rounded-full bg-white border border-gray-200 p-1 shadow-sm">
          {(["ALL", "OWNER", "AGENT"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudience(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                audience === value
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {value === "ALL" ? "All" : value === "OWNER" ? "Owners" : "Agents"}
            </button>
          ))}
        </div>
        <div className="flex rounded-full bg-white border border-gray-200 p-1 shadow-sm">
          {(["ALL", "SALE", "RENT"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${
                category === value
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {value === "ALL" ? "Sale & Rent" : value === "SALE" ? "Sale" : "Rent"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          No packages in this filter yet. Try another audience or category.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((pkg, index) => {
            const color = resolvePackageColor(pkg.accentColor, index);
            const isPopular = pkg.id === popularId;
            const features = buildPackageFeatures(pkg);
            const priceLabel = pkg.price <= 0 ? "Free" : formatCurrency(pkg.price);
            const durationLabel = getDurationLabel(
              pkg.durationValue,
              pkg.durationUnit
            );

            return (
              <div
                key={pkg.id}
                className="relative rounded-2xl bg-white p-8 shadow-md"
                style={{
                  border: isPopular ? `2px solid ${color}` : "1px solid #e5e7eb",
                  boxShadow: isPopular
                    ? `0 16px 40px ${withAlpha(color, 0.2)}`
                    : undefined,
                }}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div
                      className="text-white px-5 py-1.5 rounded-full text-xs font-bold tracking-wide"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${withAlpha(color, 0.7)})`,
                      }}
                    >
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center mb-7">
                  <div
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${withAlpha(color, 0.65)})`,
                    }}
                  >
                    <Star className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex justify-center gap-1.5 mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {pkg.audience === "AGENT" ? "Agent" : "Owner"}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {pkg.category === "SALE" ? "Sale" : "Rent"}
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                  <div className="flex items-baseline justify-center gap-2 flex-wrap">
                    <span className="text-4xl font-bold text-gray-900">{priceLabel}</span>
                    {pkg.price > 0 && (
                      <span className="text-gray-500">/ {durationLabel}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handlePackageClick(pkg)}
                  className="block w-full py-3 rounded-lg font-medium text-center cursor-pointer"
                  style={
                    isPopular
                      ? {
                          background: `linear-gradient(90deg, ${color}, ${withAlpha(color, 0.75)})`,
                          color: "#fff",
                        }
                      : {
                          backgroundColor: "#f3f4f6",
                          color: "#1f2937",
                        }
                  }
                >
                  {pkg.price <= 0 ? "Get Started" : "View Package"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {pending && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setPending(null)}
            aria-hidden
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-2">
              {pending.audience === "AGENT" ? "Become an Agent" : "Become an Owner"}
            </h3>
            <p className="text-gray-600 mb-6">
              {pending.audience === "AGENT"
                ? "This is an agent package. Add the agent role to your account to continue."
                : "This is an owner package. Add the owner role to list properties and continue."}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setPending(null)}
                variant="outline"
                className="flex-1 rounded-[5px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBecomeRole}
                disabled={upgrading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
              >
                {upgrading
                  ? "Processing..."
                  : pending.audience === "AGENT"
                    ? "Become Agent"
                    : "Become Owner"}
              </Button>
            </div>
            {upgradeError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-[5px]">
                {upgradeError}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
