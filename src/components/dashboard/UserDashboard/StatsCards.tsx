"use client";

import { Calendar, MessageSquare, Heart, CreditCard } from "lucide-react";
import { userStats } from "@/lib/constants/dashboard";

export default function StatsCards() {
  const icons = {
    calendar: Calendar,
    "message-square": MessageSquare,
    heart: Heart,
    "credit-card": CreditCard,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {userStats.map((stat) => {
        const Icon = icons[stat.icon as keyof typeof icons];
        return (
          <div
            key={stat.title}
            className="bg-white rounded-[5px] p-5 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}