"use client";

import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const stats = [
  {
    title: "Total Revenue",
    value: 245000,
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
    detail: "This month",
  },
  {
    title: "Net Income",
    value: 189500,
    change: "+8%",
    trend: "up",
    icon: TrendingUp,
    color: "bg-blue-100 text-blue-600",
    detail: "After expenses",
  },
  {
    title: "Pending Payouts",
    value: 75800,
    change: "+3 pending",
    trend: "up",
    icon: Wallet,
    color: "bg-orange-100 text-orange-600",
    detail: "Next payout: Jan 15",
  },
  {
    title: "Avg. Daily Revenue",
    value: 8200,
    change: "+5%",
    trend: "up",
    icon: Banknote,
    color: "bg-purple-100 text-purple-600",
    detail: "Last 30 days",
  },
  {
    title: "Occupancy Revenue",
    value: 185000,
    change: "+15%",
    trend: "up",
    icon: CreditCard,
    color: "bg-indigo-100 text-indigo-600",
    detail: "From bookings",
  },
  {
    title: "Expenses",
    value: 55500,
    change: "-2%",
    trend: "down",
    icon: TrendingDown,
    color: "bg-red-100 text-red-600",
    detail: "Maintenance & fees",
  },
];

export default function FinanceStats() {
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
                {formatCurrency(stat.value)}
              </p>
              <p className="text-xs text-gray-500">{stat.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}