"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { AdminPaymentFilterModal } from "@/components/dashboard/admin/payments/AdminPaymentFilterModal";
import { AdminPaymentList } from "@/components/dashboard/admin/payments/AdminPaymentList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, X, DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface Payment {
  id: string;
  transactionId: string;
  paidBy: string;
  amount: number;
  method: string;
  date: string;
  status: "completed" | "pending" | "failed";
  type: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showAppliedFilters, setShowAppliedFilters] = useState(false);

  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: "1",
        transactionId: "TXN20250215001",
        paidBy: "Priya Singh",
        amount: 125000,
        method: "Razorpay",
        date: "2025-02-15",
        status: "completed",
        type: "Booking",
      },
      {
        id: "2",
        transactionId: "TXN20250214002",
        paidBy: "Arjun Nair",
        amount: 250000,
        method: "Credit Card",
        date: "2025-02-14",
        status: "completed",
        type: "Booking",
      },
      {
        id: "3",
        transactionId: "TXN20250213003",
        paidBy: "Neha Sharma",
        amount: 45000,
        method: "Google Pay",
        date: "2025-02-13",
        status: "pending",
        type: "Service",
      },
      {
        id: "4",
        transactionId: "TXN20250212004",
        paidBy: "Rahul Verma",
        amount: 180000,
        method: "UPI",
        date: "2025-02-12",
        status: "completed",
        type: "Subscription",
      },
      {
        id: "5",
        transactionId: "TXN20250211005",
        paidBy: "Anjali Gupta",
        amount: 75000,
        method: "Net Banking",
        date: "2025-02-11",
        status: "failed",
        type: "Booking",
      },
    ];
    setPayments(mockPayments);
    setLoading(false);
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.includes(searchTerm) ||
      payment.paidBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !appliedFilters.status || payment.status === appliedFilters.status;
    const matchesMethod = !appliedFilters.method || payment.method === appliedFilters.method;
    const matchesType = !appliedFilters.type || payment.type === appliedFilters.type;
    return matchesSearch && matchesStatus && matchesMethod && matchesType;
  });

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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payment record?")) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const failedPayments = payments.filter((p) => p.status === "failed");
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const avgTransaction = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

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
                <div className="text-2xl font-bold text-gray-900">₹{(totalRevenue / 100000).toFixed(2)}L</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Completed payments
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedPayments.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Total transactions
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{(pendingAmount / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Awaiting completion
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">₹{(avgTransaction / 1000).toFixed(0)}K</div>
                <div className="text-sm text-gray-600">Avg Transaction</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Average amount
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
              Filters
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
                  className="text-red-600 hover:text-red-700"
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
          empty={filteredPayments.length === 0}
          onDelete={handleDelete}
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
