"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminStatsCards from "@/components/dashboard/AdminDashboard/AdminStatsCards";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Building } from "lucide-react";

export default function AdminDashboard() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your platform.</p>
        </div>

        {/* Stats Cards */}
        <AdminStatsCards />

        {/* Charts and Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Platform Overview</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Growth</span>
                <span className="text-sm font-semibold text-green-600">+12.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">234</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">68%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" />
                Manage Users
              </button>
              <button className="w-full bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
                <Building className="w-4 h-4" />
                Review Properties
              </button>
              <button className="w-full bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Approve Documents
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "New property listing", user: "Owner: Rajesh Kumar", time: "2 hours ago" },
              { action: "User verification completed", user: "User: Priya Singh", time: "4 hours ago" },
              { action: "Payment processed", user: "Booking ID: #1234", time: "6 hours ago" },
              { action: "Service category added", user: "Admin action", time: "1 day ago" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.user}</p>
                </div>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

import { FileCheck } from "lucide-react";
