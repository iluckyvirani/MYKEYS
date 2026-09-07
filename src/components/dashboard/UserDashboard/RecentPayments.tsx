"use client";

import { CreditCard, Calendar, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface RecentPayment {
  id: string;
  paymentType: "BOOKING" | "PACKAGE";
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL";
  paymentMethod?: string;
  createdAt: string;
  reference?: string;
  bookingId?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
    });
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default function RecentPayments() {
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/payments?limit=5");

        if (response.data?.success && response.data.data?.items) {
          // Filter only PAID and REFUNDED booking payments, sorted by most recent
          const recentPayments = (response.data.data.items || [])
            .filter((p: RecentPayment) => {
              return (
                p.paymentType === "BOOKING" &&
                (p.status === "PAID" || p.status === "REFUNDED")
              );
            })
            .slice(0, 5);

          setPayments(recentPayments);
          setError(null);
        } else {
          setPayments([]);
        }
      } catch (err: any) {
        console.error("Error fetching payments:", err);
        setError(err.message || "Failed to fetch payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPayments();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Recent Payments</h3>
            <p className="text-xs text-gray-600">Your booking payments</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-[5px]">
          <Link href="/dashboard/payments">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No recent payments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-[5px] hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white rounded-lg border">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Booking Payment
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(payment.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount)}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
