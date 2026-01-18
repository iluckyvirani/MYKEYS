"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { CreditCard, Filter, Download, TrendingUp, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaymentTabs from "@/components/dashboard/UserDashboard/PaymentTabs";

export default function PaymentsPage() {
  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">
              Manage payments, invoices, and payment methods
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Statements
            </Button>
            <Button>
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-green-600 text-sm font-medium">Current</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹45,500</div>
          <div className="text-sm text-gray-600">Upcoming Payments</div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-blue-600 text-sm font-medium">This Month</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">₹1,25,000</div>
          <div className="text-sm text-gray-600">Total Paid</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-red-600 text-sm font-medium">Attention</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">1</div>
          <div className="text-sm text-gray-600">Overdue Payments</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 mb-8 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search payments by property or transaction ID..."
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <select className="border rounded-lg px-4 py-2 text-sm w-full md:w-auto">
              <option>All Transactions</option>
              <option>Upcoming</option>
              <option>Completed</option>
              <option>Failed</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Tabs Content */}
      <PaymentTabs />
    </DashboardLayout>
  );
}