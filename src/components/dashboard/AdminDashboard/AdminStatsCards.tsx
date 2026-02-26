"use client";

import { Users, Building, Calendar, MessageSquare, CreditCard, Shield, Package, FileCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalServiceProviders: number;
  totalProperties: number;
  totalBookings: number;
  activeBookings: number;
  totalInquiries: number;
  totalRevenue: number;
  pendingDocuments: number;
  approvedListings: number;
}

export default function AdminStatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an actual API endpoint
        // For now, we'll use dummy data
        setStats({
          totalUsers: 1250,
          totalOwners: 320,
          totalServiceProviders: 85,
          totalProperties: 450,
          totalBookings: 2340,
          activeBookings: 156,
          totalInquiries: 580,
          totalRevenue: 125000,
          pendingDocuments: 34,
          approvedListings: 312,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const adminStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Owners",
      value: stats.totalOwners.toLocaleString(),
      icon: Shield,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Service Providers",
      value: stats.totalServiceProviders.toLocaleString(),
      icon: Package,
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Properties",
      value: stats.totalProperties.toLocaleString(),
      icon: Building,
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: Calendar,
      color: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings.toLocaleString(),
      icon: Calendar,
      color: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Revenue",
      value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`,
      icon: CreditCard,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments.toLocaleString(),
      icon: FileCheck,
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {adminStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
