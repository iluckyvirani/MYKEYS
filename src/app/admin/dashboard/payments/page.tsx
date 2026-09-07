"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminPaymentFilterModal } from "@/components/dashboard/admin/payments/AdminPaymentFilterModal";
import { AdminPaymentList } from "@/components/dashboard/admin/payments/AdminPaymentList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Filter, Download, X, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Payment {
  id: string;
  transactionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  userId: string;
  userName: string;
  userEmail: string | null;
  bookingId: string | null;
  bookingStatus: string | null;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  propertyId: string | null;
  propertyTitle: string | null;
  propertyCity: string | null;
  guestId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  packageId: string | null;
  packageName: string | null;
  subscriptionStatus: string | null;
  amount: number;
  currency: string;
  commissionPercent: number | null;
  commissionAmount: number | null;
  ownerEarnings: number | null;
  status: string;
  paymentMethod: string;
  paymentType: "BOOKING" | "PACKAGE";
  createdAt: string;
  updatedAt: string;
  // legacy compat
  paidBy?: string;
  method?: string;
  date?: string;
  type?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);
  const [stats, setStats] = useState({
    completedCount: 0,
    completedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    failedCount: 0,
    avgTransaction: 0,
  });

  const formatGbp = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "50");
      if (searchTerm) params.append("search", searchTerm);
      if (appliedFilters.status) {
        const statusMap: { [key: string]: string } = {
          completed: "PAID",
          pending: "PENDING",
          failed: "FAILED",
          paid: "PAID",
        };
        params.append(
          "status",
          statusMap[String(appliedFilters.status).toLowerCase()] ||
            appliedFilters.status.toUpperCase()
        );
      }
      if (appliedFilters.method) params.append("paymentMethod", appliedFilters.method);

      const response = await api.get(`/admin/payments?${params.toString()}`);
      if (response.data?.success && response.data?.data?.items) {
        const raw = response.data.data.items;
        const apiPayments = Array.isArray(raw) ? raw : (raw.payments ?? []);
        setPayments(apiPayments);

        const apiStats = response.data.data.stats;
        if (apiStats) {
          setStats({
            completedCount: apiStats.completedCount ?? 0,
            completedAmount: apiStats.completedAmount ?? 0,
            pendingCount: apiStats.pendingCount ?? 0,
            pendingAmount: apiStats.pendingAmount ?? 0,
            failedCount: apiStats.failedCount ?? 0,
            avgTransaction: apiStats.avgTransaction ?? 0,
          });
        } else {
          // Fallback: compute from loaded rows using Prisma status values
          const isPaid = (s: string) =>
            ["PAID", "COMPLETED", "completed"].includes(String(s).toUpperCase()) ||
            String(s).toLowerCase() === "completed";
          const isPending = (s: string) => String(s).toUpperCase() === "PENDING";
          const paid = apiPayments.filter((p: Payment) => isPaid(p.status));
          const pending = apiPayments.filter((p: Payment) => isPending(p.status));
          const paidTotal = paid.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0);
          setStats({
            completedCount: paid.length,
            completedAmount: paidTotal,
            pendingCount: pending.length,
            pendingAmount: pending.reduce(
              (sum: number, p: Payment) => sum + (p.amount || 0),
              0
            ),
            failedCount: apiPayments.filter(
              (p: Payment) => String(p.status).toUpperCase() === "FAILED"
            ).length,
            avgTransaction: paid.length ? paidTotal / paid.length : 0,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
      setStats({
        completedCount: 0,
        completedAmount: 0,
        pendingCount: 0,
        pendingAmount: 0,
        failedCount: 0,
        avgTransaction: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, appliedFilters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Payments are already filtered by API
  const filteredPayments = payments;

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters);
    setShowAppliedFilters(Object.keys(filters).length > 0);
  };

  const handleClearFilter = (filterKey: string) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    setAppliedFilters(newFilters);
    setShowAppliedFilters(Object.keys(newFilters).length > 0);
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({});
    setShowAppliedFilters(false);
  };

  const handleViewPayment = (payment: Payment) => {
    router.push(`/admin/dashboard/payments/${payment.id}`);
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-2">
              Track and manage all platform transactions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatGbp(stats.completedAmount)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              From {stats.completedCount} paid payment{stats.completedCount === 1 ? "" : "s"}
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedCount}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Paid transactions
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatGbp(stats.pendingAmount)}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.pendingCount} awaiting completion
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatGbp(stats.avgTransaction)}
                </div>
                <div className="text-sm text-gray-600">Avg Transaction</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Average paid amount
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-[5px] border p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by transaction ID or name..."
                  className="pl-10 w-full rounded-[5px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {showAppliedFilters && Object.keys(appliedFilters).length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {appliedFilters.status && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Status: {appliedFilters.status}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("status")}
                  />
                </Badge>
              )}
              {appliedFilters.method && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Method: {appliedFilters.method}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("method")}
                  />
                </Badge>
              )}
              {appliedFilters.type && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Type: {appliedFilters.type}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleClearFilter("type")}
                  />
                </Badge>
              )}
              {Object.keys(appliedFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Payment List */}
        <AdminPaymentList
          payments={filteredPayments}
          loading={loading}
        />

        {/* Filter Modal */}
        <AdminPaymentFilterModal
          isOpen={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          onApply={handleApplyFilters}
          appliedFilters={appliedFilters}
        />
      </div>
    </AdminDashboardLayout>
  );
}
