"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Building2, Star } from "lucide-react";
import { api } from "@/lib/api";

interface PackageRecord {
  id: string;
  name: string;
  price: number;
  durationValue: number;
  durationUnit: string;
  propertyLimit: number;
  featuredLimit: number;
  shortDescription?: string;
  description?: string;
  showOwnerName: boolean;
  showOwnerPhone: boolean;
  directInquiryToOwner: boolean;
  adminCCOnInquiry: boolean;
  fullAdminSupport: boolean;
  docExpiryAlert: boolean;
}

interface PackageBrowserProps {
  currentPackageId?: string;
  onSelect: (packageId: string) => void;
  subscribing?: string | null; // packageId being subscribed
}

function formatDuration(v: number, u: string) {
  return `${v} ${v === 1 ? u.replace(/s$/, "") : u}`;
}

function flagList(pkg: PackageRecord): string[] {
  const flags: string[] = [];
  if (pkg.showOwnerName)        flags.push("Owner name visible on listing");
  if (pkg.showOwnerPhone)       flags.push("Owner phone visible on listing");
  if (pkg.directInquiryToOwner) flags.push("Inquiries go directly to you");
  if (pkg.adminCCOnInquiry)     flags.push("Admin CC'd on all inquiries");
  if (pkg.fullAdminSupport)     flags.push("Dedicated admin support");
  if (pkg.docExpiryAlert)       flags.push("Document expiry notifications");
  return flags;
}

export default function PackageBrowser({
  currentPackageId,
  onSelect,
  subscribing,
}: PackageBrowserProps) {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/packages")
      .then((res) => setPackages(res.data?.data ?? []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 py-8 text-center">Loading packages…</p>;
  if (packages.length === 0)
    return <p className="text-gray-400 py-8 text-center">No packages available at the moment.</p>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => {
        const isCurrent = pkg.id === currentPackageId;
        const isSubscribing = subscribing === pkg.id;
        const features = flagList(pkg);

        return (
          <Card
            key={pkg.id}
            className={`p-6 flex flex-col gap-4 transition-all ${
              isCurrent ? "border-2 border-green-500 bg-green-50/30" : "hover:shadow-md"
            }`}
          >
            {/* Name & badge */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
              {isCurrent && (
                <Badge className="bg-green-100 text-green-700 shrink-0">Current</Badge>
              )}
            </div>

            {/* Short description */}
            {pkg.shortDescription && (
              <p className="text-sm text-gray-500">{pkg.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-gray-900">£{pkg.price}</span>
              <span className="text-gray-400 text-sm">
                / {formatDuration(pkg.durationValue, pkg.durationUnit)}
              </span>
            </div>

            {/* Key stats */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-gray-400" />
                {pkg.propertyLimit === 0 ? "Unlimited listings" : `${pkg.propertyLimit} listing${pkg.propertyLimit === 1 ? "" : "s"}`}
              </span>
              {pkg.featuredLimit > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  {pkg.featuredLimit} featured
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                {formatDuration(pkg.durationValue, pkg.durationUnit)}
              </span>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <ul className="space-y-1.5 text-sm text-gray-700">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <Button
              className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isCurrent || isSubscribing}
              onClick={() => onSelect(pkg.id)}
            >
              {isCurrent ? "Active Plan" : isSubscribing ? "Processing…" : "Get This Plan"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
