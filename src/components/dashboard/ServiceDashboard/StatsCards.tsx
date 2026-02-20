"use client";

import { BarChart3, Calendar, DollarSign, Star } from "lucide-react";

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatsCards() {
  const stats: StatCard[] = [
    {
      icon: <Calendar className="w-6 h-6 text-blue-600" />,
      label: "Active Bookings",
      value: "12",
      trend: "+2 this week",
      trendPositive: true,
    },
    {
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      label: "Total Earnings",
      value: "₹45,230",
      trend: "+15% this month",
      trendPositive: true,
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      label: "Avg Rating",
      value: "4.8/5",
      trend: "From 120 reviews",
      trendPositive: true,
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      label: "Completed Tasks",
      value: "156",
      trend: "+8 this week",
      trendPositive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
