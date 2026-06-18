"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Eye, TrendingUp, Target, Zap, Shield, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { getStoredUserFromLocalStorage } from "@/lib/auth/storedUser";
import { Button } from "@/components/ui/button";

interface PackageItem {
  id: string;
  name: string;
  price: number;
  durationValue: number;
  durationUnit: string;
  propertyLimit: number;
  featuredLimit: number;
  shortDescription?: string | null;
  showOwnerName?: boolean;
  showOwnerPhone?: boolean;
  directInquiryToOwner?: boolean;
  adminCCOnInquiry?: boolean;
  fullAdminSupport?: boolean;
  docExpiryAlert?: boolean;
}

const TIER_COLORS = [
  "from-gray-400 to-gray-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-pink-600",
];

const benefits = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Increased Visibility",
    description: "Featured properties appear at the top of search results and get 5x more views.",
    stat: "500%",
    statLabel: "More Views",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Higher Conversion",
    description: "Get 3x more inquiries and book 70% faster than regular listings.",
    stat: "70%",
    statLabel: "Faster Booking",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Targeted Exposure",
    description: "Showcase to high-intent users actively searching in your area.",
    stat: "3x",
    statLabel: "More Inquiries",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Premium Badge",
    description: "Stand out with featured placement that builds trust with potential guests.",
    stat: "4.8★",
    statLabel: "Avg. Rating",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getDurationLabel(value: number, unit: string) {
  const unitMap: Record<string, string> = { days: "day", months: "month", years: "year" };
  const label = unitMap[unit] || unit;
  return `${value} ${label}`;
}

function buildPackageFeatures(pkg: PackageItem): string[] {
  const features: string[] = [];

  features.push(
    pkg.propertyLimit === 0
      ? "Unlimited property listings"
      : `${pkg.propertyLimit} property listing${pkg.propertyLimit !== 1 ? "s" : ""}`
  );

  if (pkg.featuredLimit > 0) {
    features.push(`${pkg.featuredLimit} featured listing${pkg.featuredLimit !== 1 ? "s" : ""}`);
  }

  if (pkg.showOwnerName) features.push("Show owner name on listings");
  if (pkg.showOwnerPhone) features.push("Show owner phone on listings");
  if (pkg.directInquiryToOwner) features.push("Direct inquiries to you");
  if (pkg.adminCCOnInquiry) features.push("Admin CC on inquiries");
  if (pkg.fullAdminSupport) features.push("Full admin support");
  if (pkg.docExpiryAlert) features.push("Document expiry alerts");

  if (pkg.shortDescription?.trim()) {
    features.unshift(pkg.shortDescription.trim());
  }

  if (features.length === 0) {
    features.push("Active package benefits included");
  }

  return features;
}

function userHasOwnerRole(roles: string[] | undefined) {
  return Array.isArray(roles) && roles.some((role) => role === "OWNER" || role === "ADMIN");
}

export default function FeaturedPropertiesBenefits() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBecomeOwnerModal, setShowBecomeOwnerModal] = useState(false);
  const [becomingOwner, setBecomingOwner] = useState(false);
  const [becomeOwnerError, setBecomeOwnerError] = useState("");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await api.get("/packages");
        const list: PackageItem[] = response.data?.data || [];
        const sorted = [...list].sort((a, b) => a.price - b.price).slice(0, 3);
        setPackages(sorted);
      } catch (error) {
        console.error("Failed to load packages:", error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handlePackageClick = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/owner/packages");
      return;
    }

    const user = getStoredUserFromLocalStorage();
    if (!userHasOwnerRole(user?.roles)) {
      setBecomeOwnerError("");
      setShowBecomeOwnerModal(true);
      return;
    }

    router.push("/owner/packages");
  };

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
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      setShowBecomeOwnerModal(false);
      router.push("/owner/packages");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to become owner. Please try again.";
      setBecomeOwnerError(message);
    } finally {
      setBecomingOwner(false);
    }
  };

  const popularIndex = packages.length >= 2 ? 1 : -1;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Featured, Get Noticed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Boost your property&apos;s visibility with our owner packages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 mb-6">{benefit.description}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-emerald-600">{benefit.stat}</span>
                <span className="text-gray-500 mb-1">{benefit.statLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Choose Your Package
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Live plans from our platform — pick the right level for your listings
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : packages.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              No packages available at the moment. Please check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => {
                const isPopular = index === popularIndex;
                const features = buildPackageFeatures(pkg);
                const color = TIER_COLORS[index] || TIER_COLORS[0];
                const priceLabel = pkg.price <= 0 ? "Free" : formatCurrency(pkg.price);
                const durationLabel = getDurationLabel(pkg.durationValue, pkg.durationUnit);

                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl border-2 ${
                      isPopular
                        ? "border-emerald-500 shadow-2xl md:transform md:scale-105"
                        : "border-gray-200"
                    } bg-white p-8`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div
                        className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center mb-4`}
                      >
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                      <div className="flex items-baseline justify-center gap-2 flex-wrap">
                        <span className="text-4xl font-bold text-gray-900">{priceLabel}</span>
                        {pkg.price > 0 && (
                          <span className="text-gray-500">/ {durationLabel}</span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                          </div>
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={handlePackageClick}
                      className={`block w-full py-3 rounded-lg font-medium text-center transition-all duration-300 ${
                        isPopular
                          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {pkg.price <= 0 ? "Get Started" : "View Package"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Success Story</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                &quot;Featured listing doubled my bookings in 30 days&quot;
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="text-emerald-200">Property Owner in London</p>
                </div>
              </div>

              <p className="text-emerald-100">
                After upgrading my package, I went from 3–4 bookings per month to 8–10. Being at
                the top of search results and having direct inquiries made a real difference.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-xl font-bold mb-6">Sarah&apos;s Results</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-200">Monthly Bookings</span>
                    <span className="font-bold">+150%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-3/4" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-200">Monthly Revenue</span>
                    <span className="font-bold">+£2,400</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-2/3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-200">Inquiry Response Rate</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-full" />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/20 rounded-lg">
                <p className="text-sm">
                  <Shield className="w-4 h-4 inline mr-2" />
                  <span className="font-medium">ROI:</span> Package paid back in the first week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBecomeOwnerModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowBecomeOwnerModal(false)}
            aria-hidden
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-50 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Become an Owner</h3>
            <p className="text-gray-600 mb-6">
              Owner packages are for property owners. Upgrade your account to list properties and
              choose a package.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBecomeOwnerModal(false)}
                variant="outline"
                className="flex-1 rounded-[5px]"
              >
                Cancel
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
    </section>
  );
}
