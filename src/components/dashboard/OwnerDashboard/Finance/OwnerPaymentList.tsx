"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Calendar,
  CreditCard,
  MapPin,
  Loader2,
  AlertCircle,
  Package,
  User,
  Hash,
  TrendingUp,
  Clock,
  ArrowDownCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingIncomeItem {
  id: string;
  status: string;
  amount: number;
  currency: string;
  commissionPercent: number | null;
  commissionAmount: number | null;
  ownerEarnings: number | null;
  paymentMethod: string;
  transactionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  booking: {
    id: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    status: string;
    property: { id: string; title: string; city: string; state: string };
    guest: { id: string; firstName: string; lastName: string; email: string };
  } | null;
  paidBy: { id: string; name: string; email: string } | null;
}

interface PackagePaymentItem {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  package: {
    ownerPackageId: string;
    subscriptionStatus: string;
    startDate: string | null;
    endDate: string | null;
    name: string | null;
    price: number | null;
  } | null;
}

interface BookingStats {
  totalEarned: number;
  totalCommission: number;
  netEarnings: number;
  pendingAmount: number;
}

interface OwnerPaymentListProps {
  searchQuery?: string;
  filters?: {
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

const statusColor = (s: string) => {
  switch (s) {
    case "PAID":      return "bg-green-100 text-green-800";
    case "PENDING":   return "bg-blue-100 text-blue-800";
    case "FAILED":    return "bg-red-100 text-red-800";
    case "REFUNDED":  return "bg-orange-100 text-orange-800";
    default:          return "bg-gray-100 text-gray-800";
  }
};

const subStatusColor = (s: string) => {
  switch (s) {
    case "ACTIVE":    return "bg-green-100 text-green-700";
    case "PENDING":   return "bg-yellow-100 text-yellow-700";
    case "EXPIRED":   return "bg-gray-100 text-gray-600";
    case "CANCELLED": return "bg-red-100 text-red-700";
    default:          return "bg-gray-100 text-gray-600";
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OwnerPaymentList({ searchQuery = "", filters }: OwnerPaymentListProps) {
  const [activeTab, setActiveTab] = useState<"booking_income" | "packages">("booking_income");

  // Booking income state
  const [bookings, setBookings] = useState<BookingIncomeItem[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Package payments state
  const [packages, setPackages] = useState<PackagePaymentItem[]>([]);
  const [packageLoading, setPackageLoading] = useState(true);
  const [packageError, setPackageError] = useState<string | null>(null);

  const buildParams = useCallback(() => {
    const p = new URLSearchParams({ limit: "100" });
    if (filters?.fromDate)    p.append("fromDate",    filters.fromDate);
    if (filters?.toDate)      p.append("toDate",      filters.toDate);
    if (filters?.sortBy === "oldest") p.append("sortOrder", "asc");
    return p;
  }, [filters]);

  const fetchBookingIncome = useCallback(async () => {
    try {
      setBookingLoading(true);
      setBookingError(null);
      const p = buildParams();
      const res = await api.get(`/owner/finance?type=booking_income&${p.toString()}`);
      if (res.data?.success) {
        setBookings(res.data.data.items ?? []);
        setBookingStats(res.data.data.stats ?? null);
      } else {
        setBookingError(res.data?.message || "Failed to load booking income");
      }
    } catch (err: any) {
      setBookingError(err.response?.data?.message || err.message || "Failed to load booking income");
    } finally {
      setBookingLoading(false);
    }
  }, [buildParams]);

  const fetchPackagePayments = useCallback(async () => {
    try {
      setPackageLoading(true);
      setPackageError(null);
      const p = buildParams();
      const res = await api.get(`/owner/finance?type=packages&${p.toString()}`);
      if (res.data?.success) {
        setPackages(res.data.data.items ?? []);
      } else {
        setPackageError(res.data?.message || "Failed to load package payments");
      }
    } catch (err: any) {
      setPackageError(err.response?.data?.message || err.message || "Failed to load package payments");
    } finally {
      setPackageLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchBookingIncome();
    fetchPackagePayments();
  }, [fetchBookingIncome, fetchPackagePayments]);

  const filteredBookings = bookings.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.stripePaymentIntentId?.toLowerCase().includes(q) ||
      p.booking?.id.toLowerCase().includes(q) ||
      p.booking?.property.title.toLowerCase().includes(q) ||
      p.booking?.guest.email.toLowerCase().includes(q) ||
      `${p.booking?.guest.firstName} ${p.booking?.guest.lastName}`.toLowerCase().includes(q)
    );
  });

  const filteredPackages = packages.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q) ||
      p.stripePaymentIntentId?.toLowerCase().includes(q) ||
      p.package?.name?.toLowerCase().includes(q)
    );
  });

  const renderBookingIncome = () => {
    if (bookingLoading) return <LoadingState />;
    if (bookingError)   return <ErrorState msg={bookingError} onRetry={fetchBookingIncome} />;

    return (
      <div className="space-y-4">
        {bookingStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard icon={<TrendingUp className="w-4 h-4 text-green-600" />} label="Total Received" value={fmt(bookingStats.totalEarned)} color="green" />
            <StatCard icon={<ArrowDownCircle className="w-4 h-4 text-blue-600" />} label="Platform Commission" value={fmt(bookingStats.totalCommission)} color="blue" />
            <StatCard icon={<TrendingUp className="w-4 h-4 text-emerald-600" />} label="Net Earnings" value={fmt(bookingStats.netEarnings)} color="emerald" />
            <StatCard icon={<Clock className="w-4 h-4 text-yellow-600" />} label="Pending" value={fmt(bookingStats.pendingAmount)} color="yellow" />
          </div>
        )}
        {filteredBookings.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />}
            title="No booking income yet"
            desc={searchQuery ? "No results match your search" : "Payments from tenants will appear here once received"}
          />
        ) : (
          filteredBookings.map((p) => (
            <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-base">Booking Income</span>
                      <Badge className={statusColor(p.status)}>{p.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{fmtDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{fmt(p.amount, p.currency)}</div>
                    {p.commissionPercent != null && (
                      <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                        <div>Platform fee ({p.commissionPercent}%): <span className="text-red-600">-{fmt(p.commissionAmount ?? 0)}</span></div>
                        <div className="font-semibold text-green-700">Your earnings: {fmt(p.ownerEarnings ?? p.amount)}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {p.booking?.property && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">{p.booking.property.title}</p>
                        <p className="text-gray-500 text-xs">{p.booking.property.city}, {p.booking.property.state}</p>
                      </div>
                    </div>
                  )}
                  {p.booking?.guest && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">{p.booking.guest.firstName} {p.booking.guest.lastName}</p>
                        <p className="text-gray-500 text-xs">{p.booking.guest.email}</p>
                      </div>
                    </div>
                  )}
                  {p.booking && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">{fmtDate(p.booking.checkIn)} → {fmtDate(p.booking.checkOut)}</p>
                        <p className="text-gray-500 text-xs">{p.booking.nights} night{p.booking.nights !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded p-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-gray-600">
                  <IdField label="Payment ID" value={p.id} />
                  {p.booking?.id && <IdField label="Booking ID" value={p.booking.id} />}
                  {p.stripePaymentIntentId && <IdField label="Stripe Intent" value={p.stripePaymentIntentId} />}
                  {p.transactionId && <IdField label="Transaction ID" value={p.transactionId} />}
                  <div><span className="text-gray-400">Method: </span>{p.paymentMethod?.replace("_", " ")}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderPackages = () => {
    if (packageLoading) return <LoadingState />;
    if (packageError)   return <ErrorState msg={packageError} onRetry={fetchPackagePayments} />;

    return (
      <div className="space-y-4">
        {filteredPackages.length === 0 ? (
          <EmptyState
            icon={<Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />}
            title="No package subscriptions"
            desc={searchQuery ? "No results match your search" : "Packages you subscribe to will appear here"}
          />
        ) : (
          filteredPackages.map((p) => (
            <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900 text-base">{p.package?.name ?? "Package Subscription"}</span>
                      <Badge className={statusColor(p.status)}>{p.status}</Badge>
                      {p.package?.subscriptionStatus && (
                        <Badge className={subStatusColor(p.package.subscriptionStatus)}>{p.package.subscriptionStatus}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{fmtDate(p.createdAt)}</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{fmt(p.amount, p.currency)}</div>
                </div>
                {p.package && (p.package.startDate || p.package.endDate) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      {p.package.startDate ? fmtDate(p.package.startDate) : "—"} → {p.package.endDate ? fmtDate(p.package.endDate) : "—"}
                    </span>
                    <span className="text-gray-400">(subscription period)</span>
                  </div>
                )}
                <div className="bg-gray-50 rounded p-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs text-gray-600">
                  <IdField label="Payment ID" value={p.id} />
                  {p.package?.ownerPackageId && <IdField label="Subscription ID" value={p.package.ownerPackageId} />}
                  {p.stripePaymentIntentId && <IdField label="Stripe Intent" value={p.stripePaymentIntentId} />}
                  {p.transactionId && <IdField label="Transaction ID" value={p.transactionId} />}
                  <div><span className="text-gray-400">Method: </span>{p.paymentMethod?.replace("_", " ")}</div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[5px] border">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="border-b px-5 pt-5">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="booking_income" className="flex items-center gap-2">
              Booking Income
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{bookings.length}</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              Package Subscriptions
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{packages.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="booking_income" className="p-5 m-0">{renderBookingIncome()}</TabsContent>
        <TabsContent value="packages" className="p-5 m-0">{renderPackages()}</TabsContent>
      </Tabs>
    </div>
  );
}

function IdField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <Hash className="w-3 h-3 shrink-0 text-gray-400" />
      <span className="text-gray-400">{label}:</span>
      <span className="font-mono truncate" title={value}>{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const bg: Record<string, string> = {
    green: "bg-green-50 border-green-100",
    blue: "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
    yellow: "bg-yellow-50 border-yellow-100",
  };
  return (
    <div className={`rounded-lg border p-3 ${bg[color] ?? "bg-gray-50 border-gray-100"}`}>
      <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      <p className="text-gray-500 text-sm">Loading payments…</p>
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-10 h-10 mx-auto text-red-500 mb-3" />
      <p className="text-gray-900 font-semibold mb-1">Failed to load</p>
      <p className="text-gray-500 text-sm mb-4">{msg}</p>
      <Button variant="outline" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center py-12">
      {icon}
      <p className="text-gray-900 font-semibold mb-1">{title}</p>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
