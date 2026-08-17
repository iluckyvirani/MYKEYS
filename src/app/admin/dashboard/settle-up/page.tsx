"use client";

import { useCallback, useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Loader2, Wallet, CheckCircle } from "lucide-react";

type SettlementRow = {
  id: string;
  type: "SERVICE" | "SHORT_STAY";
  amount: number;
  status: "PENDING" | "SETTLED";
  note?: string | null;
  createdAt: string;
  settledAt?: string | null;
  beneficiary: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceBooking?: {
    id: string;
    service: string;
    totalAmount: number;
    providerEarnings?: number | null;
    completedAt?: string | null;
  } | null;
  payment?: {
    id: string;
    amount: number;
    ownerEarnings?: number | null;
    commissionAmount?: number | null;
    bookingId?: string | null;
    createdAt: string;
  } | null;
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n || 0);
}

export default function AdminSettleUpPage() {
  const [tab, setTab] = useState<"SERVICE" | "SHORT_STAY">("SERVICE");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "SETTLED">(
    "PENDING"
  );
  const [items, setItems] = useState<SettlementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/settlements?type=${tab}&status=${statusFilter}&limit=100`
      );
      setItems(res.data?.data?.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function markSettled(id: string) {
    setActionId(id);
    try {
      await api.post(`/admin/settlements/${id}/settle`, {
        note: note[id]?.trim() || undefined,
      });
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark settled");
    } finally {
      setActionId(null);
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Wallet className="w-7 h-7 text-emerald-700" />
          <h1 className="text-2xl font-bold text-gray-900">Settle Up</h1>
        </div>
        <p className="text-gray-600">
          Manual payout ledger for service jobs and short-stay owner earnings.
          Mark settled after you pay offline.
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "SERVICE" | "SHORT_STAY")}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="SERVICE" className="cursor-pointer">
              Services
            </TabsTrigger>
            <TabsTrigger value="SHORT_STAY" className="cursor-pointer">
              Short stay
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              size="sm"
              className="cursor-pointer"
              onClick={() => setStatusFilter("PENDING")}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "SETTLED" ? "default" : "outline"}
              size="sm"
              className="cursor-pointer"
              onClick={() => setStatusFilter("SETTLED")}
            >
              Settled
            </Button>
          </div>
        </div>

        {(["SERVICE", "SHORT_STAY"] as const).map((t) => (
          <TabsContent key={t} value={t} className="mt-0">
            <div className="bg-white border rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading settlements…
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  No {statusFilter.toLowerCase()}{" "}
                  {t === "SERVICE" ? "service" : "short-stay"} settlements.
                </div>
              ) : (
                <div className="divide-y">
                  {items.map((row) => {
                    const name = `${row.beneficiary.firstName} ${row.beneficiary.lastName}`.trim();
                    return (
                      <div
                        key={row.id}
                        className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {name || "Beneficiary"}
                            </span>
                            <Badge variant="outline">{row.beneficiary.email}</Badge>
                            <Badge
                              className={
                                row.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {row.status}
                            </Badge>
                          </div>
                          {row.type === "SERVICE" && row.serviceBooking && (
                            <p className="text-sm text-gray-600">
                              Job: {row.serviceBooking.service} · Tenant paid{" "}
                              {fmt(row.serviceBooking.totalAmount)}
                              {row.serviceBooking.completedAt
                                ? ` · Completed ${new Date(
                                    row.serviceBooking.completedAt
                                  ).toLocaleDateString("en-GB")}`
                                : ""}
                            </p>
                          )}
                          {row.type === "SHORT_STAY" && row.payment && (
                            <p className="text-sm text-gray-600">
                              Booking payment {fmt(row.payment.amount)}
                              {row.payment.commissionAmount != null
                                ? ` · Commission ${fmt(
                                    row.payment.commissionAmount
                                  )}`
                                : ""}
                              {row.payment.bookingId
                                ? ` · Booking ${row.payment.bookingId.slice(0, 8)}…`
                                : ""}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Queued {new Date(row.createdAt).toLocaleString("en-GB")}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              Amount owed
                            </div>
                            <div className="text-xl font-bold text-emerald-700">
                              {fmt(row.amount)}
                            </div>
                          </div>
                          {row.status === "PENDING" && (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <input
                                type="text"
                                placeholder="Optional note"
                                value={note[row.id] || ""}
                                onChange={(e) =>
                                  setNote((prev) => ({
                                    ...prev,
                                    [row.id]: e.target.value,
                                  }))
                                }
                                className="px-3 py-2 border rounded-md text-sm"
                              />
                              <Button
                                className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                                disabled={actionId === row.id}
                                onClick={() => markSettled(row.id)}
                              >
                                {actionId === row.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                Mark Settled
                              </Button>
                            </div>
                          )}
                          {row.status === "SETTLED" && row.settledAt && (
                            <p className="text-sm text-green-700">
                              Settled{" "}
                              {new Date(row.settledAt).toLocaleDateString("en-GB")}
                              {row.note ? ` · ${row.note}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AdminDashboardLayout>
  );
}
