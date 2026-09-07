"use client";

import { Card } from "@/components/ui/card";
import { CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

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

export default function AdminRecentPayments() {
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/payments?pageSize=5&sortBy=createdAt&sortOrder=desc");
        if (response.data?.success && response.data?.data?.items?.payments) {
          const payments = response.data.data.items.payments.map((payment: any) => {
            // Map API status to component status
            let status: "completed" | "pending" | "failed" | "refunded" = "pending";
            if (payment.status === "PAID") status = "completed";
            else if (payment.status === "FAILED") status = "failed";
            else if (payment.status === "REFUNDED") status = "refunded";
            
            return {
              id: payment.id,
              transactionId: payment.transactionId || "N/A",
              userId: payment.userId || "",
              userName: payment.userName || "Unknown User",
              amount: payment.amount || 0,
              paymentMethod: payment.paymentMethod || "Unknown",
              date: payment.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
              status,
              description: payment.propertyTitle ? `Booking Payment - ${payment.propertyTitle}` : (payment.description || "Payment"),
            };
          });
          setRecentPayments(payments);
        }
      } catch (err) {
        console.error("Error fetching recent payments:", err);
        setRecentPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPayments();
  }, []);

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
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-[5px] animate-pulse">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))
        ) : recentPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No payments found</div>
        ) : (
        recentPayments.map((payment) => (
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
                <p className="text-sm font-semibold text-gray-900">£{payment.amount.toLocaleString()}</p>
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
        ))
        )}
      </div>
    </Card>
  );
}
