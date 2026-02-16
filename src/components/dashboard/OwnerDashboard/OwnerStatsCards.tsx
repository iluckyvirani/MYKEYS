"use client";

import { useState, useEffect } from "react";
import {
  Building,
  Calendar,
  DollarSign,
  Inbox,
  Star,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";

interface DashboardStats {
  properties: {
    total: number;
    active: number;
    pending: number;
    newThisMonth: number;
    change: string;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    checkedIn: number;
    occupancyRate: number;
    change: string;
  };
  revenue: {
    current: number;
    collected: number;
    change: number;
    changeText: string;
  };
  inquiries: {
    total: number;
    highPriority: number;
    new: number;
    avgResponseTime: number;
    change: string;
  };
  rating: {
    average: number;
    total: number;
    change: number;
    changeText: string;
  };
  conversion: {
    rate: number;
    change: number;
    changeText: string;
  };
}

export default function OwnerStatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/owner/dashboard/stats");
        
        if (response.data?.success) {
          setStats(response.data.data);
        } else {
          setError("Failed to load statistics");
        }
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.response?.data?.message || "Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-[5px] p-3 border shadow-sm animate-pulse">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="w-20 h-6 bg-gray-200 rounded-[5px]"></div>
            </div>
            <div className="mt-5">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-8 bg-gray-200 rounded mt-2"></div>
              <div className="w-20 h-4 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[5px] p-4">
        <p className="text-red-600">{error || "Failed to load statistics"}</p>
      </div>
    );
  }

  const enhancedOwnerStats = [
    {
      title: "Total Properties",
      value: stats.properties.total,
      change: stats.properties.change,
      icon: Building,
      color: "bg-indigo-500",
      trend: stats.properties.newThisMonth > 0 ? "up" : "same" as "up" | "down" | "same",
      details: `${stats.properties.active} Active • ${stats.properties.pending} Pending`,
    },
    {
      title: "Active Bookings",
      value: stats.bookings.total,
      change: stats.bookings.change,
      icon: Calendar,
      color: "bg-green-500",
      trend: stats.bookings.occupancyRate >= 70 ? "up" : "same" as "up" | "down" | "same",
      details: `${stats.bookings.confirmed} Confirmed • ${stats.bookings.pending} Pending`,
    },
    {
      title: "Monthly Revenue",
      value: stats.revenue.current,
      change: stats.revenue.changeText,
      icon: DollarSign,
      color: "bg-emerald-500",
      trend: stats.revenue.change >= 0 ? "up" : "down" as "up" | "down" | "same",
      details: `${formatCurrency(stats.revenue.collected)} collected`,
    },
    {
      title: "Pending Inquiries",
      value: stats.inquiries.total,
      change: stats.inquiries.change,
      icon: Inbox,
      color: "bg-orange-500",
      trend: "same" as "up" | "down" | "same",
      details: `Avg response: ${stats.inquiries.avgResponseTime}h`,
    },
    {
      title: "Average Rating",
      value: stats.rating.average,
      change: stats.rating.changeText,
      icon: Star,
      color: "bg-yellow-500",
      trend: stats.rating.change > 0 ? "up" : stats.rating.change < 0 ? "down" : "same" as "up" | "down" | "same",
      details: `${stats.rating.total} reviews`,
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversion.rate}%`,
      change: stats.conversion.changeText,
      icon: Percent,
      color: "bg-purple-500",
      trend: stats.conversion.change > 0 ? "up" : stats.conversion.change < 0 ? "down" : "same" as "up" | "down" | "same",
      details: "Inquiry to booking",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      {enhancedOwnerStats.map((stat) => {
        const Icon = stat.icon;

        const trendStyles =
          stat.trend === "up"
            ? "text-green-600 bg-green-50"
            : stat.trend === "down"
            ? "text-red-600 bg-red-50"
            : "text-gray-600 bg-gray-100";

        const trendIcon =
          stat.trend === "up" ? "↗" : stat.trend === "down" ? "↘" : "→";

        return (
          <div
            key={stat.title}
            className="bg-white rounded-[5px] p-3 border shadow-sm hover:shadow-md transition"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-2.5 rounded-xl`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              <span
                className={`text-xs font-semibold px-1 py-1 rounded-[5px] ml-1 ${trendStyles}`}
              >
                {trendIcon} {stat.change}
              </span>
            </div>

            {/* Content */}
            <div className="mt-5">
              <p className="text-sm text-gray-500 font-medium">
                {stat.title}
              </p>

              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stat.title.includes("Revenue")
                  ? formatCurrency(Number(stat.value))
                  : stat.value}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {stat.details}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
