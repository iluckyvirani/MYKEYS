"use client";

import { FileText, Download, Eye, TrendingUp, Calendar, BarChart3 } from "lucide-react";

const stats = [
  {
    title: "Total Reports",
    value: "24",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
    detail: "Generated this month",
  },
  {
    title: "Downloads",
    value: "156",
    icon: Download,
    color: "bg-green-100 text-green-600",
    detail: "All time downloads",
  },
  {
    title: "Most Viewed",
    value: "Monthly Performance",
    icon: Eye,
    color: "bg-purple-100 text-purple-600",
    detail: "Viewed 42 times",
  },
  {
    title: "Avg. Generation Time",
    value: "12s",
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600",
    detail: "Faster than last month",
  },
];

export default function ReportsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-xl font-bold text-gray-900">
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