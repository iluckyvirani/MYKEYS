"use client";

import { Eye, Edit, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  transactionId: string;
  paidBy: string;
  amount: number;
  method: string;
  date: string;
  status: "completed" | "pending" | "failed";
  type: string;
}

interface AdminPaymentListProps {
  payments: Payment[];
  loading?: boolean;
  empty?: boolean;
  onEdit?: (id: string) => void;
  onView?: (payment: Payment) => void;
}

export function AdminPaymentList({
  payments,
  loading = false,
  empty = false,
  onEdit,
  onView,
}: AdminPaymentListProps) {
  const getStatusIcon = (status: "completed" | "pending" | "failed") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: "completed" | "pending" | "failed") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading payments...</div>;
  }

  if (empty || payments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No payments found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[5px] border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Transaction ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Paid By
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Type
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Amount
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Method
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Date
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                {payment.transactionId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{payment.paidBy}</td>
              <td className="px-6 py-4 text-sm">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {payment.type}
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                ₹{payment.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{payment.date}</td>
              <td className="px-6 py-4 text-sm">
                <Badge className={getStatusColor(payment.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </div>
                </Badge>
              </td>
              <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onView?.(payment)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onEdit?.(payment.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
