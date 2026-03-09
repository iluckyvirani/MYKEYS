"use client";

import { Crown, Check, Home, Zap, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AvailablePackagesProps {
  packages: any[];
  currentTier: string | null;
  onSubscribe: () => void;
}

export default function AvailablePackages({ packages, currentTier, onSubscribe }: AvailablePackagesProps) {
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "BASIC":
        return { color: "from-gray-400 to-gray-500", icon: Home, badge: "Basic" };
      case "STANDARD":
        return { color: "from-blue-500 to-blue-600", icon: Zap, badge: "Standard" };
      case "PREMIUM":
        return { color: "from-purple-500 to-purple-600", icon: Crown, badge: "Premium" };
      default:
        return { color: "from-gray-400 to-gray-500", icon: Package, badge: tier };
    }
  };

  const handleSubscribe = async (packageId: string, duration: string) => {
    try {
      setSubscribing(packageId);
      const response = await api.post("/owner/packages/subscribe", {
        packageId,
        duration,
      });

      toast({
        title: "Success",
        description: "Package subscription initiated successfully",
      });

      onSubscribe(); // Refresh parent data
    } catch (error: any) {
      console.error("Error subscribing to package:", error);
      toast({
        title: "Subscription Failed",
        description: error.response?.data?.error || "Failed to subscribe to package",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  if (!packages || packages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No packages available at the moment.</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Available Plans</h2>
        <p className="text-gray-600 text-sm mt-1">Choose the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages
          .sort((a, b) => a.price - b.price)
          .map((pkg) => {
            const tierConfig = getTierConfig(pkg.tier);
            const TierIcon = tierConfig.icon;
            const isCurrentTier = currentTier === pkg.tier;

            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden hover:shadow-lg transition-shadow ${
                  isCurrentTier ? "ring-2 ring-green-500" : ""
                }`}
              >
                {/* Tier Badge */}
                <div className={`bg-linear-to-r ${tierConfig.color} p-4 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TierIcon className="w-5 h-5" />
                      <span className="font-semibold">{tierConfig.badge}</span>
                    </div>
                    {isCurrentTier && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        Current
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-white/80 mt-1">{pkg.description}</p>
                  )}
                </div>

                <div className="p-6">
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(pkg.price)}
                      </span>
                      <span className="text-gray-600">/ {pkg.duration}</span>
                    </div>
                  </div>

                  {/* Core Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Properties</span>
                      <span className="font-semibold text-gray-900">
                        {pkg.propertyLimit} {pkg.propertyLimit === 1 ? "property" : "properties"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Featured Listings</span>
                      <span className="font-semibold text-gray-900">
                        {pkg.featuredLimit === 0 ? "—" : pkg.featuredLimit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Storage</span>
                      <span className="font-semibold text-gray-900">{pkg.storageLimit} GB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Daily Leads</span>
                      <span className="font-semibold text-gray-900">{pkg.dailyLeadsLimit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Leads</span>
                      <span className="font-semibold text-gray-900">{pkg.totalLeadsLimit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Support</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {pkg.supportLevel}
                      </span>
                    </div>
                  </div>

                  {/* Features Included */}
                  {pkg.featuresIncluded && pkg.featuresIncluded.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3">Features Included</h4>
                      <div className="space-y-2">
                        {pkg.featuresIncluded.map((feature: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Features */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      {pkg.hasVerifiedBadge ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="w-4 h-4" />
                      )}
                      <span className={pkg.hasVerifiedBadge ? "text-gray-900" : "text-gray-400"}>
                        Verified Badge
                      </span>
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <div>
                    {isCurrentTier ? (
                      <Button disabled className="w-full rounded-[5px]" variant="outline">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(pkg.id, pkg.duration)}
                        disabled={subscribing === pkg.id}
                        className="w-full rounded-[5px] bg-green-600 hover:bg-green-700"
                      >
                        {subscribing === pkg.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : currentTier ? (
                          "Upgrade"
                        ) : (
                          "Subscribe"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
