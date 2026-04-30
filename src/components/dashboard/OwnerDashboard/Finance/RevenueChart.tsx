"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const revenueData = [
  { month: "Aug", revenue: 185000, expenses: 45000, profit: 140000 },
  { month: "Sep", revenue: 210000, expenses: 52000, profit: 158000 },
  { month: "Oct", revenue: 195000, expenses: 48000, profit: 147000 },
  { month: "Nov", revenue: 230000, expenses: 55000, profit: 175000 },
  { month: "Dec", revenue: 280000, expenses: 65000, profit: 215000 },
  { month: "Jan", revenue: 245000, expenses: 55500, profit: 189500 },
];

const revenueSources = [
  { name: "Short-term Rentals", value: 65, color: "#10b981" },
  { name: "Long-term Rentals", value: 25, color: "#3b82f6" },
  { name: "Additional Services", value: 10, color: "#8b5cf6" },
];

export default function RevenueChart() {
  const [timeframe, setTimeframe] = useState("monthly");

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalExpenses = revenueData.reduce((sum, month) => sum + month.expenses, 0);
  const totalProfit = revenueData.reduce((sum, month) => sum + month.profit, 0);
  const growth = ((revenueData[5].revenue - revenueData[4].revenue) / revenueData[4].revenue) * 100;

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-sm text-gray-500 mt-1">
            Monthly revenue, expenses, and profit trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["monthly", "quarterly", "yearly"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-sm rounded-[5px] ${
                  timeframe === period ? "bg-white shadow" : ""
                }`}
                onClick={() => setTimeframe(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Calendar className="w-4 h-4" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[5px] p-4 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className={`flex items-center gap-1 ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">{Math.abs(growth).toFixed(1)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Last 6 months</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[5px] p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Total Expenses</div>
            <div className="text-red-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Operating costs</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[5px] p-4 border border-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Net Profit</div>
            <div className="text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalProfit)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Profit margin: {(totalProfit / totalRevenue * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
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
              formatter={(value) => [`£${Number(value).toLocaleString()}`, ""]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
            <Bar
              dataKey="expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
            <Bar
              dataKey="profit"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="Profit"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Sources */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-4">Revenue Sources</h4>
        <div className="space-y-3">
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
    </div>
  );
}