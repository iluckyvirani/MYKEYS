"use client";

import { TrendingUp, Users, DollarSign, Target, Star, Clock, Home, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const stats = [
  {
    title: "Total Revenue",
    value: 245000,
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
    detail: "This month",
  },
  {
    title: "Occupancy Rate",
    value: 85,
    change: "+3.2%",
    trend: "up",
    icon: Home,
    color: "bg-blue-100 text-blue-600",
    detail: "Industry avg: 72%",
  },
  {
    title: "Avg Daily Rate",
    value: 8200,
    change: "+5.8%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-600",
    detail: "Per property",
  },
  {
    title: "Guest Satisfaction",
    value: 4.8,
    change: "+0.2",
    trend: "up",
    icon: Star,
    color: "bg-yellow-100 text-yellow-600",
    detail: "124 reviews",
  },
  {
    title: "Repeat Guests",
    value: 42,
    change: "+8",
    trend: "up",
    icon: Users,
    color: "bg-pink-100 text-pink-600",
    detail: "Loyal customers",
  },
  {
    title: "Avg Response Time",
    value: "2.4h",
    change: "-0.5h",
    trend: "down",
    icon: Clock,
    color: "bg-orange-100 text-orange-600",
    detail: "To inquiries",
  },
];

export default function AnalyticsStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                  ? "bg-green-50 text-green-700 flex items-center gap-1" 
                  : "bg-red-50 text-red-700 flex items-center gap-1"
              }`}>
                {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof stat.value === 'number' && stat.title.includes('Revenue') 
                  ? formatCurrency(stat.value)
                  : typeof stat.value === 'number' && stat.title.includes('Rate')
                  ? `£${stat.value.toLocaleString()}`
                  : stat.value}
                {stat.title.includes('Rate') && !stat.title.includes('Daily') && '%'}
              </p>
              <p className="text-xs text-gray-500">{stat.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}