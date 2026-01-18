// components/dashboard/UserDashboard/UpcomingPayments.tsx
"use client";

import { Calendar, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";

const mockPayments = [
  {
    id: "PMT001",
    type: "Security Deposit",
    property: "Seaside Villa, Goa",
    amount: 15000,
    dueDate: "2024-01-12",
    status: "due_soon", // due_today, due_soon, overdue, scheduled
    paymentMethod: "Credit Card ****1234",
    canPayEarly: true,
    autoPay: false,
  },
  {
    id: "PMT002",
    type: "Monthly Rent",
    property: "Urban Apartment, Mumbai",
    amount: 30000,
    dueDate: "2024-01-05",
    status: "due_today",
    paymentMethod: "UPI (Google Pay)",
    canPayEarly: false,
    autoPay: true,
  },
  {
    id: "PMT003",
    type: "Maintenance Charges",
    property: "Urban Apartment, Mumbai",
    amount: 2500,
    dueDate: "2024-01-10",
    status: "due_soon",
    paymentMethod: "Bank Transfer",
    canPayEarly: true,
    autoPay: false,
  },
  {
    id: "PMT004",
    type: "Extension Payment",
    property: "Mountain View Cottage",
    amount: 12000,
    dueDate: "2024-01-03",
    status: "overdue",
    paymentMethod: "Credit Card ****5678",
    canPayEarly: false,
    autoPay: false,
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "due_today":
      return {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: AlertCircle,
        label: "Due Today",
      };
    case "due_soon":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Calendar,
        label: "Due Soon",
      };
    case "overdue":
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: AlertCircle,
        label: "Overdue",
      };
    case "scheduled":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Auto-pay Scheduled",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Calendar,
        label: "Pending",
      };
  }
};

export default function UpcomingPayments() {
  const [payments] = useState(mockPayments);

  const totalDue = payments.reduce((sum, payment) => {
    if (payment.status !== "scheduled") {
      return sum + payment.amount;
    }
    return sum;
  }, 0);

  const formatDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `in ${diffDays} days`;
  };

  return (
    <div className="bg-white rounded-[5px] shadow-sm border p-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Payments</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">
              Total due:{" "}
              <span className="font-bold text-gray-900">
                {formatCurrency(totalDue)}
              </span>
            </p>
            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
              {payments.filter(p => p.status === "overdue").length} overdue
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => {
          const statusConfig = getStatusConfig(payment.status);
          const StatusIcon = statusConfig.icon;
          const daysLeft = formatDaysLeft(payment.dueDate);

          return (
            <div
              key={payment.id}
              className={`p-4 rounded-lg border ${statusConfig.color} border-l-4 ${payment.status === 'overdue' ? 'border-l-red-500' : payment.status === 'due_today' ? 'border-l-orange-500' : 'border-l-blue-500'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{payment.type}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig.label}
                      </span>
                      {payment.autoPay && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Auto-pay
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{payment.property}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(payment.dueDate)} ({daysLeft})
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xl text-gray-900">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {payment.status === "overdue" && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        Pay Now
                      </Button>
                    )}
                    {payment.status === "due_today" && (
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                        Pay Today
                      </Button>
                    )}
                    {payment.canPayEarly && payment.status === "due_soon" && (
                      <Button size="sm" variant="outline">
                        Pay Early
                      </Button>
                    )}
                    {!payment.autoPay && payment.status !== "overdue" && payment.status !== "due_today" && (
                      <Button size="sm" variant="ghost">
                        Schedule
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span>Late payments may incur penalties</span>
          </div>
          <Button variant="outline" size="sm">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Payment Methods
          </Button>
        </div>
      </div>
    </div>
  );
}