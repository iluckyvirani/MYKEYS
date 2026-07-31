"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { AnalyticsPeriod, OwnerAnalyticsData } from "@/types/ownerAnalytics";

const PIE_COLORS = ["#339390", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#64748b"];

type Timeframe = "monthly" | "quarterly" | "yearly";

function timeframeToPeriod(tf: Timeframe): AnalyticsPeriod {
  if (tf === "quarterly") return "3m";
  if (tf === "yearly") return "1y";
  return "6m";
}

export default function RevenueChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("monthly");
  const [data, setData] = useState<OwnerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const period = timeframeToPeriod(timeframe);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/owner/analytics?period=${period}`);
      if (response.data?.success && response.data.data) {
        setData(response.data.data);
      } else {
        setError("Failed to load revenue analytics");
      }
    } catch (err: unknown) {
      console.error("Error fetching revenue analytics:", err);
      setError("Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const monthlyData =
    data?.monthlyTrend.map((m) => ({
      month: m.label,
      revenue: m.revenue,
    })) ?? [];

  const propertyData =
    data?.propertyPerformance
      .filter((p) => p.revenue > 0)
      .map((p, i) => ({
        name: p.title,
        value: p.revenue,
        color: PIE_COLORS[i % PIE_COLORS.length],
      })) ?? [];

  const lastMonthRevenue =
    monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].revenue : 0;
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const growth = data?.stats.bookingRevenueChange ?? 0;
  const occupancy = data?.stats.occupancyRate ?? 0;

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track your earnings and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["monthly", "quarterly", "yearly"] as Timeframe[]).map((periodKey) => (
            <button
              key={periodKey}
              type="button"
              className={`
                px-3 py-1.5 text-sm font-medium rounded-[5px] transition-colors
                ${
                  timeframe === periodKey
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
              onClick={() => setTimeframe(periodKey)}
            >
              {periodKey.charAt(0).toUpperCase() + periodKey.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[5px] p-5 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div
              className={`flex items-center gap-1 ${
                growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growth >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "—" : formatCurrency(lastMonthRevenue)}
          </div>
          <div className="text-sm text-gray-600">Latest Month Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[5px] p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Percent className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "—" : `${occupancy}%`}
          </div>
          <div className="text-sm text-gray-600">Average Occupancy Rate</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-[5px] p-5 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? "—" : formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">
            Total {data?.periodMonths ?? 6}-Month Revenue
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Trend */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Monthly Revenue Trend</h4>
          <div className="h-64">
            {loading ? (
              <div className="h-full animate-pulse rounded-[5px] bg-gray-100" />
            ) : monthlyData.length === 0 ? (
              <p className="text-sm text-gray-500 py-16 text-center">
                No revenue data for this period yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(value) => `£${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `£${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#339390"
                    radius={[4, 4, 0, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Revenue by Property */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Revenue by Property</h4>
          <div className="h-64">
            {loading ? (
              <div className="h-full animate-pulse rounded-[5px] bg-gray-100" />
            ) : propertyData.length === 0 ? (
              <p className="text-sm text-gray-500 py-16 text-center">
                No property revenue for this period yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${Number((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `£${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
