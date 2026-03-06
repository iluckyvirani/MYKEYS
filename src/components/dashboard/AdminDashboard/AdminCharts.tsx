"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Stats {
  summary: {
    totalUsers: number;
    totalOwners: number;
    totalServiceProviders: number;
    totalProperties: number;
    activeProperties: number;
    conversionRate: string;
    occupancyRate: string;
  };
  bookings: {
    total: number;
    completed: number;
    pending: number;
    completionRate: string;
  };
  payments: {
    total: number;
    paid: number;
    failed: number;
    totalRevenue: number;
    successRate: string;
  };
}

export default function AdminCharts() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/stats");
        
        if (response.data?.success && response.data?.data) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">Failed to load statistics</div>;
  }

  const bookingCompletionRate = parseFloat(stats.bookings.completionRate);
  const paymentSuccessRate = parseFloat(stats.payments.successRate);
  const occupancyRate = parseFloat(stats.summary.occupancyRate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Total Revenue</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Success Rate</span>
            <span className="text-sm font-semibold text-green-600">{stats.payments.successRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full"
              style={{ width: `${paymentSuccessRate}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">₹{(stats.payments.totalRevenue / 100000).toFixed(2)}L</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Paid</p>
              <p className="text-lg font-bold text-gray-900">{stats.payments.paid}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Failed</p>
              <p className="text-lg font-bold text-red-600">{stats.payments.failed}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Trends */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Booking Stats</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completion Rate</span>
            <span className="text-sm font-semibold text-blue-600">{stats.bookings.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
              style={{ width: `${bookingCompletionRate}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-600">Total Bookings</p>
              <p className="text-lg font-bold text-gray-900">{stats.bookings.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-lg font-bold text-gray-900">{stats.bookings.completed}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-lg font-bold text-orange-600">{stats.bookings.pending}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Platform Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Platform Overview</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Total Users</span>
            <span className="text-sm font-semibold text-gray-900">{stats.summary.totalUsers}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Properties Listed</span>
            <span className="text-sm font-semibold text-gray-900">{stats.summary.totalProperties}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Active Properties</span>
            <span className="text-sm font-semibold text-green-600">{stats.summary.activeProperties}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Occupancy Rate</span>
            <span className="text-sm font-semibold text-orange-600">{stats.summary.occupancyRate}</span>
          </div>
        </div>
      </Card>

      {/* User Growth */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Total Owners</span>
            <span className="text-sm font-semibold text-gray-900">{stats.summary.totalOwners}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Regular Users</span>
            <span className="text-sm font-semibold text-gray-900">{stats.summary.totalUsers - stats.summary.totalOwners - stats.summary.totalServiceProviders}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Service Providers</span>
            <span className="text-sm font-semibold text-gray-900">{stats.summary.totalServiceProviders}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Conversion Rate</span>
            <span className="text-sm font-semibold text-green-600">{stats.summary.conversionRate}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
