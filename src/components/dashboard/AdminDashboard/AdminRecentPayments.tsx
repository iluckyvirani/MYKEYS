"use client";

import { Card } from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

interface RecentPayment {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: "completed" | "pending" | "failed" | "refunded";
  description: string;
}

const recentPayments: RecentPayment[] = [
  {
    id: "1",
    transactionId: "TXN-2024-0001",
    userId: "USR-123",
    userName: "Rajesh Kumar",
    amount: 15000,
    paymentMethod: "Razorpay",
    date: "2024-02-25",
    status: "completed",
    description: "Booking Payment - Sunset Villa",
  },
  {
    id: "2",
    transactionId: "TXN-2024-0002",
    userId: "USR-124",
    userName: "Priya Singh",
    amount: 22500,
    paymentMethod: "Credit Card",
    date: "2024-02-24",
    status: "completed",
    description: "Booking Payment - Beach House",
  },
  {
    id: "3",
    transactionId: "TXN-2024-0003",
    userId: "USR-125",
    userName: "Vikram Nair",
    amount: 18000,
    paymentMethod: "Razorpay",
    date: "2024-02-23",
    status: "pending",
    description: "Booking Payment - Mountain Retreat",
  },
  {
    id: "4",
    transactionId: "TXN-2024-0004",
    userId: "USR-126",
    userName: "Anita Patel",
    amount: 12000,
    paymentMethod: "UPI",
    date: "2024-02-22",
    status: "completed",
    description: "Booking Payment - Lake View Cottage",
  },
  {
    id: "5",
    transactionId: "TXN-2024-0005",
    userId: "USR-127",
    userName: "Neha Desai",
    amount: 8500,
    paymentMethod: "Credit Card",
    date: "2024-02-21",
    status: "failed",
    description: "Booking Payment - City Apartment",
  },
];

export default function AdminRecentPayments() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "refunded":
        return <XCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
        <Link href="/admin/dashboard/payments" className="text-sm text-green-600 hover:text-green-700 font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {recentPayments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-[5px] hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-linear-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{payment.userName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{payment.transactionId}</p>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {payment.paymentMethod}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{payment.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(payment.status)}
                <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
