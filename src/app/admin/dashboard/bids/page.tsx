"use client";

import { useState, useEffect, useCallback } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Search, X, MapPin, Calendar, TrendingUp, Ban } from "lucide-react";
import { api } from "@/lib/api";

interface AdminBidDTO {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  zipCode: string;
  amount: number;
  totalCost: number;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
  createdAt: string;
}

interface BidsResponse {
  bids: AdminBidDTO[];
  total: number;
  page: number;
  totalPages: number;
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

export default function AdminBidsPage() {
  const [bids, setBids] = useState<AdminBidDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [zipFilter, setZipFilter] = useState("");
  const [zipInput, setZipInput] = useState("");

  const fetchBids = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (zipFilter) params.set("zipCode", zipFilter);

      const res = await api.get<BidsResponse>(`/api/admin/bids?${params}`);
      if (res.data) {
        setBids(res.data.bids ?? []);
        setTotal(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, zipFilter]);

  useEffect(() => { fetchBids(); }, [fetchBids]);

  async function handleCancel(bidId: string) {
    if (!confirm("Cancel this bid? This will immediately end the boost.")) return;
    setCancelling(bidId);
    try {
      await api.patch(`/api/admin/bids/${bidId}/cancel`, {});
      setBids((prev) =>
        prev.map((b) => (b.id === bidId ? { ...b, status: "CANCELLED" } : b))
      );
    } catch {
      alert("Failed to cancel bid");
    } finally {
      setCancelling(null);
    }
  }

  // Summary stats
  const activeBids = bids.filter((b) => b.status === "ACTIVE");
  const totalRevenue = bids
    .filter((b) => b.status !== "CANCELLED")
    .reduce((s, b) => s + b.totalCost, 0);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-500" />
              Property Boosts
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor and manage all property boost bids.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Bids" value={String(total)} icon={<Zap className="w-5 h-5 text-amber-500" />} />
          <StatCard label="Active Boosts" value={String(activeBids.length)} icon={<TrendingUp className="w-5 h-5 text-green-600" />} />
          <StatCard label="Revenue (page)" value={`£${totalRevenue.toFixed(2)}`} icon={<TrendingUp className="w-5 h-5 text-blue-600" />} />
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
            <div className="flex gap-2">
              {["ALL", "ACTIVE", "EXPIRED", "CANCELLED"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    statusFilter === s
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Zip filter */}
          <div className="space-y-1 flex-1 min-w-[160px]">
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Zip Code</label>
            <div className="flex gap-2">
              <Input
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                placeholder="e.g. SW1A"
                className="h-8 text-sm bg-gray-50 border-gray-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setZipFilter(zipInput.trim()); setPage(1); }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={() => { setZipFilter(zipInput.trim()); setPage(1); }}
              >
                <Search className="w-3.5 h-3.5" />
              </Button>
              {zipFilter && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-gray-400"
                  onClick={() => { setZipFilter(""); setZipInput(""); setPage(1); }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Zap className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              No bids found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Property", "Owner", "Zip", "Amount", "Total", "Dates", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">
                        {bid.propertyTitle}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <p className="font-medium text-gray-800">{bid.ownerName}</p>
                        <p className="text-xs text-gray-400">{bid.ownerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{bid.zipCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">£{bid.amount.toFixed(2)}/day</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">£{bid.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(bid.startDate).toLocaleDateString("en-GB")} →{" "}
                          {new Date(bid.endDate).toLocaleDateString("en-GB")}
                        </span>
                        {bid.status === "ACTIVE" && (
                          <span className="text-green-600 font-medium mt-0.5 block">
                            {bid.daysRemaining}d left
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={bid.status} />
                      </td>
                      <td className="px-4 py-3">
                        {bid.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                            disabled={cancelling === bid.id}
                            onClick={() => handleCancel(bid.id)}
                          >
                            <Ban className="w-3 h-3 mr-1" />
                            {cancelling === bid.id ? "…" : "Cancel"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
