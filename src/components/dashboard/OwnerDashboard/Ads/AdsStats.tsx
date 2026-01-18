"use client";

import { Eye, TrendingUp, Users, DollarSign, Target, TextCursor } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const stats = [
  {
    title: "Total Impressions",
    value: "124.5K",
    change: "+18%",
    trend: "up",
    icon: Eye,
    color: "bg-blue-100 text-blue-600",
    detail: "Last 30 days",
  },
  {
    title: "Click-through Rate",
    value: "4.8%",
    change: "+0.5%",
    trend: "up",
    icon: TextCursor,
    color: "bg-green-100 text-green-600",
    detail: "Industry avg: 3.2%",
  },
  {
    title: "Total Clicks",
    value: "5,980",
    change: "+22%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
    detail: "From all campaigns",
  },
  {
    title: "Conversion Rate",
    value: "12.5%",
    change: "+1.2%",
    trend: "up",
    icon: Target,
    color: "bg-orange-100 text-orange-600",
    detail: "Clicks to bookings",
  },
  {
    title: "Cost per Click",
    value: "₹42.50",
    change: "-₹3.20",
    trend: "down",
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-600",
    detail: "Avg across platforms",
  },
  {
    title: "New Leads",
    value: "148",
    change: "+32",
    trend: "up",
    icon: Users,
    color: "bg-pink-100 text-pink-600",
    detail: "From ads this month",
  },
];

export default function AdsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
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
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                stat.trend === "up" 
                  ? "bg-green-50 text-green-700" 
                  : "bg-red-50 text-red-700"
              }`}>
                {stat.change}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}