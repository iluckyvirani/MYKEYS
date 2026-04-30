"use client";

import { Calendar, CreditCard, CheckCircle, XCircle, Clock, Package, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  package?: {
    id: string;
    name: string;
    tier: string;
  };
}

export default function PackageHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch payments related to packages only
        const response = await api.get("/payments?limit=50");
        const allPayments = response.data?.data?.items || [];

        // Filter for package payments only (those with package relation)
        const packagePayments = allPayments.filter((p: any) => 
          p.packageId || (p.metadata && p.metadata.type === "package")
        );

        setPayments(packagePayments);
      } catch (err: any) {
        console.error("Error fetching package history:", err);
        setError(err.response?.data?.error || "Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Completed" };
      case "PENDING":
        return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" };
      case "REFUNDED":
        return { color: "bg-purple-100 text-purple-800", icon: Package, label: "Refunded" };
      case "FAILED":
        return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Failed" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock, label: status };
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-green-600 mb-4" />
        <p className="text-gray-600">Loading payment history...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-gray-900 font-semibold mb-2">Failed to load history</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
        <p className="text-gray-600 text-sm mt-1">
          Your package subscription and payment transactions
        </p>
      </div>

      {payments.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-900 font-semibold mb-2">No Payment History</p>
          <p className="text-gray-600 text-sm">
            Your package payment history will appear here.
          </p>
        </Card>
      ) : (
        <Card className="divide-y">
          {payments.map((payment) => {
            const statusConfig = getStatusConfig(payment.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={payment.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Package className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {payment.package?.name || "Package Subscription"}
                          </h3>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Transaction ID: <span className="font-mono">{payment.id.substring(0, 16)}...</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm ml-14">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-medium text-gray-900">{formatDate(payment.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Payment Method</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {payment.paymentMethod.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      {payment.package && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Tier</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {payment.package.tier}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right md:ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}