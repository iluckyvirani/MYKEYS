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
  const [ownActiveBid, setOwnActiveBid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [zipCode, setZipCode] = useState("");
  const [amount, setAmount] = useState("1.00");

  const bidAmount = parseFloat(amount || "0") || 0;
  const totalCost = parseFloat(bidAmount.toFixed(2));

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

          const ownBid = await refreshOwnActiveBid(p.zipCode ?? "");
          if (p.zipCode) {
            await refreshHighest(p.zipCode, ownBid);
          }
        }
      } catch {
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function refreshOwnActiveBid(zip: string): Promise<number | null> {
    try {
      const res = await api.get<{ success: boolean; data: Array<{ propertyId: string; zipCode: string; amount: number; status: string }> }>(
        "/owner/bids"
      );
      const bids = res.data?.data ?? [];
      const active = bids.find(
        (b) => b.propertyId === id && b.zipCode === zip && b.status === "ACTIVE"
      );
      const value = active?.amount ?? null;
      setOwnActiveBid(value);
      return value;
    } catch {
      return null;
    }
  }

  async function refreshHighest(zip: string, currentOwnBid?: number | null) {
    try {
      const res = await api.get<{ success: boolean; data: { highest: HighestBid | null; settings: BidSettings } }>(
        `/bids/highest?zipCode=${encodeURIComponent(zip)}`
      );
      const payload = res.data?.data ?? (res.data as any);
      if (payload) {
        setHighest(payload.highest);
        if (payload.settings) {
          setSettings(payload.settings);
          const minFromSettings = payload.settings.minBidAmountPerDay;
          const ownBid = currentOwnBid ?? ownActiveBid;
          const minFromOwn =
            ownBid != null ? ownBid + 0.01 : minFromSettings;
          const minFromHighest =
            payload.highest != null ? payload.highest.amount + 0.01 : minFromSettings;
          setAmount(
            String(Math.max(minFromSettings, minFromOwn, minFromHighest).toFixed(2))
          );
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
          amount: bidAmount,
        }
      );

      if (res.data?.razorpayOrder && res.data.keyId) {
        const Razorpay = (window as any).Razorpay;
        if (Razorpay) {
          const options = {
            key: res.data.keyId,
            order_id: res.data.razorpayOrder.id,
            amount: Math.round(totalCost * 100),
            currency: "GBP",
            name: "MYKEYS — Property Boost",
            description: `Same-day boost for ${property?.title} in ${zipCode}`,
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

  if (success) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Boost Active!</h2>
          <p className="text-gray-500">
            Your property is boosted in <strong>{zipCode}</strong> for today. Redirecting…
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <DashboardLayout defaultRole="owner">
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="space-y-6">
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

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">How Boosting Works</p>
            <ul className="space-y-0.5 text-amber-700">
              <li>• Boosts are valid for <strong>today only</strong> ({todayLabel}).</li>
              <li>• You can raise your bid unlimited times during the day (e.g. £1 → £2 → £3).</li>
              <li>• Higher bids rank above lower bids. Up to {settings.maxBoostedSlotsPerZip} boosted slots are shown.</li>
              <li>• Each raise is charged at the new bid amount for today.</li>
            </ul>
          </div>
        </div>

        {ownActiveBid != null && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
            <Zap className="w-8 h-8 text-blue-600 shrink-0" />
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                Your Current Boost (today)
              </p>
              <p className="text-xl font-bold text-gray-900">
                £{ownActiveBid.toFixed(2)}
              </p>
              <p className="text-xs text-blue-700">
                Enter a higher amount to raise your ranking — as many times as you like today.
              </p>
            </div>
          </div>
        )}

        {highest && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Current Highest Bid in {zipCode}
              </p>
              <p className="text-xl font-bold text-gray-900">
                £{highest.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">{highest.propertyTitle}</p>
            </div>
          </div>
        )}

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
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-700">
                Valid for <span className="font-semibold text-gray-900">today only</span>
                <span className="text-gray-400"> · </span>
                {todayLabel}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Target Zip Code *
                </Label>
                <Input
                  value={zipCode}
                  onChange={async (e) => {
                    const zip = e.target.value;
                    setZipCode(zip);
                    if (zip.length >= 3) {
                      const ownBid = await refreshOwnActiveBid(zip);
                      await refreshHighest(zip, ownBid);
                    }
                  }}
                  placeholder="e.g. SW1A"
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
                <p className="text-xs text-gray-400">
                  Boosted listing will appear first when users search this zip code.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Bid Amount (£) *
                </Label>
                <Input
                  type="number"
                  min={
                    ownActiveBid != null
                      ? (ownActiveBid + 0.01).toFixed(2)
                      : settings.minBidAmountPerDay
                  }
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:bg-white"
                  required
                />
                <p className="text-xs text-gray-400">
                  Minimum £{settings.minBidAmountPerDay.toFixed(2)}.
                  {ownActiveBid != null
                    ? ` Raise above your current £${ownActiveBid.toFixed(2)}.`
                    : highest
                    ? ` Bid above £${highest.amount.toFixed(2)} to rank first.`
                    : " Be the first to boost in this zip code!"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Cost</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Same-day boost · expires tonight
                </p>
              </div>
              <p className="text-3xl font-bold text-green-700">£{totalCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="submit"
              disabled={submitting || bidAmount < settings.minBidAmountPerDay}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6"
            >
              <Zap className="w-4 h-4 mr-2" />
              {submitting
                ? "Processing…"
                : ownActiveBid != null
                  ? `Raise Bid — £${totalCost.toFixed(2)}`
                  : `Boost Today — £${totalCost.toFixed(2)}`}
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
