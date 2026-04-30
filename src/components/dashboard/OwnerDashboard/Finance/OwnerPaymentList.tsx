"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Calendar, CreditCard, MapPin, TrendingUp, Loader2, AlertCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL";
  paymentMethod: string;
  paymentType: "BOOKING" | "PACKAGE";
  createdAt: string;
  booking?: {
    id: string;
    property: {
      id: string;
      name: string;
      city: string;
      state: string;
    };
    user: {
      name: string;
      email: string;
    };
  };
  package?: {
    id: string;
    name: string;
  };
}

interface OwnerPaymentListProps {
  searchQuery?: string;
  filters?: {
    paymentMethod?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
  };
}

export default function OwnerPaymentList({ searchQuery = "", filters }: OwnerPaymentListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        params.append("limit", "100");
        
        if (filters?.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
        if (filters?.fromDate) params.append("fromDate", filters.fromDate);
        if (filters?.toDate) params.append("toDate", filters.toDate);
        if (filters?.sortBy) {
          params.append("sortBy", "createdAt");
          params.append("sortOrder", filters.sortBy === "oldest" ? "asc" : "desc");
        }

        const res = await api.get(`/payments?${params.toString()}`);
        const fetchedPayments = res.data?.data?.items || [];
        setPayments(fetchedPayments);
      } catch (err: any) {
        console.error("Error fetching payments:", err);
        setError(err.response?.data?.error || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filters]);

  // Filter payments by search query and active tab
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !searchQuery ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.booking?.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      payment.status.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  // Count payments by status
  const statusCounts = {
    all: payments.length,
    pending: payments.filter((p) => p.status === "PENDING").length,
    paid: payments.filter((p) => p.status === "PAID").length,
    failed: payments.filter((p) => p.status === "FAILED").length,
    refunded: payments.filter((p) => p.status === "REFUNDED").length,
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[5px] border p-12 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[5px] border p-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-gray-900 font-semibold mb-2">Failed to load payments</p>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-5 pt-5">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{statusCounts.all}</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{statusCounts.pending}</span>
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center gap-2">
              Paid
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{statusCounts.paid}</span>
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              Failed
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{statusCounts.failed}</span>
            </TabsTrigger>
            <TabsTrigger value="refunded" className="flex items-center gap-2">
              Refunded
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{statusCounts.refunded}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="p-5 space-y-3 m-0 min-h-100">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-900 font-semibold mb-2">No payments found</p>
              <p className="text-gray-600 text-sm">
                {searchQuery ? "Try adjusting your search query" : "Payments will appear here once received"}
              </p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {payment.paymentType === "BOOKING" ? "Booking Payment" : "Package Payment"}
                          </h3>
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Transaction ID: <span className="font-mono">{payment.razorpayPaymentId || payment.id.substring(0, 16)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {payment.paymentType === "BOOKING" && payment.booking ? (
                        <>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{payment.booking.property.name}</p>
                              <p className="text-gray-600 text-xs">
                                {payment.booking.property.city}, {payment.booking.property.state}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                              <p className="text-gray-600 text-xs">Payment date</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{payment.paymentMethod}</p>
                              <p className="text-gray-600 text-xs">Payment method</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start gap-2">
                            <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{payment.package?.name || "Package Purchase"}</p>
                              <p className="text-gray-600 text-xs">Package</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                              <p className="text-gray-600 text-xs">Payment date</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900 capitalize">{payment.paymentMethod}</p>
                              <p className="text-gray-600 text-xs">Payment method</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Customer Info for bookings */}
                    {payment.paymentType === "BOOKING" && payment.booking && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Customer:</span> {payment.booking.user.name} ({payment.booking.user.email})
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
