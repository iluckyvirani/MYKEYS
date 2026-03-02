"use client";

import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AdminCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Revenue</h2>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Revenue Growth</span>
            <span className="text-sm font-semibold text-green-600">+18.5%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-linear-to-r from-green-600 to-emerald-500 h-2 rounded-full"
              style={{ width: "82%" }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-600">This Month</p>
              <p className="text-lg font-bold text-gray-900">₹2.5L</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Last Month</p>
              <p className="text-lg font-bold text-gray-900">₹2.1L</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Increase</p>
              <p className="text-lg font-bold text-green-600">₹40K</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Trends */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Booking Trends</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Booking Rate</span>
            <span className="text-sm font-semibold text-blue-600">+12.3%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-linear-to-r from-blue-600 to-cyan-500 h-2 rounded-full"
              style={{ width: "68%" }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-600">Total Bookings</p>
              <p className="text-lg font-bold text-gray-900">2,340</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-lg font-bold text-gray-900">1,856</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-lg font-bold text-orange-600">234</p>
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
            <span className="text-sm font-semibold text-gray-900">1,250</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Properties Listed</span>
            <span className="text-sm font-semibold text-gray-900">450</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Active Properties</span>
            <span className="text-sm font-semibold text-green-600">312</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending Approval</span>
            <span className="text-sm font-semibold text-orange-600">138</span>
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
            <span className="text-sm font-semibold text-gray-900">320</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Regular Users</span>
            <span className="text-sm font-semibold text-gray-900">845</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b">
            <span className="text-sm text-gray-600">Service Providers</span>
            <span className="text-sm font-semibold text-gray-900">85</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">This Month Growth</span>
            <span className="text-sm font-semibold text-green-600">+85 users</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
