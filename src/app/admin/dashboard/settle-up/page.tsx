"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  Wallet,
  CheckCircle,
  Clock,
  Briefcase,
  Home,
  Landmark,
  Copy,
  Loader2,
} from "lucide-react";
import { formatUkSortCode } from "@/lib/bank/ukBankDetails";

type SettlementType = "SERVICE" | "SHORT_STAY";
type SettlementStatus = "PENDING" | "SETTLED";

type SettlementRow = {
  id: string;
  type: SettlementType;
  amount: number;
  status: SettlementStatus;
  note?: string | null;
  createdAt: string;
  settledAt?: string | null;
  beneficiary: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    bankAccountHolder?: string | null;
    bankSortCode?: string | null;
    bankAccountNumber?: string | null;
    bankName?: string | null;
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

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "U";
}

function copyText(value: string) {
  navigator.clipboard?.writeText(value).catch(() => undefined);
}

export default function AdminSettleUpPage() {
  const [tab, setTab] = useState<SettlementType>("SERVICE");
  const [statusFilter, setStatusFilter] = useState<SettlementStatus>("PENDING");
  const [items, setItems] = useState<SettlementRow[]>([]);
  const [pendingCounts, setPendingCounts] = useState({ SERVICE: 0, SHORT_STAY: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, serviceCount, stayCount] = await Promise.all([
        api.get(`/admin/settlements?type=${tab}&status=${statusFilter}&limit=100`),
        api.get("/admin/settlements?type=SERVICE&status=PENDING&limit=1"),
        api.get("/admin/settlements?type=SHORT_STAY&status=PENDING&limit=1"),
      ]);
      setItems(listRes.data?.data?.items ?? []);
      setPendingCounts({
        SERVICE: serviceCount.data?.data?.total ?? 0,
        SHORT_STAY: stayCount.data?.data?.total ?? 0,
      });
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
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to mark settled"
      );
    } finally {
      setActionId(null);
    }
  }

  const handleCopy = (key: string, value: string) => {
    copyText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1500);
  };

  const owedTotal = useMemo(
    () => items.reduce((sum, row) => sum + (row.amount || 0), 0),
    [items]
  );

  return (
    <AdminDashboardLayout>
      <div className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settle Up</h1>
              <p className="text-gray-500 mt-1 max-w-2xl">
                Pay providers and owners offline using their UK bank details,
                then mark the payout as settled.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-amber-700">Pending</p>
              <p className="text-xl font-bold text-amber-900">
                {pendingCounts.SERVICE + pendingCounts.SHORT_STAY}
              </p>
            </div>
            <div className="rounded-lg bg-teal-50 border border-teal-100 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-teal-700">This list</p>
              <p className="text-xl font-bold text-teal-900">{fmt(owedTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-2 mb-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {(
              [
                {
                  value: "SERVICE" as const,
                  label: "Services",
                  icon: Briefcase,
                  count: pendingCounts.SERVICE,
                },
                {
                  value: "SHORT_STAY" as const,
                  label: "Short stay",
                  icon: Home,
                  count: pendingCounts.SHORT_STAY,
                },
              ]
            ).map((item) => {
              const Icon = item.icon;
              const active = tab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all ${
                    active
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active ? "bg-teal-100 text-teal-800" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1">
            {(
              [
                { value: "PENDING" as const, label: "Pending", icon: Clock },
                { value: "SETTLED" as const, label: "Settled", icon: CheckCircle },
              ]
            ).map((item) => {
              const Icon = item.icon;
              const active = statusFilter === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatusFilter(item.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium cursor-pointer transition-all ${
                    active
                      ? item.value === "PENDING"
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-teal-700 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-gray-50 p-4 sm:p-5 min-h-[320px]">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading settlements…
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-800">
              No {statusFilter.toLowerCase()}{" "}
              {tab === "SERVICE" ? "service" : "short-stay"} payouts
            </p>
            <p className="text-sm text-gray-500 mt-1">
              New completed jobs will appear here when money is owed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((row) => {
              const name = `${row.beneficiary.firstName} ${row.beneficiary.lastName}`.trim();
              const sortCode = row.beneficiary.bankSortCode
                ? formatUkSortCode(row.beneficiary.bankSortCode)
                : "";
              const hasBank =
                Boolean(row.beneficiary.bankAccountNumber) && Boolean(sortCode);

              return (
                <div
                  key={row.id}
                  className="bg-white rounded-xl border shadow-sm p-5"
                >
                  <div className="flex flex-col xl:flex-row xl:items-stretch gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-800 font-semibold flex items-center justify-center shrink-0">
                          {initials(row.beneficiary.firstName, row.beneficiary.lastName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {name || "Beneficiary"}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                row.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {row.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {row.beneficiary.email}
                          </p>
                        </div>
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
                            ? ` · Commission ${fmt(row.payment.commissionAmount)}`
                            : ""}
                          {row.payment.bookingId
                            ? ` · Booking ${row.payment.bookingId.slice(0, 8)}…`
                            : ""}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Queued {new Date(row.createdAt).toLocaleString("en-GB")}
                      </p>

                      <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-800">
                          <Landmark className="w-4 h-4 text-teal-700" />
                          UK bank details
                        </div>
                        {hasBank ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <p>
                              <span className="text-gray-500">Holder</span>
                              <span className="block font-medium text-gray-900">
                                {row.beneficiary.bankAccountHolder || name}
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-500">Bank</span>
                              <span className="block font-medium text-gray-900">
                                {row.beneficiary.bankName || "—"}
                              </span>
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p>
                                <span className="text-gray-500">Sort code</span>
                                <span className="block font-mono font-medium text-gray-900">
                                  {sortCode}
                                </span>
                              </p>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                onClick={() => handleCopy(`${row.id}-sort`, sortCode)}
                                aria-label="Copy sort code"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p>
                                <span className="text-gray-500">Account no.</span>
                                <span className="block font-mono font-medium text-gray-900">
                                  {row.beneficiary.bankAccountNumber}
                                </span>
                              </p>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-700 cursor-pointer"
                                onClick={() =>
                                  handleCopy(
                                    `${row.id}-acc`,
                                    row.beneficiary.bankAccountNumber || ""
                                  )
                                }
                                aria-label="Copy account number"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {copied.startsWith(row.id) && (
                              <p className="sm:col-span-2 text-xs text-teal-700">Copied</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-amber-700">
                            This person has not added UK bank details yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="xl:w-72 shrink-0 flex flex-col justify-between gap-4 rounded-lg bg-gray-50 border p-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Amount owed
                        </p>
                        <p className="text-3xl font-bold text-teal-800 mt-1">
                          {fmt(row.amount)}
                        </p>
                      </div>
                      {row.status === "PENDING" ? (
                        <div className="space-y-2">
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
                            className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                          />
                          <Button
                            className="w-full bg-teal-700 hover:bg-teal-800 cursor-pointer"
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
                      ) : (
                        <p className="text-sm text-green-700">
                          Settled{" "}
                          {row.settledAt
                            ? new Date(row.settledAt).toLocaleDateString("en-GB")
                            : ""}
                          {row.note ? ` · ${row.note}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
