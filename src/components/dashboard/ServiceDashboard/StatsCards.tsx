"use client";

import { BarChart3, Calendar, DollarSign, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatsCards() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      label: "Active Bookings",
      value: "...",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      label: "Total Earnings",
      value: "...",
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      label: "Avg Rating",
      value: "...",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      label: "Completed Tasks",
      value: "...",
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/service/dashboard/stats");
        const data = res.data?.data;
        if (data) {
          setStats([
            {
              icon: <Calendar className="w-6 h-6 text-blue-600" />,
              label: "Active Bookings",
              value: String(data.activeBookings),
              trend: `+${data.completedThisWeek} this week`,
              trendPositive: true,
            },
            {
              icon: <DollarSign className="w-6 h-6 text-green-600" />,
              label: "Total Earnings",
              value: `£${data.totalEarnings.toLocaleString()}`,
              trend: `£${data.thisMonthEarnings.toLocaleString()} this month`,
              trendPositive: true,
            },
            {
              icon: <Star className="w-6 h-6 text-yellow-600" />,
              label: "Avg Rating",
              value: `${data.avgRating.toFixed(1)}/5`,
              trend: `From ${data.totalReviews} reviews`,
              trendPositive: true,
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
              label: "Completed Tasks",
              value: String(data.completedTasks),
              trend: `+${data.completedThisWeek} this week`,
              trendPositive: true,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">{stat.icon}</div>
          </div>
          <h3 className="text-sm text-gray-600 mb-1">{stat.label}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
          {stat.trend && (
            <p
              className={`text-xs ${
                stat.trendPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
