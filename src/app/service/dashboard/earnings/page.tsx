// app/service/dashboard/earnings/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EarningsPage() {
  const chartData: Array<{ week: string; earnings: number; bookings: number }> = [
    { week: "Week 1", earnings: 12000, bookings: 8 },
    { week: "Week 2", earnings: 15500, bookings: 11 },
    { week: "Week 3", earnings: 18200, bookings: 13 },
    { week: "Week 4", earnings: 21800, bookings: 15 },
  ];

  const monthlyData: Array<{ month: string; earnings: number }> = [
    { month: "January", earnings: 45000 },
    { month: "February", earnings: 52000 },
  ];

  const transactions = [
    {
      id: "1",
      date: "2026-02-20",
      description: "Plumbing Installation - Rajesh Kumar",
      amount: 1500,
      status: "completed",
    },
    {
      id: "2",
      date: "2026-02-18",
      description: "Electrical Repair - Priya Singh",
      amount: 1200,
      status: "completed",
    },
    {
      id: "3",
      date: "2026-02-16",
      description: "Maintenance Check - Amit Patel",
      amount: 800,
      status: "completed",
    },
    {
      id: "4",
      date: "2026-02-15",
      description: "Bathroom Renovation - Neha Desai",
      amount: 2000,
      status: "pending",
    },
  ];

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600 mt-2">
          Track your earnings and payment history.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹52,000</p>
          <p className="text-xs text-green-600 mt-2">+15% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹21,800</p>
          <p className="text-xs text-green-600 mt-2">From 15 bookings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Earned</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹97,000</p>
          <p className="text-xs text-gray-500 mt-2">Since joining</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">₹2,000</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting completion</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Earnings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Earnings
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => value !== undefined ? `₹${(value as number).toLocaleString()}` : '-'}
              />
              <Bar dataKey="earnings" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Earnings
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => value !== undefined ? `₹${(value as number).toLocaleString()}` : '-'}
              />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h2>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Description
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(txn.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{txn.description}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ₹{txn.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        txn.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Receipt className="w-4 h-4 inline-block mr-1" />
                      Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
