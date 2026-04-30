// components/dashboard/OwnerDashboard/RevenueChart.tsx
"use client";

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
  LineChart,
  Line,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const monthlyRevenueData = [
  { month: "Aug", revenue: 185000, bookings: 8, inquiries: 25 },
  { month: "Sep", revenue: 210000, bookings: 10, inquiries: 32 },
  { month: "Oct", revenue: 195000, bookings: 9, inquiries: 28 },
  { month: "Nov", revenue: 230000, bookings: 12, inquiries: 35 },
  { month: "Dec", revenue: 280000, bookings: 15, inquiries: 42 },
  { month: "Jan", revenue: 245000, bookings: 8, inquiries: 38 },
];

const propertyRevenueData = [
  { name: "Seaside Villa", value: 540000, color: "#10b981" },
  { name: "Urban Apartment", value: 200000, color: "#3b82f6" },
  { name: "Mountain Cottage", value: 90000, color: "#8b5cf6" },
  { name: "Luxury Penthouse", value: 0, color: "#f59e0b" },
];

const revenueSources = [
  { name: "Short-rent", value: 65, color: "#10b981" },
  { name: "Long-rent", value: 30, color: "#3b82f6" },
  { name: "Purchase", value: 5, color: "#8b5cf6" },
];

export default function RevenueChart() {
  const [timeframe, setTimeframe] = useState("monthly");

  const totalRevenue = monthlyRevenueData.reduce((sum, month) => sum + month.revenue, 0);
  const avgMonthlyRevenue = totalRevenue / monthlyRevenueData.length;
  const lastMonthRevenue = monthlyRevenueData[monthlyRevenueData.length - 1].revenue;
  const growth = ((lastMonthRevenue - avgMonthlyRevenue) / avgMonthlyRevenue) * 100;

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
          {["monthly", "quarterly", "yearly"].map((period) => (
            <button
              key={period}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-[5px] transition-colors
                ${timeframe === period
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
              onClick={() => setTimeframe(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[5px] p-5 border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(lastMonthRevenue)}
          </div>
          <div className="text-sm text-gray-600">Current Month Revenue</div>
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
          <div className="text-2xl font-bold text-gray-900">85%</div>
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
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">Total 6-Month Revenue</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Monthly Revenue Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
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
                  formatter={(value) => [`£${Number(value).toLocaleString()}`, "Revenue"]}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Property */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Revenue by Property</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyRevenueData.filter(p => p.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${Number((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`£${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Sources */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Revenue Sources</h4>
          <div className="space-y-4">
            {revenueSources.map((source) => (
              <div key={source.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    ></div>
                    <span className="text-sm font-medium">{source.name}</span>
                  </div>
                  <span className="font-medium">{source.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${source.value}%`,
                      backgroundColor: source.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings vs Inquiries */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Bookings vs Inquiries</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData}>
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
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Bookings"
                />
                <Line
                  type="monotone"
                  dataKey="inquiries"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Inquiries"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}