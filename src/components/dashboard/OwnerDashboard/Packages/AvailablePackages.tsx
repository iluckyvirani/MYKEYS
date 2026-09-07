"use client";

import { Check, Home, Loader2, Package, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import PackagePaymentModal from "@/components/owner/PackagePaymentModal";
import { resolvePackageColor, withAlpha } from "@/lib/packages/packageColors";

interface AvailablePackagesProps {
  packages: any[];
  currentPackageId: string | null;
  onSubscribe: () => void;
  categoryLabel?: string;
}

export type PurchasePackageDetails = {
  ownerPackageId: string;
  name: string;
  price: number;
  shortDescription?: string;
  durationValue: number;
  durationUnit: string;
  propertyLimit: number;
  featuredLimit: number;
  accentColor: string;
  showOwnerName?: boolean;
  showOwnerPhone?: boolean;
  directInquiryToOwner?: boolean;
  adminCCOnInquiry?: boolean;
  fullAdminSupport?: boolean;
  docExpiryAlert?: boolean;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getDurationLabel(value: number, unit: string) {
  const unitMap = { days: "day", months: "month", years: "year" };
  const label = unitMap[unit as keyof typeof unitMap] || unit;
  return `${value} ${label}${value === 1 ? "" : "s"}`;
}

function featureRows(pkg: any) {
  return [
    pkg.showOwnerName && "Show your name on listings",
    pkg.showOwnerPhone && "Show your phone on listings",
    pkg.directInquiryToOwner && "Inquiries come straight to you",
    pkg.adminCCOnInquiry && "Admin copied on inquiries",
    pkg.fullAdminSupport && "Full admin support",
    pkg.docExpiryAlert && "Document expiry alerts",
  ].filter(Boolean) as string[];
}

export default function AvailablePackages({
  packages,
  currentPackageId,
  onSubscribe,
  categoryLabel = "Rent",
}: AvailablePackagesProps) {
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PurchasePackageDetails | null>(
    null
  );

  const handleSubscribe = async (pkg: any, color: string, index: number) => {
    try {
      setSubscribing(pkg.id);
      const response = await api.post("/owner/packages/subscribe", {
        packageId: pkg.id,
      });
      const { ownerPackageId } = response.data.data;
      setPendingPayment({
        ownerPackageId,
        name: pkg.name,
        price: pkg.price,
        shortDescription: pkg.shortDescription,
        durationValue: pkg.durationValue,
        durationUnit: pkg.durationUnit,
        propertyLimit: pkg.propertyLimit,
        featuredLimit: pkg.featuredLimit,
        accentColor: resolvePackageColor(pkg.accentColor, index),
        showOwnerName: pkg.showOwnerName,
        showOwnerPhone: pkg.showOwnerPhone,
        directInquiryToOwner: pkg.directInquiryToOwner,
        adminCCOnInquiry: pkg.adminCCOnInquiry,
        fullAdminSupport: pkg.fullAdminSupport,
        docExpiryAlert: pkg.docExpiryAlert,
      });
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to initiate subscription",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white p-10 text-center">
        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600">
          No {categoryLabel.toLowerCase()} packages available at the moment.
        </p>
      </div>
    );
  }

  const sorted = [...packages].sort((a, b) => a.price - b.price);
  const popularId =
    sorted.length >= 2 ? sorted[Math.min(1, sorted.length - 1)].id : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Choose a {categoryLabel} plan
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {categoryLabel === "Sale"
            ? "Required to publish Buy listings."
            : "Required to publish Long Rent listings."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sorted.map((pkg, index) => {
          const color = resolvePackageColor(pkg.accentColor, index);
          const isCurrent = currentPackageId === pkg.id;
          const isPopular = pkg.id === popularId && !isCurrent;
          const features = featureRows(pkg);

          return (
            <div
              key={pkg.id}
              className="relative rounded-2xl border bg-white overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderColor: withAlpha(color, 0.28),
                boxShadow: isPopular ? `0 12px 32px ${withAlpha(color, 0.18)}` : undefined,
              }}
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
              {isPopular && (
                <span
                  className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide text-white px-2 py-1 rounded-full"
                  style={{ backgroundColor: color }}
                >
                  Popular
                </span>
              )}

              <div
                className="px-5 pt-5 pb-4"
                style={{ background: `linear-gradient(180deg, ${withAlpha(color, 0.12)} 0%, #fff 100%)` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                    {pkg.shortDescription && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {pkg.shortDescription}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">
                    / {getDurationLabel(pkg.durationValue, pkg.durationUnit)}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Home className="w-3 h-3" /> Listings
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {pkg.propertyLimit === 0 ? "Unlimited" : pkg.propertyLimit}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 px-3 py-2">
                    <p className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {pkg.featuredLimit === 0 ? "—" : pkg.featuredLimit}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-5 flex-1">
                  {features.length === 0 ? (
                    <p className="text-xs text-gray-400">Core listing access included.</p>
                  ) : (
                    features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                        <span>{f}</span>
                      </div>
                    ))
                  )}
                </div>

                {isCurrent ? (
                  <Button disabled className="w-full rounded-xl" variant="outline">
                    Current plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(pkg, color, index)}
                    disabled={subscribing === pkg.id}
                    className="w-full rounded-xl text-white hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: color }}
                  >
                    {subscribing === pkg.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Preparing…
                      </>
                    ) : (
                      `Get ${pkg.name}`
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pendingPayment && (
        <PackagePaymentModal
          isOpen
          ownerPackageId={pendingPayment.ownerPackageId}
          packageName={pendingPayment.name}
          amount={pendingPayment.price}
          details={pendingPayment}
          onClose={() => setPendingPayment(null)}
          onSuccess={() => {
            toast({
              title: "Package Activated",
              description: `${pendingPayment.name} is now active on your account.`,
            });
            onSubscribe();
          }}
          onError={(msg) =>
            toast({ title: "Payment Failed", description: msg, variant: "destructive" })
          }
        />
      )}
    </div>
  );
}
