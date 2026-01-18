"use client";

import { useState } from "react";
import { Calendar, Filter, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const occupancyData = [
  { month: "Aug", occupancy: 72, revenue: 185000 },
  { month: "Sep", occupancy: 78, revenue: 210000 },
  { month: "Oct", occupancy: 75, revenue: 195000 },
  { month: "Nov", occupancy: 82, revenue: 230000 },
  { month: "Dec", occupancy: 88, revenue: 280000 },
  { month: "Jan", occupancy: 85, revenue: 245000 },
];

const propertyPerformance = [
  { property: "Seaside Villa", revenue: 540000, occupancy: 92, rating: 4.8 },
  { property: "Urban Apartment", revenue: 200000, occupancy: 85, rating: 4.5 },
  { property: "Mountain Cottage", revenue: 90000, occupancy: 65, rating: 4.9 },
  { property: "Luxury Penthouse", revenue: 0, occupancy: 0, rating: 4.7 },
];

const guestDemographics = [
  { segment: "Families", percentage: 35, color: "#10b981" },
  { segment: "Couples", percentage: 28, color: "#3b82f6" },
  { segment: "Business", percentage: 22, color: "#8b5cf6" },
  { segment: "Solo", percentage: 15, color: "#f59e0b" },
];

export default function AnalyticsCharts() {
  const [timeframe, setTimeframe] = useState("6m");
  const [activeChart, setActiveChart] = useState("occupancy");

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">
            Visualize trends and patterns across all metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["1m", "3m", "6m", "1y"].map((period) => (
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["occupancy", "revenue", "guests", "properties"].map((chart) => (
          <button
            key={chart}
            onClick={() => setActiveChart(chart)}
            className={`px-4 py-2 text-sm rounded-[5px] border ${
              activeChart === chart
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {chart.charAt(0).toUpperCase() + chart.slice(1)}
          </button>
        ))}
      </div>

      {/* Occupancy Chart (Simplified - using div bars instead of complex chart) */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Occupancy & Revenue Trend</h4>
          <span className="text-sm text-gray-500">Last 6 months</span>
        </div>
        <div className="space-y-6">
          {occupancyData.map((month) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{month.month}</span>
                <span className="text-sm text-gray-600">{month.occupancy}% occupancy</span>
              </div>
              <div className="flex gap-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-green-500"
                    style={{ width: `${month.occupancy}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium whitespace-nowrap">
                  ₹{(month.revenue / 1000).toFixed(0)}k
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Property Performance */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Property Performance</h4>
        <div className="space-y-4">
          {propertyPerformance.map((property) => (
            <div key={property.property} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900">{property.property}</div>
                  <div className="text-sm text-gray-500">
                    {property.revenue > 0 ? `₹${property.revenue.toLocaleString()}` : 'No revenue'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{property.occupancy}%</div>
                    <div className="text-xs text-gray-500">Occupancy</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{property.rating}</div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${property.occupancy}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Demographics */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Guest Demographics</h4>
        <div className="space-y-3">
          {guestDemographics.map((segment) => (
            <div key={segment.segment} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <span className="text-sm font-medium">{segment.segment}</span>
                </div>
                <span className="font-medium">{segment.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${segment.percentage}%`,
                    backgroundColor: segment.color,
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