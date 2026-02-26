"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Eye, CheckCircle, Clock } from "lucide-react";

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
  const [payments, setPayments] = useState<Payment[]>([
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
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.transactionId.includes(searchTerm) ||
      payment.paidBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all platform payments</p>
        </div>

        {/* Revenue Card */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue (Completed)</p>
              <p className="text-3xl font-bold text-gray-900">₹{(totalRevenue / 100000).toFixed(2)}L</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by transaction ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Paid By</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{payment.transactionId}</td>
                    <td className="py-3 px-4 text-gray-600">{payment.paidBy}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600">{payment.method}</td>
                    <td className="py-3 px-4 text-gray-600">{payment.type}</td>
                    <td className="py-3 px-4 text-gray-600">{payment.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {payment.status === "completed" && <CheckCircle className="w-3 h-3" />}
                        {payment.status === "pending" && <Clock className="w-3 h-3" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
