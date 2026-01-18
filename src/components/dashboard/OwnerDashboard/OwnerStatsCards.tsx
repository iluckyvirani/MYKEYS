"use client";

import {
  Building,
  Calendar,
  DollarSign,
  Inbox,
  Star,
  Percent,
} from "lucide-react";
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
