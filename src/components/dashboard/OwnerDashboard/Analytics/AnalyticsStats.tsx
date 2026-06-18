"use client";

import { TrendingUp, Users, DollarSign, Star, Clock, Home, TrendingDown, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { OwnerAnalyticsData } from "@/types/ownerAnalytics";

interface AnalyticsStatsProps {
  data: OwnerAnalyticsData;
  loading?: boolean;
}

function formatChange(value: number, suffix = "%"): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}${suffix}`;
}

export default function AnalyticsStats({ data, loading }: AnalyticsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-[5px] p-4 border animate-pulse h-32" />
        ))}
      </div>
    );
  }

  const { stats } = data;

  const cards = [
    {
      title: "Booking Revenue",
      value: formatCurrency(stats.bookingRevenue),
      change: formatChange(stats.bookingRevenueChange),
      trend: stats.bookingRevenueChange >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      detail: `${stats.paidBookings} paid bookings`,
    },
    {
      title: "Your Earnings",
      value: formatCurrency(stats.ownerEarnings),
      change: formatChange(stats.ownerEarningsChange),
      trend: stats.ownerEarningsChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-600",
      detail: "After platform commission",
    },
    {
      title: "Total Bookings",
      value: String(stats.totalBookings),
      change: formatChange(stats.bookingsChange),
      trend: stats.bookingsChange >= 0 ? "up" : "down",
      icon: Home,
      color: "bg-blue-100 text-blue-600",
      detail: `${stats.occupancyRate}% occupancy`,
    },
    {
      title: "Unique Guests",
      value: String(stats.uniqueGuests),
      change: formatChange(stats.uniqueGuestsChange),
      trend: stats.uniqueGuestsChange >= 0 ? "up" : "down",
      icon: Users,
      color: "bg-pink-100 text-pink-600",
      detail: `${stats.repeatGuests} repeat guests`,
    },
    {
      title: "Guest Rating",
      value: stats.avgRating > 0 ? String(stats.avgRating) : "—",
      change: stats.reviewCount > 0 ? `${stats.reviewCount} reviews` : "No reviews",
      trend: "up" as const,
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
      detail: `${stats.repeatGuestRate}% repeat rate`,
    },
    {
      title: "Boost Spend",
      value: formatCurrency(stats.boostSpend),
      change: `${stats.activeBoosts} active`,
      trend: "up" as const,
      icon: Zap,
      color: "bg-orange-100 text-orange-600",
      detail: `Packages: ${formatCurrency(stats.packageSpend)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="bg-white rounded-[5px] p-4 border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${
                  stat.trend === "up"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
