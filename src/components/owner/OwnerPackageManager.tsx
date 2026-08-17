"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Building2, AlertTriangle, Star } from "lucide-react";
import { api } from "@/lib/api";
import { OwnerActivePackages, OwnerPackageWithUsage, PackageCategory } from "@/types/package";
import PackageBrowser from "./PackageBrowser";
import PackagePaymentModal from "./PackagePaymentModal";

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
  const isSale = sub.category === "SALE";

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={isSale ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700"}>
              {isSale ? "Sale" : "Rent"}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{sub.packageName}</h2>
          {sub.shortDescription && (
            <p className="text-sm text-gray-500 mt-0.5">{sub.shortDescription}</p>
          )}
        </div>
        <Badge className="bg-green-100 text-green-700 shrink-0">Active</Badge>
      </div>

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

interface PendingPayment {
  ownerPackageId: string;
  packageName: string;
  price: number;
}

export default function OwnerPackageManager() {
  const [packages, setPackages] = useState<OwnerActivePackages>({ SALE: null, RENT: null });
  const [loading, setLoading] = useState(true);
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserCategory, setBrowserCategory] = useState<PackageCategory>("RENT");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [subError, setSubError] = useState("");
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  const fetchCurrent = async () => {
    try {
      const res = await api.get("/owner/packages");
      const data = res.data?.data;
      setPackages({
        SALE: data?.SALE ?? null,
        RENT: data?.RENT ?? null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCurrent(); }, []);

  async function handleSelect(packageId: string, price: number, packageName: string) {
    setSubscribing(packageId);
    setSubError("");
    try {
      const res = await api.post("/owner/packages/subscribe", { packageId });
      const { ownerPackageId } = res.data.data;
      setPendingPayment({ ownerPackageId, packageName, price });
    } catch (err: any) {
      setSubError(err?.response?.data?.message ?? "Failed to initiate subscription. Please try again.");
    } finally {
      setSubscribing(null);
    }
  }

  function handlePaymentSuccess() {
    setPendingPayment(null);
    setShowBrowser(false);
    setSubError("");
    fetchCurrent();
  }

  function handlePaymentClose() {
    setPendingPayment(null);
  }

  const activeList = [packages.SALE, packages.RENT].filter(Boolean) as OwnerPackageWithUsage[];
  const hasAny = activeList.length > 0;

  if (loading) return <p className="text-gray-400 py-8">Loading package info…</p>;

  return (
    <div className="space-y-6">
      {hasAny ? (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.SALE && (
            <ActivePackageCard
              sub={packages.SALE}
              onRenew={() => { setBrowserCategory("SALE"); setShowBrowser(true); }}
            />
          )}
          {packages.RENT && (
            <ActivePackageCard
              sub={packages.RENT}
              onRenew={() => { setBrowserCategory("RENT"); setShowBrowser(true); }}
            />
          )}
          {!packages.SALE && (
            <Card className="p-6 border-dashed text-center space-y-2">
              <h3 className="font-semibold text-gray-700">No Sale package</h3>
              <p className="text-sm text-gray-500">Needed to publish Buy listings.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setBrowserCategory("SALE"); setShowBrowser(true); }}
              >
                Browse Sale packages
              </Button>
            </Card>
          )}
          {!packages.RENT && (
            <Card className="p-6 border-dashed text-center space-y-2">
              <h3 className="font-semibold text-gray-700">No Rent package</h3>
              <p className="text-sm text-gray-500">Needed to publish Long Rent listings.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setBrowserCategory("RENT"); setShowBrowser(true); }}
              >
                Browse Rent packages
              </Button>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-6 border-dashed text-center space-y-3">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-700">No active packages</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Buy a Sale package for Buy listings, or a Rent package for Long Rent.
            Short stay listings do not need a package.
          </p>
        </Card>
      )}

      {subError && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-3">{subError}</p>
      )}

      {!showBrowser && (
        <Button
          variant={hasAny ? "outline" : "default"}
          className={hasAny ? "" : "bg-green-600 hover:bg-green-700 text-white"}
          onClick={() => setShowBrowser(true)}
        >
          {hasAny ? "Browse / Upgrade Packages" : "Browse Packages"}
        </Button>
      )}

      {showBrowser && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Available Packages</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowBrowser(false)}>
              Close
            </Button>
          </div>
          <PackageBrowser
            category={browserCategory}
            onCategoryChange={setBrowserCategory}
            currentPackageIds={{
              SALE: packages.SALE?.packageId,
              RENT: packages.RENT?.packageId,
            }}
            onSelect={handleSelect}
            subscribing={subscribing}
          />
        </div>
      )}

      {pendingPayment && (
        <PackagePaymentModal
          isOpen={true}
          ownerPackageId={pendingPayment.ownerPackageId}
          packageName={pendingPayment.packageName}
          amount={pendingPayment.price}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
          onError={(msg) => setSubError(msg)}
        />
      )}
    </div>
  );
}
