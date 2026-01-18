// components/dashboard/OwnerDashboard/OwnerStatsCards.tsx
"use client";

import { Building, Calendar, DollarSign, Inbox, TrendingUp, Users, Star, Percent } from "lucide-react";
import { ownerStats } from "@/lib/constants/dashboard";
import { formatCurrency } from "@/lib/utils";

const enhancedOwnerStats = [
  {
    title: "Total Properties",
    value: 5,
    change: "+1 this month",
    icon: Building,
    color: "bg-indigo-500",
    trend: "up",
    details: "3 Active • 2 Pending",
  },
  {
    title: "Active Bookings",
    value: 8,
    change: "85% occupancy",
    icon: Calendar,
    color: "bg-green-500",
    trend: "up",
    details: "6 Confirmed • 2 Pending",
  },
  {
    title: "Monthly Revenue",
    value: 245000,
    change: "+12% from last month",
    icon: DollarSign,
    color: "bg-emerald-500",
    trend: "up",
    details: "₹2,12,000 collected",
  },
  {
    title: "Pending Inquiries",
    value: 15,
    change: "3 high priority",
    icon: Inbox,
    color: "bg-orange-500",
    trend: "same",
    details: "Avg response: 4h",
  },
  {
    title: "Average Rating",
    value: 4.8,
    change: "+0.2 this month",
    icon: Star,
    color: "bg-yellow-500",
    trend: "up",
    details: "124 reviews",
  },
  {
    title: "Conversion Rate",
    value: "42%",
    change: "+5% from last month",
    icon: Percent,
    color: "bg-purple-500",
    trend: "up",
    details: "Inquiry to booking",
  },
];

export default function OwnerStatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {enhancedOwnerStats.map((stat) => {
        const Icon = stat.icon;
        const trendColor = stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600";
        const trendIcon = stat.trend === "up" ? "↗" : stat.trend === "down" ? "↘" : "→";

        return (
          <div
            key={stat.title}
            className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} p-2.5 rounded-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-sm font-medium ${trendColor}`}>
                {trendIcon} {stat.change}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">
                {stat.title.includes("Revenue") ? formatCurrency(Number(stat.value)) : stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-2">{stat.details}</p>
            </div>

            {/* Hover effect line */}
            <div className="mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-xs text-gray-500">View details →</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}