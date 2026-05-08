"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Building2, AlertTriangle, Star } from "lucide-react";
import { api } from "@/lib/api";
import { OwnerPackageWithUsage } from "@/types/package";
import PackageBrowser from "./PackageBrowser";

interface ActivePackageCardProps {
  sub: OwnerPackageWithUsage;
  onRenew: () => void;
}

function ActivePackageCard({ sub, onRenew }: ActivePackageCardProps) {
  const propertyPct =
    sub.propertiesLimit === 0
      ? 0
      : Math.min(100, (sub.propertiesUsed / sub.propertiesLimit) * 100);

  const expiringSoon = sub.daysRemaining <= 7;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{sub.packageName}</h2>
          {sub.shortDescription && (
            <p className="text-sm text-gray-500 mt-0.5">{sub.shortDescription}</p>
          )}
        </div>
        <Badge className="bg-green-100 text-green-700 shrink-0">Active</Badge>
      </div>

      {/* Expiry */}
      <div className={`flex items-center gap-2 text-sm ${expiringSoon ? "text-orange-600" : "text-gray-600"}`}>
        {expiringSoon ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        <span>
          {expiringSoon
            ? `Expires in ${sub.daysRemaining} day${sub.daysRemaining === 1 ? "" : "s"} — `
            : `Expires: `}
          {new Date(sub.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        {expiringSoon && (
          <Button size="sm" variant="outline" className="ml-auto text-xs" onClick={onRenew}>
            Renew Now
          </Button>
        )}
      </div>

      {/* Listings usage */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-1 text-gray-600">
            <Building2 className="w-4 h-4" /> Listings used
          </span>
          <span className="font-medium text-gray-900">
            {sub.propertiesUsed} / {sub.propertiesLimit === 0 ? "∞" : sub.propertiesLimit}
          </span>
        </div>
        {sub.propertiesLimit > 0 && (
          <Progress value={propertyPct} className="h-2" />
        )}
      </div>

      {/* Featured */}
      {sub.featuredLimit > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" /> Featured slots
          </span>
          <span className="font-medium text-gray-900">
            {sub.featuredUsed} / {sub.featuredLimit}
          </span>
        </div>
      )}

      {/* Feature flags */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        {[
          { flag: sub.showOwnerName,        label: "Name visible" },
          { flag: sub.showOwnerPhone,       label: "Phone visible" },
          { flag: sub.directInquiryToOwner, label: "Direct inquiries" },
          { flag: sub.adminCCOnInquiry,     label: "Admin CC" },
          { flag: sub.fullAdminSupport,     label: "Admin support" },
          { flag: sub.docExpiryAlert,       label: "Doc alerts" },
        ].map(({ flag, label }) => (
          <span key={label} className={flag ? "text-green-600 font-medium" : "text-gray-400 line-through"}>
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}

export default function OwnerPackageManager() {
  const [currentPkg, setCurrentPkg] = useState<OwnerPackageWithUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBrowser, setShowBrowser] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subError, setSubError] = useState("");

  const fetchCurrent = async () => {
    try {
      const res = await api.get("/api/owner/packages");
      setCurrentPkg(res.data?.data ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCurrent(); }, []);

  async function handleSelect(packageId: string) {
    setSubscribing(packageId);
    setSubError("");
    try {
      await api.post("/api/owner/packages/subscribe", { packageId });
      await fetchCurrent();
      setShowBrowser(false);
    } catch (err: any) {
      setSubError(err?.response?.data?.message ?? "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(null);
    }
  }

  if (loading) return <p className="text-gray-400 py-8">Loading package info…</p>;

  return (
    <div className="space-y-6">
      {/* Current package */}
      {currentPkg ? (
        <ActivePackageCard sub={currentPkg} onRenew={() => setShowBrowser(true)} />
      ) : (
        <Card className="p-6 border-dashed text-center space-y-3">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-700">No active package</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            You need a package to publish Long Rent or Buy listings. Short Rent listings
            can be published without a package.
          </p>
        </Card>
      )}

      {subError && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-3">{subError}</p>
      )}

      {/* Browse button */}
      {!showBrowser && (
        <Button
          variant={currentPkg ? "outline" : "default"}
          className={currentPkg ? "" : "bg-green-600 hover:bg-green-700 text-white"}
          onClick={() => setShowBrowser(true)}
        >
          {currentPkg ? "Change / Upgrade Package" : "Browse Packages"}
        </Button>
      )}

      {/* Package browser */}
      {showBrowser && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Available Packages</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowBrowser(false)}>
              Close
            </Button>
          </div>
          <PackageBrowser
            currentPackageId={currentPkg?.packageId}
            onSelect={handleSelect}
            subscribing={subscribing}
          />
        </div>
      )}
    </div>
  );
}
