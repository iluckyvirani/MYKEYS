"use client";

import { useState } from "react";
import { Zap, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsPeriod, OwnerAnalyticsData } from "@/types/ownerAnalytics";
import Link from "next/link";
import { useDashboardBase } from "@/lib/dashboard/DashboardContext";

interface AnalyticsChartsProps {
  data: OwnerAnalyticsData;
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  loading?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  CHECKED_OUT: "Checked out",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function AnalyticsCharts({
  data,
  period,
  onPeriodChange,
  loading,
}: AnalyticsChartsProps) {
  const { basePath } = useDashboardBase();
  const [activeChart, setActiveChart] = useState<"occupancy" | "revenue" | "bookings" | "earnings">("revenue");

  if (loading) {
    return <div className="bg-white rounded-[5px] border p-6 h-96 animate-pulse" />;
  }

  const maxTrendValue = Math.max(
    ...data.monthlyTrend.map((m) => {
      if (activeChart === "occupancy") return m.occupancy;
      if (activeChart === "bookings") return m.bookings;
      if (activeChart === "earnings") return m.ownerEarnings;
      return m.revenue;
    }),
    1
  );

  const getBarValue = (month: (typeof data.monthlyTrend)[0]) => {
    if (activeChart === "occupancy") return month.occupancy;
    if (activeChart === "bookings") return month.bookings;
    if (activeChart === "earnings") return month.ownerEarnings;
    return month.revenue;
  };

  const formatBarLabel = (month: (typeof data.monthlyTrend)[0]) => {
    if (activeChart === "occupancy") return `${month.occupancy}%`;
    if (activeChart === "bookings") return `${month.bookings} bookings`;
    if (activeChart === "earnings") return formatCurrency(month.ownerEarnings);
    return formatCurrency(month.revenue);
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">
            Bookings, revenue, and occupancy from your properties
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(["1m", "3m", "6m", "1y"] as AnalyticsPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                className={`px-3 py-1.5 text-sm rounded-[5px] ${
                  period === p ? "bg-white shadow" : ""
                }`}
                onClick={() => onPeriodChange(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(
          [
            ["revenue", "Revenue"],
            ["earnings", "Your earnings"],
            ["bookings", "Bookings"],
            ["occupancy", "Occupancy"],
          ] as const
        ).map(([chart, label]) => (
          <button
            key={chart}
            type="button"
            onClick={() => setActiveChart(chart)}
            className={`px-4 py-2 text-sm rounded-[5px] border ${
              activeChart === chart
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Monthly trend</h4>
          <span className="text-sm text-gray-500">Last {data.periodMonths} months</span>
        </div>
        {data.monthlyTrend.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No data for this period yet.</p>
        ) : (
          <div className="space-y-4">
            {data.monthlyTrend.map((month) => {
              const value = getBarValue(month);
              const width = Math.max(4, Math.round((value / maxTrendValue) * 100));
              return (
                <div key={month.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.label}</span>
                    <span className="text-sm text-gray-600">{formatBarLabel(month)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-green-500 transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Property performance</h4>
        {data.propertyPerformance.length === 0 ? (
          <p className="text-sm text-gray-500">No properties yet.</p>
        ) : (
          <div className="space-y-4">
            {data.propertyPerformance.slice(0, 6).map((property) => (
              <div
                key={property.id}
                className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3 gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{property.title}</div>
                    <div className="text-sm text-gray-500">
                      {property.revenue > 0
                        ? formatCurrency(property.revenue)
                        : "No revenue"}{" "}
                      · {property.bookings} bookings
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{property.occupancy}%</div>
                      <div className="text-xs text-gray-500">Occupancy</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {property.rating > 0 ? property.rating : "—"}
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${property.occupancy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Booking status</h4>
        {data.bookingStatusBreakdown.length === 0 ? (
          <p className="text-sm text-gray-500">No bookings in this period.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.bookingStatusBreakdown.map((item) => (
              <div key={item.status} className="p-3 bg-gray-50 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <div className="text-xs text-gray-600">
                  {STATUS_LABELS[item.status] || item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium text-gray-900">Boost analytics</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Active boosts</span>
              <span className="font-medium">{data.boostAnalytics.activeBids}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bids this period</span>
              <span className="font-medium">{data.boostAnalytics.totalBids}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total spend</span>
              <span className="font-medium">{formatCurrency(data.boostAnalytics.totalSpend)}</span>
            </div>
          </div>
          {data.boostAnalytics.recent.length > 0 && (
            <ul className="mt-3 pt-3 border-t space-y-2 text-xs text-gray-600">
              {data.boostAnalytics.recent.map((bid) => (
                <li key={bid.id}>
                  {bid.propertyTitle} · {bid.zipCode} · {bid.daysRemaining}d left
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`${basePath}/bids`}
            className="inline-block mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Manage boosts →
          </Link>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-purple-500" />
            <h4 className="font-medium text-gray-900">Package</h4>
          </div>
          {data.packageAnalytics.current ? (
            <div className="space-y-2 text-sm">
              <div className="font-semibold text-gray-900">
                {data.packageAnalytics.current.name}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Listings used</span>
                <span className="font-medium">
                  {data.packageAnalytics.current.propertiesUsed}
                  {data.packageAnalytics.current.propertyLimit > 0
                    ? ` / ${data.packageAnalytics.current.propertyLimit}`
                    : " (unlimited)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Renews / ends</span>
                <span className="font-medium">
                  {new Date(data.packageAnalytics.current.endDate).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Spent this period</span>
                <span className="font-medium">
                  {formatCurrency(data.packageAnalytics.totalSpent)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active package subscription.</p>
          )}
          <Link
            href={`${basePath}/packages`}
            className="inline-block mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View packages →
          </Link>
        </div>
      </div>
    </div>
  );
}
