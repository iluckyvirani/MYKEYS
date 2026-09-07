"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, MapPin, Calendar, TrendingUp, Plus, X, Home, ChevronRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface BidDTO {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyZipCode: string | null;
  zipCode: string;
  amount: number;
  totalCost: number;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
  createdAt: string;
}

interface ShortProperty {
  id: string;
  title: string;
  zipCode: string | null;
  city: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    EXPIRED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function OwnerBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<BidDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [bidToCancel, setBidToCancel] = useState<BidDTO | null>(null);

  // Property picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [properties, setProperties] = useState<ShortProperty[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);

  useEffect(() => {
    fetchBids();
  }, []);

  async function fetchBids() {
    try {
      const res = await api.get<{ success: boolean; data: BidDTO[] }>("/owner/bids");
      const data = res.data?.data ?? res.data;
      if (Array.isArray(data)) setBids(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function openPicker() {
    setShowPicker(true);
    if (properties.length > 0) return;
    setLoadingProps(true);
    try {
      const res = await api.get("/owner/properties");
      const raw: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
      // Show all active properties regardless of type
      const activeProps = raw.filter((p) => p.status === "active");
      setProperties(
        activeProps.map((p) => ({
          id: p.id,
          title: p.name ?? p.fullData?.title ?? "",
          zipCode: p.fullData?.zipCode ?? null,
          city: p.fullData?.city ?? p.location ?? "",
          status: p.status,
        }))
      );
    } catch {
      // ignore
    } finally {
      setLoadingProps(false);
    }
  }

  async function confirmCancelBoost() {
    if (!bidToCancel) return;
    const bidId = bidToCancel.id;
    setCancelling(bidId);
    setCancelError("");
    try {
      await api.delete(`/owner/bids/${bidId}`);
      setBids((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "CANCELLED" } : b)));
      setBidToCancel(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to cancel boost");
      setCancelError(msg);
    } finally {
      setCancelling(null);
    }
  }

  const active = bids.filter((b) => b.status === "ACTIVE");
  const past = bids.filter((b) => b.status !== "ACTIVE");

  return (
    <DashboardLayout defaultRole="agent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              My Boosts
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Boost any active property for today. Raise your bid as often as you like during the day.
            </p>
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            onClick={openPicker}
          >
            <Plus className="w-4 h-4" />
            New Boost
          </Button>
        </div>

        {cancelError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {cancelError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
          </div>
        ) : bids.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <Zap className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Boosts Yet</h3>
            <p className="text-gray-400 mb-6 text-sm">
              Boost any of your active properties to appear at the top of search results.
            </p>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={openPicker}
            >
              <Zap className="w-4 h-4 mr-2" />
              Boost a Property
            </Button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Active Boosts ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((bid) => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      onCancel={() => setBidToCancel(bid)}
                      cancelling={cancelling === bid.id}
                    />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Past Boosts
                </h2>
                <div className="space-y-3">
                  {past.map((bid) => (
                    <BidCard key={bid.id} bid={bid} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Cancel boost confirmation modal */}
      <Dialog
        open={bidToCancel !== null}
        onOpenChange={(open) => {
          if (!open && !cancelling) {
            setBidToCancel(null);
            setCancelError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!cancelling}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Cancel Boost?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-left text-sm text-gray-600">
                <p>
                  Are you sure you want to cancel this boost? Your property will no longer appear
                  at the top of search results for this zip code.
                </p>
                {bidToCancel && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-700">
                    <p className="font-medium text-gray-900">{bidToCancel.propertyTitle}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {bidToCancel.zipCode} � �{bidToCancel.amount.toFixed(2)} (today)
                    </p>
                  </div>
                )}
                <p className="text-xs text-amber-700">
                  Cancellations are only allowed within 1 hour of placing the boost.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          {cancelError && bidToCancel && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {cancelError}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBidToCancel(null);
                setCancelError("");
              }}
              disabled={!!cancelling}
            >
              Keep Boost
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmCancelBoost}
              disabled={!!cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Yes, Cancel Boost"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Picker Modal */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="font-semibold text-gray-900">Select a Property to Boost</h2>
                <p className="text-xs text-gray-500 mt-0.5">All active properties can be boosted</p>
              </div>
              <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Property list */}
            <div className="flex-1 overflow-y-auto p-3">
              {loadingProps ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-amber-500" />
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Home className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-medium text-gray-600 mb-1">No active properties</p>
                  <p className="text-xs">You need at least one active property listing to place a boost.</p>
                  <Link
                    href="/agent/dashboard/properties"
                    className="inline-block mt-4 text-xs text-amber-600 hover:underline"
                    onClick={() => setShowPicker(false)}
                  >
                    Go to My Properties &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setShowPicker(false);
                        router.push(`/agent/dashboard/properties/${p.id}/boost?from=boosts`);
                      }}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{p.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.city}{p.zipCode ? ` � ${p.zipCode}` : ""}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function BidCard({
  bid,
  onCancel,
  cancelling,
}: {
  bid: BidDTO;
  onCancel?: () => void;
  cancelling?: boolean;
}) {
  const canCancel =
    bid.status === "ACTIVE" &&
    Date.now() - new Date(bid.createdAt).getTime() < 60 * 60 * 1000;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{bid.propertyTitle}</p>
          <StatusBadge status={bid.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {bid.zipCode}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            &pound;{bid.amount.toFixed(2)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(bid.startDate).toLocaleDateString("en-GB")}
            <span className="text-gray-400">(today only)</span>
          </span>
        </div>
        {bid.status === "ACTIVE" && (
          <p className="text-xs text-amber-600 font-medium">
            Valid until end of today
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">&pound;{bid.totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-400">total paid</p>
        </div>
        {canCancel && onCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={cancelling}
            className="text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs"
          >
            {cancelling ? (
              <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Cancel"
            )}
          </Button>
        )}
        <Link href={`/agent/dashboard/properties/${bid.propertyId}/boost?from=boosts`}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs gap-1">
            <Zap className="w-3 h-3" />
            Re-Boost
          </Button>
        </Link>
      </div>
    </div>
  );
}
