"use client";

import { 
  CreditCard, 
  Banknote, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical,
  Filter,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const transactions = [
  {
    id: "TXN001",
    date: "2024-01-10",
    description: "Booking Payment - Seaside Villa",
    type: "credit",
    category: "booking",
    amount: 323500,
    method: "credit_card",
    status: "completed",
    property: "Seaside Villa",
    guest: "Rajesh Kumar",
  },
  {
    id: "TXN002",
    date: "2024-01-08",
    description: "Cleaning Service",
    type: "debit",
    category: "expense",
    amount: 5000,
    method: "bank_transfer",
    status: "completed",
    property: "Seaside Villa",
    vendor: "CleanPro Services",
  },
  {
    id: "TXN003",
    date: "2024-01-05",
    description: "Monthly Mortgage",
    type: "debit",
    category: "expense",
    amount: 75000,
    method: "auto_debit",
    status: "completed",
    property: "All Properties",
    note: "Bank loan EMI",
  },
  {
    id: "TXN004",
    date: "2024-01-04",
    description: "Platform Commission",
    type: "debit",
    category: "commission",
    amount: 12000,
    method: "auto_debit",
    status: "completed",
    property: "Seaside Villa",
    platform: "StayEase",
  },
  {
    id: "TXN005",
    date: "2024-01-02",
    description: "Security Deposit Refund",
    type: "debit",
    category: "refund",
    amount: 90000,
    method: "bank_transfer",
    status: "completed",
    property: "Urban Apartment",
    guest: "Priya Sharma",
  },
  {
    id: "TXN006",
    date: "2024-01-01",
    description: "Advance Payment - Mountain Cottage",
    type: "credit",
    category: "booking",
    amount: 94300,
    method: "upi",
    status: "pending",
    property: "Mountain Cottage",
    guest: "Amit Patel",
  },
];

const getTransactionIcon = (type: string, method: string) => {
  if (type === "credit") return TrendingUp;
  if (method === "credit_card") return CreditCard;
  if (method === "bank_transfer") return Banknote;
  return Wallet;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeColor = (type: string) => {
  return type === "credit" 
    ? "text-green-600" 
    : "text-red-600";
};

export default function TransactionList() {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = transactions.filter(txn => {
    if (filter === "all") return true;
    if (filter === "credit") return txn.type === "credit";
    if (filter === "debit") return txn.type === "debit";
    if (filter === "pending") return txn.status === "pending";
    return true;
  });

  const totalCredits = transactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = transactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-500 mt-1">
            All financial transactions across your properties
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="text-sm text-gray-600">Total Credits</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(totalCredits)}
          </div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="text-sm text-gray-600">Total Debits</div>
          <div className="text-xl font-bold text-red-600">
            {formatCurrency(totalDebits)}
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-sm text-gray-600">Net Flow</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(totalCredits - totalDebits)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "credit", "debit", "pending", "booking", "expense"].map((filterType) => (
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
            {filterType === "credit" && "Credits"}
            {filterType === "debit" && "Debits"}
            {filterType === "pending" && "Pending"}
            {filterType === "booking" && "Bookings"}
            {filterType === "expense" && "Expenses"}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Transaction</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Property</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => {
              const Icon = getTransactionIcon(txn.type, txn.method);
              const amountColor = getTypeColor(txn.type);

              return (
                <tr key={txn.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        txn.type === "credit" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          txn.type === "credit" ? "text-green-600" : "text-red-600"
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{txn.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(txn.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{txn.property}</div>
                    {txn.guest && (
                      <div className="text-sm text-gray-500">{txn.guest}</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      {txn.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`font-bold ${amountColor}`}>
                      {txn.type === "credit" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Reconciled</DropdownMenuItem>
                        <DropdownMenuItem>Report Issue</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
          <Button variant="outline" size="sm">
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
}