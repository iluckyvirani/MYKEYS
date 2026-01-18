"use client";

import { Calendar, Wallet, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const payouts = [
  {
    id: "PAY001",
    date: "2024-01-15",
    amount: 189500,
    status: "upcoming",
    type: "monthly",
    properties: ["Seaside Villa", "Urban Apartment"],
    processed: false,
  },
  {
    id: "PAY002",
    date: "2023-12-15",
    amount: 175000,
    status: "completed",
    type: "monthly",
    properties: ["Seaside Villa", "Urban Apartment", "Mountain Cottage"],
    processed: true,
  },
  {
    id: "PAY003",
    date: "2023-11-15",
    amount: 158000,
    status: "completed",
    type: "monthly",
    properties: ["Seaside Villa", "Urban Apartment"],
    processed: true,
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Completed",
      };
    case "upcoming":
      return {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        label: "Upcoming",
      };
    case "failed":
      return {
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        label: "Failed",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800",
        icon: Clock,
        label: "Pending",
      };
  }
};

export default function PayoutsOverview() {
  const upcomingPayout = payouts.find(p => p.status === "upcoming");
  const totalProcessed = payouts
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payouts Overview</h3>
          <p className="text-sm text-gray-500 mt-1">
            Monthly payouts and payment history
          </p>
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          <Wallet className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Next Payout Card */}
      {upcomingPayout && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[5px] p-5 border border-blue-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">Next Payout</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Monthly
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatCurrency(upcomingPayout.amount)}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Scheduled for {new Date(upcomingPayout.date).toLocaleDateString('en-IN', { 
              day: 'numeric',
              month: 'long'
            })}
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            View Payout Details
          </Button>
        </div>
      )}

      {/* Payout History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Payout History</h4>
          <span className="text-sm text-gray-500">
            Total: {formatCurrency(totalProcessed)}
          </span>
        </div>
        
        {payouts.map((payout) => {
          const statusConfig = getStatusConfig(payout.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={payout.id}
              className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <span className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className="font-bold text-gray-900">
                  {formatCurrency(payout.amount)}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {new Date(payout.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              
              <div className="text-xs text-gray-500">
                {payout.properties.length} propert{payout.properties.length === 1 ? 'y' : 'ies'}
                {payout.processed && " • Processed"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payout Settings */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Payout Settings</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payout Frequency</span>
            <span className="font-medium">Monthly (15th)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium">Bank Transfer</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Minimum Balance</span>
            <span className="font-medium">₹10,000</span>
          </div>
          <Button variant="outline" className="w-full mt-2">
            Edit Payout Settings
          </Button>
        </div>
      </div>
    </div>
  );
}