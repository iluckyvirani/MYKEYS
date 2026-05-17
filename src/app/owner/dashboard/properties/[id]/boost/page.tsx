"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Zap, TrendingUp, Info } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface HighestBid {
  amount: number;
  propertyTitle: string;
}

interface BidSettings {
  minBidAmountPerDay: number;
  maxBidDurationDays: number;
  maxBoostedSlotsPerZip: number;
}

interface PropertyInfo {
  id: string;
  title: string;
  zipCode: string | null;
  listingType: string;
  rentalType: string | null;
  status: string;
}

export default function BoostPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [settings, setSettings] = useState<BidSettings>({
    minBidAmountPerDay: 1,
    maxBidDurationDays: 30,
    maxBoostedSlotsPerZip: 3,
  });
  const [highest, setHighest] = useState<HighestBid | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const today = new Date().toISOString().split("T")[0];
  const [zipCode, setZipCode] = useState("");
  const [amount, setAmount] = useState("1.00");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");

  // Computed
  const days =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;
  const totalCost = days > 0 ? parseFloat((parseFloat(amount || "0") * days).toFixed(2)) : 0;

  useEffect(() => {
    (async () => {
      try {
        const [propRes] = await Promise.all([
          api.get<{ success: boolean; data: PropertyInfo }>(`/properties/${id}`),
        ]);
        if (propRes.data) {
          const p: PropertyInfo = propRes.data.data ?? (propRes.data as any);
          setProperty(p);
          setZipCode(p.zipCode ?? "");

          // Fetch highest bid info for this zip
          if (p.zipCode) {
            await refreshHighest(p.zipCode);
          }
        }
      } catch {
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function refreshHighest(zip: string) {
    try {
      const res = await api.get<{ success: boolean; data: { highest: HighestBid | null; settings: BidSettings } }>(
        `/bids/highest?zipCode=${encodeURIComponent(zip)}`
      );
      const payload = res.data?.data ?? (res.data as any);
      if (payload) {
        setHighest(payload.highest);
        if (payload.settings) {
          setSettings(payload.settings);
          setAmount(String(payload.settings.minBidAmountPerDay));
        }
      }
    } catch {
      // non-fatal
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post<{ bid: { id: string }; razorpayOrder?: { id: string }; keyId: string }>(
        "/owner/bids",
        {
          propertyId: id,
          zipCode: zipCode.trim(),
          amount: parseFloat(amount),
          startDate,
          endDate,
        }
      );

      if (res.data?.razorpayOrder && res.data.keyId) {
        // Open Razorpay checkout
        const Razorpay = (window as any).Razorpay;
        if (Razorpay) {
          const options = {
            key: res.data.keyId,
            order_id: res.data.razorpayOrder.id,
            amount: Math.round(totalCost * 100),
            currency: "GBP",
            name: "MYKEYS — Property Boost",
            description: `Boost for ${property?.title} in ${zipCode} (${days} days)`,
            handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              await api.post(`/owner/bids/${res.data!.bid.id}/payment/verify`, {
                razorpayOrderId: payment.razorpay_order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpaySignature: payment.razorpay_signature,
              });
              setSuccess(true);
              setTimeout(() => router.push("/owner/dashboard/bids"), 2000);
            },
            theme: { color: "#16a34a" },
          };
          new Razorpay(options).open();
          return;
        }
      }

      // No Razorpay (dev mode) — treat as success
      setSuccess(true);
      setTimeout(() => router.push("/owner/dashboard/bids"), 1500);
    } catch (err: unknown) {
      const axiosErr = err as any;
      const msg =
        axiosErr?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to place bid");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="text-center py-16 text-gray-500">Property not found.</div>
      </DashboardLayout>
    );
  }

  if (property.listingType !== "RENT" || property.rentalType !== "SHORT_TERM") {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="max-w-lg mx-auto mt-16 text-center">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Boost Not Available</h2>
          <p className="text-gray-500 mb-6">
            Bidding / Boost is only available for <strong>Short Rent</strong> properties.
          </p>
          <Link href={`/owner/dashboard/properties/${id}`}>
            <Button variant="outline">Back to Property</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Boost Active!</h2>
          <p className="text-gray-500">
            Your property is now boosted in <strong>{zipCode}</strong>. Redirecting…
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const maxEnd = new Date(startDate);
  maxEnd.setDate(maxEnd.getDate() + settings.maxBidDurationDays);
  const maxEndStr = maxEnd.toISOString().split("T")[0];

  return (
    <DashboardLayout defaultRole="owner">
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/owner/dashboard/properties/${id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Boost Property
            </h1>
            <p className="text-sm text-gray-500">{property.title}</p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">How Boosting Works</p>
            <ul className="space-y-0.5 text-amber-700">
              <li>• Your property appears at the top of search results for the target zip code.</li>
              <li>• Higher bids rank above lower bids. Up to {settings.maxBoostedSlotsPerZip} boosted slots are shown.</li>
              <li>• You pay the full amount upfront. No refunds after the grace period.</li>
            </ul>
          </div>
        </div>

        {/* Current highest bid */}
        {highest && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Current Highest Bid in {zipCode}
              </p>
              <p className="text-xl font-bold text-gray-900">
                £{highest.amount.toFixed(2)}/day
              </p>
              <p className="text-xs text-gray-400">{highest.propertyTitle}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Boost Details
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Zip code */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Target Zip Code *
                </Label>
                <Input
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    if (e.target.value.length >= 3) refreshHighest(e.target.value);
                  }}
                  placeholder="e.g. SW1A"
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
                <p className="text-xs text-gray-400">
                  Boosted listing will appear first when users search this zip code.
                </p>
              </div>

              {/* Bid amount */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Bid Amount (£/day) *
                </Label>
                <Input
                  type="number"
                  min={settings.minBidAmountPerDay}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
                <p className="text-xs text-gray-400">
                  Minimum £{settings.minBidAmountPerDay.toFixed(2)}/day.
                  {highest
                    ? ` Bid above £${highest.amount.toFixed(2)}/day to rank first.`
                    : " Be the first to boost in this zip code!"}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Start Date *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(""); // reset end
                    }}
                    className="bg-gray-50 border-gray-200 focus:bg-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">End Date *</Label>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    max={maxEndStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Maximum {settings.maxBidDurationDays} days per boost.
              </p>
            </div>
          </div>

          {/* Cost preview */}
          {days > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Total Cost</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    £{parseFloat(amount || "0").toFixed(2)}/day × {days} day{days !== 1 ? "s" : ""}
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-700">£{totalCost.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              disabled={submitting || days < 1}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              {submitting ? "Processing…" : `Boost — £${totalCost.toFixed(2)}`}
            </Button>
            <Link href={`/owner/dashboard/properties/${id}`}>
              <Button type="button" variant="outline" className="border-gray-300 text-gray-700">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
