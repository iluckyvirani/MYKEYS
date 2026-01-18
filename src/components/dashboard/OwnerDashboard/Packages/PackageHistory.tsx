"use client";

import { Calendar, CreditCard, Download, Receipt, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const packageHistory = [
  {
    id: "INV001",
    package: "Professional Plan",
    amount: 4999,
    date: "2024-01-01",
    status: "completed",
    paymentMethod: "Credit Card",
    invoice: "INV-2024-001",
    duration: "Monthly",
    properties: "5/10",
    nextBilling: "2024-02-01",
  },
  {
    id: "INV002",
    package: "Basic Plan",
    amount: 1999,
    date: "2023-12-01",
    status: "completed",
    paymentMethod: "UPI",
    invoice: "INV-2023-012",
    duration: "Monthly",
    properties: "3/3",
    nextBilling: "2024-01-01",
  },
  {
    id: "INV003",
    package: "Basic Plan",
    amount: 1999,
    date: "2023-11-01",
    status: "completed",
    paymentMethod: "UPI",
    invoice: "INV-2023-011",
    duration: "Monthly",
    properties: "2/3",
    nextBilling: "2023-12-01",
  },
  {
    id: "INV004",
    package: "Featured Upgrade",
    amount: 2000,
    date: "2024-01-15",
    status: "completed",
    paymentMethod: "Credit Card",
    invoice: "INV-2024-002",
    duration: "One-time",
    properties: "2 featured",
    nextBilling: null,
  },
  {
    id: "INV005",
    package: "Professional Plan",
    amount: 44991,
    date: "2023-12-15",
    status: "refunded",
    paymentMethod: "Credit Card",
    invoice: "INV-2023-013",
    duration: "Yearly",
    properties: "8/10",
    nextBilling: null,
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return { color: "bg-green-100 text-green-800", icon: CheckCircle };
    case "pending":
      return { color: "bg-yellow-100 text-yellow-800", icon: Clock };
    case "refunded":
      return { color: "bg-purple-100 text-purple-800", icon: Receipt };
    case "failed":
      return { color: "bg-red-100 text-red-800", icon: XCircle };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: Clock };
  }
};

export default function PackageHistory() {
  const [filter, setFilter] = useState("all");

  const filteredHistory = packageHistory.filter(item => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  const downloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice: ${invoiceId}`);
  };

  const totalSpent = packageHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Package History</h3>
          <p className="text-sm text-gray-500 mt-1">
            Track your subscription and payment history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(totalSpent)}
          </div>
          <div className="text-xs text-gray-500">All time</div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-sm text-gray-600">Active Subscriptions</div>
          <div className="text-xl font-bold text-gray-900">2</div>
          <div className="text-xs text-gray-500">Current plans</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="text-sm text-gray-600">Invoices</div>
          <div className="text-xl font-bold text-gray-900">{packageHistory.length}</div>
          <div className="text-xs text-gray-500">Generated</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "completed", "pending", "refunded"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1.5 text-sm rounded-[5px] border ${
              filter === filterType
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {filterType === "all" && "All"}
            {filterType === "completed" && "Completed"}
            {filterType === "pending" && "Pending"}
            {filterType === "refunded" && "Refunded"}
          </button>
        ))}
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Package</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Invoice</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;

              return (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.package}</div>
                      <div className="text-sm text-gray-500">{item.duration} • {item.properties}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    {item.nextBilling && (
                      <div className="text-xs text-gray-500 mt-1">
                        Next: {new Date(item.nextBilling).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-gray-900">{formatCurrency(item.amount)}</div>
                    <div className="text-sm text-gray-500">{item.paymentMethod}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium">{item.invoice}</div>
                  </td>
                  <td className="py-4 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadInvoice(item.invoice)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* No History */}
      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No payment history found</p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredHistory.length} of {packageHistory.length} transactions
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button>
              <Receipt className="w-4 h-4 mr-2" />
              View All Invoices
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}