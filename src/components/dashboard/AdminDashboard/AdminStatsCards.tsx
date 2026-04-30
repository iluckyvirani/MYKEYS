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
        const response = await api.get("/admin/stats");
        if (response.data?.success && response.data?.data) {
          const apiStats = response.data.data;
          setStats({
            totalUsers: apiStats.summary?.totalUsers || 0,
            totalOwners: apiStats.summary?.totalOwners || 0,
            totalServiceProviders: apiStats.summary?.totalServiceProviders || 0,
            totalProperties: apiStats.summary?.totalProperties || 0,
            totalBookings: apiStats.bookings?.total || 0,
            activeBookings: apiStats.bookings?.pending || 0,
            totalInquiries: apiStats.inquiries?.total || 0,
            totalRevenue: apiStats.payments?.totalRevenue || 0,
            pendingDocuments: 0, // Not available in stats API
            approvedListings: apiStats.summary?.activeProperties || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback to empty stats on error
        setStats({
          totalUsers: 0,
          totalOwners: 0,
          totalServiceProviders: 0,
          totalProperties: 0,
          totalBookings: 0,
          activeBookings: 0,
          totalInquiries: 0,
          totalRevenue: 0,
          pendingDocuments: 0,
          approvedListings: 0,
        });
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
      value: `£${(stats.totalRevenue / 100000).toFixed(1)}L`,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {adminStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-[5px] p-4 shadow-sm border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              {/* <p className="text-xs text-gray-500 mt-1">{stat.change}</p> */}
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
