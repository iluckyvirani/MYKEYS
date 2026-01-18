"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FinanceStats from "@/components/dashboard/OwnerDashboard/Finance/FinanceStats";
import FinancialReports from "@/components/dashboard/OwnerDashboard/Finance/FinancialReports";
import PayoutsOverview from "@/components/dashboard/OwnerDashboard/Finance/PayoutsOverview";
import RevenueChart from "@/components/dashboard/OwnerDashboard/Finance/RevenueChart";
import TaxSummary from "@/components/dashboard/OwnerDashboard/Finance/TaxSummary";
import TransactionList from "@/components/dashboard/OwnerDashboard/Finance/TransactionList";


export default function OwnerFinancePage() {
  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track revenue, manage transactions, and monitor financial performance
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Financial Period: Jan 1, 2024 - Jan 31, 2024
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <FinanceStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <RevenueChart />
          
          {/* Transactions List */}
          <TransactionList />
          
          {/* Financial Reports */}
          <FinancialReports />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payouts Overview */}
          <PayoutsOverview />
          
          {/* Tax Summary */}
          <TaxSummary />
        </div>
      </div>
    </DashboardLayout>
  );
}