"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CreditCard, TrendingUp, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import PaymentTabs from "@/components/dashboard/UserDashboard/PaymentTabs";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface PaymentStats {
  totalPaid: number;
  totalPending: number;
  failedPayments: number;
}

export default function PaymentsPage() {
  const [stats, setStats] = useState<PaymentStats>({
    totalPaid: 0,
    totalPending: 0,
    failedPayments: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPaymentStats = async () => {
      try {
        // Fetch all payments and filter for BOOKING type only
        const allPaymentsRes = await api.get("/payments?limit=100");
        const allPayments = (allPaymentsRes.data?.data?.items || []).filter(
          (p: any) => p.paymentType === "BOOKING"
        );

        const totalPaidAmount = allPayments
          .filter((p: any) => p.status === "PAID")
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const totalPendingAmount = allPayments
          .filter((p: any) => p.status === "PENDING")
          .reduce((sum: number, p: any) => sum + p.amount, 0);

        const failedCount = allPayments.filter((p: any) => p.status === "FAILED").length;

        setStats({
          totalPaid: totalPaidAmount,
          totalPending: totalPendingAmount,
          failedPayments: failedCount,
        });
      } catch (error) {
        console.error("Error fetching payment stats:", error);
      }
    };

    fetchPaymentStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">
              View your booking and package payments
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div className="bg-linear-to-br from-green-50 to-emerald-50 p-6 rounded-[5px] border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-green-600 text-sm font-medium">Completed</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid)}</div>
          <div className="text-sm text-gray-600">Total Paid</div>
        </div>

        <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-[5px] border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-blue-600 text-sm font-medium">Pending</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</div>
          <div className="text-sm text-gray-600">Amount Pending</div>
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

      {/* Search */}
      <div className="bg-white rounded-[5px] p-5 mb-5 border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search payments by transaction ID or booking ID..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Payment Tabs Content */}
      <PaymentTabs />
    </DashboardLayout>
  );
}