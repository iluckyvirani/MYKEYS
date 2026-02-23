// app/service/dashboard/earnings/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface EarningsData {
  stats: {
    thisMonth: number;
    thisWeek: number;
    totalEarned: number;
    pending: number;
    thisMonthBookings: number;
    thisWeekBookings: number;
  };
  weeklyChart: { week: string; earnings: number; bookings: number }[];
  monthlyChart: { month: string; earnings: number }[];
  transactions: { id: string; date: string; description: string; amount: number; status: string }[];
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get("/service/earnings");
        const d = res.data?.data;
        if (d) {
          setData(d);
        }
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const stats = data?.stats || { thisMonth: 0, thisWeek: 0, totalEarned: 0, pending: 0, thisMonthBookings: 0, thisWeekBookings: 0 };
  const chartData = data?.weeklyChart || [];
  const monthlyData = data?.monthlyChart || [];
  const transactions = data?.transactions || [];

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
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-500">Loading earnings data...</p>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.thisMonth.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2">{stats.thisMonthBookings || 0} bookings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">This Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.thisWeek.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-2">From {stats.thisWeekBookings} bookings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Total Earned</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Since joining</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">₹{stats.pending.toLocaleString()}</p>
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
      </>
      )}
    </DashboardLayout>
  );
}
