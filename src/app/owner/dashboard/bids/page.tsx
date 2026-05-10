"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, MapPin, Calendar, TrendingUp, Plus, X } from "lucide-react";
import Link from "next/link";
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
  const [bids, setBids] = useState<BidDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    fetchBids();
  }, []);

  async function fetchBids() {
    try {
      const res = await api.get<BidDTO[]>("/api/owner/bids");
      if (res.data) setBids(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bidId: string) {
    if (!confirm("Cancel this bid? This can only be done within 1 hour of placement.")) return;
    setCancelling(bidId);
    setCancelError("");
    try {
      await api.delete(`/api/owner/bids/${bidId}`);
      setBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel bid");
    } finally {
      setCancelling(null);
    }
  }

  const active = bids.filter((b) => b.status === "ACTIVE");
  const past = bids.filter((b) => b.status !== "ACTIVE");

  return (
    <DashboardLayout defaultRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              My Boosts
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your property boosts to appear at the top of search results.
            </p>
          </div>
          <Link href="/owner/dashboard/properties">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Boost
            </Button>
          </Link>
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
            <p className="text-gray-400 mb-6">
              Boost a Short Rent property to appear at the top of search results.
            </p>
            <Link href="/owner/dashboard/properties">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                Browse My Properties
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Active bids */}
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
                      onCancel={handleCancel}
                      cancelling={cancelling === bid.id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Past bids */}
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
    </DashboardLayout>
  );
}

function BidCard({
  bid,
  onCancel,
  cancelling,
}: {
  bid: BidDTO;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
}) {
  const canCancel =
    bid.status === "ACTIVE" &&
    Date.now() - new Date(bid.createdAt).getTime() < 60 * 60 * 1000;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Left */}
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
            £{bid.amount.toFixed(2)}/day
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(bid.startDate).toLocaleDateString("en-GB")} →{" "}
            {new Date(bid.endDate).toLocaleDateString("en-GB")}
          </span>
        </div>
        {bid.status === "ACTIVE" && (
          <p className="text-xs text-green-600 font-medium">
            {bid.daysRemaining} day{bid.daysRemaining !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <p className="text-xs text-gray-400">Total Paid</p>
          <p className="text-lg font-bold text-gray-900">£{bid.totalCost.toFixed(2)}</p>
        </div>
        {onCancel && canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            disabled={cancelling}
            onClick={() => onCancel(bid.id)}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            {cancelling ? "Cancelling…" : "Cancel"}
          </Button>
        )}
        <Link href={`/owner/dashboard/properties/${bid.propertyId}/boost`}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
            <Zap className="w-3.5 h-3.5" />
            Re-Boost
          </Button>
        </Link>
      </div>
    </div>
  );
}
