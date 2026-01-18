// components/dashboard/UserDashboard/PaymentList.tsx
"use client";

import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  property: string;
  type: string;
  dueDate?: string;
  date?: string;
  amount: number;
  status: string;
  paymentMethod: string;
  canPayEarly?: boolean;
  reference?: string;
  retryDate?: string;
  reason?: string;
  refundDate?: string;
}

interface PaymentListProps {
  payments: Payment[];
  type: 'upcoming' | 'completed' | 'failed' | 'refunded';
  emptyMessage: string;
}

export default function PaymentList({ payments, type, emptyMessage }: PaymentListProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'due_today':
        return { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Due Today' };
      case 'due_soon':
        return { color: 'bg-blue-100 text-blue-800', icon: Calendar, label: 'Due Soon' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' };
      case 'refunded':
        return { color: 'bg-purple-100 text-purple-800', icon: RefreshCw, label: 'Refunded' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Calendar, label: status };
    }
  };

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

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">All your payments are up to date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const statusConfig = getStatusConfig(payment.status);
        const StatusIcon = statusConfig.icon;
        const daysLeft = payment.dueDate ? formatDaysLeft(payment.dueDate) : null;

        return (
          <div
            key={payment.id}
            className="p-6 border rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Payment Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{payment.property}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        {payment.type}
                      </div>
                      {payment.dueDate && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Due: {formatDate(payment.dueDate)} ({daysLeft})
                        </div>
                      )}
                      {payment.date && (
                        <div className="text-sm text-gray-600">
                          Paid: {formatDate(payment.date)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4 inline mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="font-bold text-xl">{formatCurrency(payment.amount)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Payment Method</div>
                    <div className="font-medium">{payment.paymentMethod}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      {type === 'completed' ? 'Reference' : 
                       type === 'failed' ? 'Retry Date' : 
                       type === 'refunded' ? 'Refund Date' : 'Status'}
                    </div>
                    <div className="font-medium">
                      {payment.reference || 
                       (payment.retryDate && formatDate(payment.retryDate)) ||
                       (payment.refundDate && formatDate(payment.refundDate)) ||
                       'Active'}
                    </div>
                  </div>
                </div>

                {/* Failure Reason */}
                {payment.reason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-red-800">Failure Reason:</div>
                    <div className="text-sm text-red-700">{payment.reason}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="lg:w-64">
                <div className="space-y-3">
                  {type === 'upcoming' && payment.canPayEarly && (
                    <Button className="w-full">
                      Pay Now
                    </Button>
                  )}
                  {type === 'upcoming' && payment.status === 'due_today' && (
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">
                      Pay Today
                    </Button>
                  )}
                  {type === 'failed' && (
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Retry Payment
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    View Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}