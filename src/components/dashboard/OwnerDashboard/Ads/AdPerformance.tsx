"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Filter, Calendar } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const performanceData = [
  { date: "Jan 1", impressions: 4200, clicks: 210, conversions: 8, ctr: 5.0, cpc: 14.20 },
  { date: "Jan 5", impressions: 5800, clicks: 275, conversions: 12, ctr: 4.7, cpc: 15.30 },
  { date: "Jan 10", impressions: 5200, clicks: 240, conversions: 10, ctr: 4.6, cpc: 13.80 },
  { date: "Jan 15", impressions: 6100, clicks: 295, conversions: 15, ctr: 4.8, cpc: 14.50 },
  { date: "Jan 20", impressions: 5600, clicks: 265, conversions: 11, ctr: 4.7, cpc: 14.00 },
  { date: "Jan 25", impressions: 6300, clicks: 310, conversions: 16, ctr: 4.9, cpc: 13.50 },
  { date: "Jan 30", impressions: 6700, clicks: 330, conversions: 18, ctr: 4.9, cpc: 13.20 },
];

const platformData = [
  { platform: "Facebook", impressions: 58000, clicks: 2800, ctr: 4.8, conversions: 35, roas: 3.5 },
  { platform: "Instagram", impressions: 42000, clicks: 2100, ctr: 5.0, conversions: 28, roas: 4.2 },
  { platform: "Google", impressions: 35000, clicks: 1550, ctr: 4.4, conversions: 22, roas: 3.8 },
];

export default function AdPerformance() {
  const [timeframe, setTimeframe] = useState("7d");
  const [metric, setMetric] = useState("conversions");

  const totalImpressions = performanceData.reduce((sum, day) => sum + day.impressions, 0);
  const totalClicks = performanceData.reduce((sum, day) => sum + day.clicks, 0);
  const totalConversions = performanceData.reduce((sum, day) => sum + day.conversions, 0);
  const avgCTR = (totalClicks / totalImpressions * 100).toFixed(1);
  const avgCPC = performanceData.reduce((sum, day) => sum + day.cpc, 0) / performanceData.length;

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ad Performance</h3>
          <p className="text-sm text-gray-500 mt-1">
            Detailed analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["7d", "30d", "90d"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-sm rounded-[5px] ${
                  timeframe === period ? "bg-white shadow" : ""
                }`}
                onClick={() => setTimeframe(period)}
              >
                {period}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Calendar className="w-4 h-4" />
            Custom
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[5px] p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Total Impressions</div>
            <div className="text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[5px] p-4 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Click-through Rate</div>
            <div className="text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {avgCTR}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Industry avg: 3.2%</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-[5px] p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Total Conversions</div>
            <div className="text-green-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalConversions}
          </div>
          <div className="text-xs text-gray-500 mt-1">Bookings from ads</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[5px] p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Avg. Cost per Click</div>
            <div className="text-green-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            £{avgCPC.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">-£2.50 from last month</div>
        </div>
      </div>

      {/* Metrics Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["impressions", "clicks", "conversions", "ctr", "cpc"].map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`px-4 py-2 text-sm rounded-[5px] border ${
              metric === m
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [value, metric]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Performance */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Performance by Platform</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Platform</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Impressions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">CTR</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Conversions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ROAS</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {platformData.map((platform) => (
                <tr key={platform.platform} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium">{platform.platform}</td>
                  <td className="py-4 px-4">{platform.impressions.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{platform.ctr}%</span>
                      {platform.ctr >= 4.8 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">{platform.conversions}</td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${
                      platform.roas >= 4 ? "text-green-600" : 
                      platform.roas >= 3 ? "text-yellow-600" : 
                      "text-red-600"
                    }`}>
                      {platform.roas}x
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(platform.conversions / 50) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}