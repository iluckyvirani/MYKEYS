// app/service/dashboard/page.tsx - Service Dashboard Main Page
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatsCards from "@/components/dashboard/ServiceDashboard/StatsCards";
import RecentBookings from "@/components/dashboard/ServiceDashboard/RecentBookings";
import ServiceRequests from "@/components/dashboard/ServiceDashboard/ServiceRequests";
import EarningsChart from "@/components/dashboard/ServiceDashboard/EarningsChart";
import ReviewsCard from "@/components/dashboard/ServiceDashboard/ReviewsCard";
import QuickActions from "@/components/dashboard/ServiceDashboard/QuickActions";
import { useEffect, useState } from "react";

export default function ServiceDashboardPage() {
  const [serviceName, setServiceName] = useState("Service Professional");

  useEffect(() => {
    // Get service name from localStorage
    const userDataStr = localStorage.getItem("user");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        const firstName = userData.data?.firstName || "Service Professional";
        setServiceName(firstName);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  return (
    <DashboardLayout defaultRole="service">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {serviceName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your service performance overview and recent bookings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <StatsCards />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Main Dashboard Grid */}
      <div className="space-y-6">
        {/* Top Row - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentBookings />
          <ServiceRequests />
        </div>

        {/* Earnings Chart - Full Width */}
        <EarningsChart />

        {/* Reviews - Full Width */}
        <ReviewsCard />
      </div>
    </DashboardLayout>
  );
}
