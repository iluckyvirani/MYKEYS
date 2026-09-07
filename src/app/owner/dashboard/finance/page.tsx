"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CreditCard, TrendingUp, Clock, AlertCircle, Search, Filter, X, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import OwnerPaymentList from "@/components/dashboard/OwnerDashboard/Finance/OwnerPaymentList";

interface PaymentStats {
  totalReceived: number;
  totalPending: number;
  totalRefunded: number;
  failedPayments: number;
}

interface PaymentFilters {
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
}

export default function OwnerPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats>({
    totalReceived: 0,
    totalPending: 0,
    totalRefunded: 0,
    failedPayments: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<PaymentFilters | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        const allPaymentsRes = await api.get("/payments?limit=100");
        const allPayments = allPaymentsRes.data?.data?.items || [];

        const totalReceivedAmount = allPayments
          .filter((p: any) => p.status === "PAID")
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const totalPendingAmount = allPayments
          .filter((p: any) => p.status === "PENDING")
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const totalRefundedAmount = allPayments
          .filter((p: any) => p.status === "REFUNDED")
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const failedCount = allPayments.filter((p: any) => p.status === "FAILED").length;

        setStats({ 
          totalReceived: totalReceivedAmount, 
          totalPending: totalPendingAmount, 
          totalRefunded: totalRefundedAmount,
          failedPayments: failedCount 
        });
      } catch (error) {
        console.error("Error fetching payment stats:", error);
      }
    };
    fetchPaymentStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", { 
      style: "currency", 
      currency: "GBP", 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);

  const handleApplyFilters = (filters: PaymentFilters) => {
    setAppliedFilters(filters);
    setFilterModalOpen(false);
  };

  const removeFilter = (key: keyof PaymentFilters) => {
    if (!appliedFilters) return;
    const updated = { ...appliedFilters };
    delete updated[key];
    setAppliedFilters(Object.keys(updated).length > 0 ? updated : null);
  };

  const activeFilterChips = appliedFilters
    ? Object.entries(appliedFilters).filter(([, v]) => v && v !== "recent")
    : [];

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">Track and manage payments from your property bookings</p>
          </div>
        </div>
      </div>

      {/* Payment Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-[5px] border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-green-600 text-sm font-medium">Received</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalReceived)}</div>
          <div className="text-sm text-gray-600">Total Received</div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-[5px] border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-blue-600 text-sm font-medium">Pending</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</div>
          <div className="text-sm text-gray-600">Awaiting Payment</div>
        </div>

        <div className="bg-linear-to-br from-orange-50 to-amber-50 p-6 rounded-[5px] border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-orange-600 text-sm font-medium">Refunded</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRefunded)}</div>
          <div className="text-sm text-gray-600">Total Refunds</div>
        </div>

        <div className="bg-linear-to-br from-red-50 to-pink-50 p-6 rounded-[5px] border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-red-600 text-sm font-medium">Failed</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.failedPayments}</div>
          <div className="text-sm text-gray-600">Failed Payments</div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white rounded-[5px] p-5 mb-5 border">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search payments by transaction ID or booking ID..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterModalOpen(true)}
            className="rounded-[5px] whitespace-nowrap"
          >
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
            {activeFilterChips.length > 0 && (
              <span className="ml-2 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterChips.length}
              </span>
            )}
          </Button>
        </div>

        {/* Applied filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {activeFilterChips.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {key === "paymentMethod" 
                  ? `Method: ${value}` 
                  : key === "fromDate" 
                  ? `From: ${value}` 
                  : key === "toDate" 
                  ? `To: ${value}` 
                  : `Sort: ${value}`}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeFilter(key as keyof PaymentFilters)}
                />
              </Badge>
            ))}
            <button
              className="text-xs text-gray-500 underline hover:text-gray-700 cursor-pointer"
              onClick={() => setAppliedFilters(null)}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Payment List */}
      <OwnerPaymentList searchQuery={debouncedSearch} filters={appliedFilters || undefined} />

      {/* Filter Modal */}
      <PaymentFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </DashboardLayout>
  );
}