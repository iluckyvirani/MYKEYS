"use client";

import { Calendar, MessageSquare, Heart, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface DashboardStats {
  activeBookings: number;
  totalInquiries: number;
  favoriteProperties: number;
  upcomingPayments: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard/stats");

        if (response.data?.success && response.data.data) {
          setStats(response.data.data);
          setError(null);
        } else {
          setError("Failed to load stats");
        }
      } catch (err: any) {
        console.error("Error fetching stats:", err);
        setError(null); // Don't show error, use fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fallback data if API fails
  const displayStats = stats || {
    activeBookings: 0,
    totalInquiries: 0,
    favoriteProperties: 0,
    upcomingPayments: 0,
  };

  const userStats = [
    {
      title: "Active Bookings",
      value: displayStats.activeBookings,
      change: "Current bookings",
      icon: "calendar",
      color: "bg-blue-500",
    },
    {
      title: "Total Inquiries",
      value: displayStats.totalInquiries,
      change: "Pending responses",
      icon: "message-square",
      color: "bg-green-500",
    },
    {
      title: "Favorite Properties",
      value: displayStats.favoriteProperties,
      change: "Saved properties",
      icon: "heart",
      color: "bg-pink-500",
    },
    {
      title: "Upcoming Payments",
      value: displayStats.upcomingPayments > 0 ? `₹${displayStats.upcomingPayments.toLocaleString('en-IN')}` : "₹0",
      change: "Due soon",
      icon: "credit-card",
      color: "bg-purple-500",
    },
  ];

  const icons = {
    calendar: Calendar,
    "message-square": MessageSquare,
    heart: Heart,
    "credit-card": CreditCard,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[5px] p-5 shadow-sm border animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

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