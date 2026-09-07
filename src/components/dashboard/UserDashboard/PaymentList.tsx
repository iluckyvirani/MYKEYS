// components/dashboard/UserDashboard/PaymentList.tsx
"use client";

import { useState } from "react";
import { CreditCard, Calendar, CheckCircle, XCircle, RefreshCw, MapPin, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PaymentDocumentDialog,
  downloadPaymentReceipt,
  type PaymentDocumentData,
} from "@/components/payments/PaymentDocumentDialog";

interface Payment {
  id: string;
  bookingId?: string;
  packageId?: string;
  propertyTitle?: string;
  paymentType: "BOOKING" | "PACKAGE";
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL";
  paymentMethod?: string;
  transactionId?: string | null;
  stripePaymentIntentId?: string | null;
  booking?: {
    id: string;
    checkIn: string;
    checkOut: string;
    property?: { id: string; title: string; city: string; state: string } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  reference?: string;
  reason?: string;
}

interface PaymentListProps {
  payments: Payment[];
  type: "pending" | "paid" | "failed" | "refunded";
  emptyMessage: string;
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
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return { color: "bg-yellow-100 text-yellow-800", icon: Calendar, label: "Pending" };
    case "PAID":
      return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Paid" };
    case "FAILED":
      return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Failed" };
    case "REFUNDED":
      return { color: "bg-purple-100 text-purple-800", icon: RefreshCw, label: "Refunded" };
    case "PARTIAL":
      return { color: "bg-orange-100 text-orange-800", icon: Calendar, label: "Partial" };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: Calendar, label: status };
  }
};

const getPaymentTypeLabel = (type: string) => {
  switch (type?.toUpperCase()) {
    case "BOOKING":
      return "Booking Payment";
    default:
      return "Payment";
  }
};

function toDocumentData(payment: Payment): PaymentDocumentData {
  return {
    id: payment.id,
    title: getPaymentTypeLabel(payment.paymentType),
    propertyTitle: payment.booking?.property?.title ?? payment.propertyTitle,
    city: payment.booking?.property?.city,
    amount: payment.amount,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    bookingId: payment.bookingId || payment.booking?.id,
    transactionId: payment.transactionId,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    createdAt: payment.createdAt,
    checkIn: payment.booking?.checkIn,
    checkOut: payment.booking?.checkOut,
  };
}

export default function PaymentList({ payments, type, emptyMessage }: PaymentListProps) {
  const [invoice, setInvoice] = useState<PaymentDocumentData | null>(null);

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Check back later for your payment history</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => {
        const statusConfig = getStatusConfig(payment.status);
        const StatusIcon = statusConfig.icon;

        return (
          <div
            key={payment.id}
            className="p-6 border rounded-[5px] hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Payment Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getPaymentTypeLabel(payment.paymentType)}
                    </h3>
                    {/* Property title */}
                    {(payment.booking?.property?.title || payment.propertyTitle) && (
                      <div className="flex items-center gap-1 text-sm text-gray-700 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{payment.booking?.property?.title ?? payment.propertyTitle}</span>
                        {payment.booking?.property?.city && (
                          <span className="text-gray-400">· {payment.booking.property.city}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        {payment.id}
                      </div>
                      {payment.createdAt && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(payment.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} flex items-center gap-2`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-[5px]">
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="font-bold text-xl">{formatCurrency(payment.amount)}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-[5px]">
                    <div className="text-sm text-gray-600">Payment Method</div>
                    <div className="font-medium">
                      {payment.paymentMethod || "Not specified"}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-[5px]">
                    <div className="text-sm text-gray-600">
                      {type === "paid" ? "Reference" : type === "failed" ? "Failure Reason" : "Status"}
                    </div>
                    <div className="font-medium">
                      {payment.reference || payment.reason || "—"}
                    </div>
                  </div>
                </div>

                {/* Transaction / Stripe details */}
                <div className="mt-3 bg-gray-50 rounded-[5px] p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600">
                  {payment.bookingId && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Booking ID:</span>
                      <span className="font-mono truncate" title={payment.bookingId}>{payment.bookingId}</span>
                    </div>
                  )}
                  {payment.transactionId && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Transaction ID:</span>
                      <span className="font-mono truncate" title={payment.transactionId}>{payment.transactionId}</span>
                    </div>
                  )}
                  {payment.booking?.checkIn && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Check-in:</span>
                      <span>{formatDate(payment.booking.checkIn)}</span>
                      {payment.booking.checkOut && <><span className="text-gray-300">→</span><span>{formatDate(payment.booking.checkOut)}</span></>}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="lg:w-64">
                <div className="space-y-3">
                  {type === "failed" && (
                    <Button className="w-full bg-red-600 hover:bg-red-700 rounded-[5px]">
                      Retry Payment
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-[5px]"
                    onClick={() => setInvoice(toDocumentData(payment))}
                  >
                    View Invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-[5px]"
                    onClick={() => downloadPaymentReceipt(toDocumentData(payment), false)}
                  >
                    Download Receipt
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <PaymentDocumentDialog
        open={Boolean(invoice)}
        onOpenChange={(open) => {
          if (!open) setInvoice(null);
        }}
        data={invoice}
        showStripeIds={false}
      />
    </div>
  );
}