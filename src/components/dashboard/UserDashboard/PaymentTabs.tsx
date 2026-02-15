// components/dashboard/UserDashboard/PaymentTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import PaymentList from "./PaymentList";

interface Payment {
  id: string;
  bookingId?: string;
  packageId?: string;
  propertyTitle?: string;
  paymentType: "BOOKING" | "PACKAGE";
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL";
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  reference?: string;
  reason?: string;
}

export default function PaymentTabs() {
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/payments?limit=100");

        if (response.data?.success && response.data.data?.items) {
          // Filter only BOOKING type payments (excluding PACKAGE payments for owners)
          const bookingPayments = response.data.data.items.filter(
            (p: Payment) => p.paymentType === "BOOKING"
          );
          setAllPayments(bookingPayments);
          setError(null);
        } else {
          setError("Failed to load payments");
        }
      } catch (err: any) {
        console.error("Error fetching payments:", err);
        setError(err.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Categorize payments by status
  const pendingPayments = allPayments.filter((p) => p.status === "PENDING");
  const paidPayments = allPayments.filter((p) => p.status === "PAID");
  const failedPayments = allPayments.filter((p) => p.status === "FAILED");
  const refundedPayments = allPayments.filter((p) => p.status === "REFUNDED");

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading your payments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[5px] border p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading payments</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border">
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6 py-6">
          <TabsTrigger
            value="pending"
            className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]"
          >
            <Clock className="w-4 h-4" />
            Pending
            <span className="ml-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
              {pendingPayments.length}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="paid"
            className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]"
          >
            <CheckCircle className="w-4 h-4" />
            Completed
            <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
              {paidPayments.length}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="failed"
            className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]"
          >
            <XCircle className="w-4 h-4" />
            Failed
            <span className="ml-1 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
              {failedPayments.length}
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="refunded"
            className="flex items-center gap-2 py-5 cursor-pointer rounded-[5px]"
          >
            <RefreshCw className="w-4 h-4" />
            Refunded
            <span className="ml-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
              {refundedPayments.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="p-6">
          <TabsContent value="pending" className="m-0">
            <PaymentList
              payments={pendingPayments}
              type="pending"
              emptyMessage="No pending payments"
            />
          </TabsContent>

          <TabsContent value="paid" className="m-0">
            <PaymentList
              payments={paidPayments}
              type="paid"
              emptyMessage="No completed payments"
            />
          </TabsContent>

          <TabsContent value="failed" className="m-0">
            <PaymentList
              payments={failedPayments}
              type="failed"
              emptyMessage="No failed payments"
            />
          </TabsContent>

          <TabsContent value="refunded" className="m-0">
            <PaymentList
              payments={refundedPayments}
              type="refunded"
              emptyMessage="No refunded payments"
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}