"use client";

import { Crown, Check, Home, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import PackagePaymentModal from "@/components/owner/PackagePaymentModal";

interface AvailablePackagesProps {
  packages: any[];
  currentPackageId: string | null;
  onSubscribe: () => void;
}

interface PendingPayment {
  ownerPackageId: string;
  packageName: string;
  price: number;
}

export default function AvailablePackages({ packages, currentPackageId, onSubscribe }: AvailablePackagesProps) {
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  const getDurationLabel = (value: number, unit: string) => {
    const unitMap = { days: "day", months: "month", years: "year" };
    const label = unitMap[unit as keyof typeof unitMap] || unit;
    return `${value} ${label}`;
  };

  const handleSubscribe = async (pkg: { id: string; name: string; price: number }) => {
    try {
      setSubscribing(pkg.id);
      const response = await api.post("/owner/packages/subscribe", { packageId: pkg.id });
      const { ownerPackageId } = response.data.data;
      setPendingPayment({ ownerPackageId, packageName: pkg.name, price: pkg.price });
    } catch (error: any) {
      console.error("Error initiating package subscription:", error);
      toast({
        title: "Subscription Failed",
        description: error.response?.data?.message || error.response?.data?.error || "Failed to initiate subscription",
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
            const isCurrentPackage = currentPackageId === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden hover:shadow-lg transition-shadow ${
                  isCurrentPackage ? "ring-2 ring-green-500" : ""
                }`}
              >
                {/* Header */}
                <div className="bg-linear-to-r from-gray-700 to-gray-800 p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      <span className="font-semibold">{pkg.name}</span>
                    </div>
                    {isCurrentPackage && (
                      <Badge className="bg-white/20 text-white border-white/30">
                        Current
                      </Badge>
                    )}
                  </div>
                  {pkg.shortDescription && (
                    <p className="text-sm text-white/80 mt-1">{pkg.shortDescription}</p>
                  )}
                </div>

                <div className="p-6">
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(pkg.price)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      / {getDurationLabel(pkg.durationValue, pkg.durationUnit)}
                    </span>
                  </div>

                  {/* Core Features */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
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
                  </div>

                  {/* Features Included */}
                  <div className="space-y-2 mb-6">
                    {pkg.showOwnerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-gray-700">Show Owner Name</span>
                      </div>
                    )}
                    {pkg.showOwnerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-gray-700">Show Owner Phone</span>
                      </div>
                    )}
                    {pkg.directInquiryToOwner && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-gray-700">Direct Inquiry to Owner</span>
                      </div>
                    )}
                    {pkg.adminCCOnInquiry && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-gray-700">Admin CC on Inquiry</span>
                      </div>
                    )}
                    {pkg.fullAdminSupport && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-gray-700">Full Admin Support</span>
                      </div>
                    )}
                    {pkg.docExpiryAlert && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                        <span className="text-gray-700">Document Expiry Alerts</span>
                      </div>
                    )}
                  </div>

                  {/* Subscribe Button */}
                  <div>
                    {isCurrentPackage ? (
                      <Button disabled className="w-full rounded-[5px]" variant="outline">
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(pkg)}
                        disabled={subscribing === pkg.id}
                        className="w-full rounded-[5px] bg-green-600 hover:bg-green-700"
                      >
                        {subscribing === pkg.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
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

      {/* Stripe payment modal */}
      {pendingPayment && (
        <PackagePaymentModal
          isOpen={true}
          ownerPackageId={pendingPayment.ownerPackageId}
          packageName={pendingPayment.packageName}
          amount={pendingPayment.price}
          onClose={() => setPendingPayment(null)}
          onSuccess={() => {
            const name = pendingPayment.packageName;
            setPendingPayment(null);
            toast({ title: "Package Activated", description: `${name} is now active on your account.` });
            onSubscribe();
          }}
          onError={(msg) => toast({ title: "Payment Failed", description: msg, variant: "destructive" })}
        />
      )}
    </div>
  );
}
