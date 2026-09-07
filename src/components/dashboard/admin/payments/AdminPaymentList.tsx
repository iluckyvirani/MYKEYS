"use client";

import { useState } from "react";
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronRight, Hash, User, MapPin, Package, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PaymentDocumentDialog,
  downloadPaymentReceipt,
  type PaymentDocumentData,
} from "@/components/payments/PaymentDocumentDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminPayment {
  id: string;
  transactionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  userId: string;
  userName: string;
  userEmail: string | null;
  // Booking
  bookingId: string | null;
  bookingStatus: string | null;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  propertyId: string | null;
  propertyTitle: string | null;
  propertyCity: string | null;
  guestId: string | null;
  guestName: string | null;
  guestEmail: string | null;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  // Package
  packageId: string | null;
  packageName: string | null;
  subscriptionStatus: string | null;
  // Payment
  amount: number;
  currency: string;
  commissionPercent: number | null;
  commissionAmount: number | null;
  ownerEarnings: number | null;
  status: string;
  paymentMethod: string;
  paymentType: "BOOKING" | "PACKAGE";
  createdAt: string;
  updatedAt: string;
  // Legacy (page still passes these)
  paidBy?: string;
  method?: string;
  date?: string;
  type?: string;
}

interface AdminPaymentListProps {
  payments: AdminPayment[];
  loading?: boolean;
  empty?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    PAID:      { cls: "bg-green-100 text-green-800",  icon: <CheckCircle className="w-3.5 h-3.5" /> },
    completed: { cls: "bg-green-100 text-green-800",  icon: <CheckCircle className="w-3.5 h-3.5" /> },
    PENDING:   { cls: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3.5 h-3.5" /> },
    pending:   { cls: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3.5 h-3.5" /> },
    FAILED:    { cls: "bg-red-100 text-red-800",       icon: <XCircle className="w-3.5 h-3.5" /> },
    failed:    { cls: "bg-red-100 text-red-800",       icon: <XCircle className="w-3.5 h-3.5" /> },
    REFUNDED:  { cls: "bg-orange-100 text-orange-800", icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const cfg = map[status] ?? { cls: "bg-gray-100 text-gray-700", icon: null };
  return (
    <Badge className={`${cfg.cls} flex items-center gap-1 w-fit`}>
      {cfg.icon}
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </Badge>
  );
}

function IdChip({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-1 text-xs">
      <Hash className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className="font-mono break-all text-gray-800" title={value}>{value}</span>
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function toDocumentData(p: AdminPayment): PaymentDocumentData {
  return {
    id: p.id,
    title: p.paymentType === "PACKAGE" ? p.packageName || "Package Payment" : "Booking Payment",
    propertyTitle: p.propertyTitle,
    city: p.propertyCity,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    paymentMethod: p.paymentMethod,
    bookingId: p.bookingId,
    transactionId: p.transactionId,
    stripePaymentIntentId: p.stripePaymentIntentId,
    createdAt: p.createdAt,
    checkIn: p.checkIn,
    checkOut: p.checkOut,
  };
}

function PaymentRow({ p }: { p: AdminPayment }) {
  const [expanded, setExpanded] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const isBooking = p.paymentType === "BOOKING" || !!p.bookingId;

  return (
    <>
      <tr
        className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand toggle */}
        <td className="px-3 py-3 text-gray-400">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </td>

        {/* Date */}
        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
          {fmtDate(p.createdAt ?? p.date ?? "")}
        </td>

        {/* Type */}
        <td className="px-4 py-3 text-sm">
          <Badge variant="secondary" className={isBooking ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
            {isBooking ? "Booking" : "Package"}
          </Badge>
        </td>

        {/* Paid by */}
        <td className="px-4 py-3 text-sm">
          <div className="font-medium text-gray-900">{p.userName ?? p.paidBy}</div>
          {p.userEmail && <div className="text-xs text-gray-500">{p.userEmail}</div>}
        </td>

        {/* Property / Package */}
        <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px]">
          {isBooking ? (
            <div>
              <div className="font-medium truncate">{p.propertyTitle ?? "—"}</div>
              {p.propertyCity && <div className="text-xs text-gray-500">{p.propertyCity}</div>}
            </div>
          ) : (
            <div className="font-medium truncate">{p.packageName ?? "—"}</div>
          )}
        </td>

        {/* Amount */}
        <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">
          {fmt(p.amount, p.currency)}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <StatusBadge status={p.status} />
        </td>

        {/* Transaction ID (truncated) */}
        <td className="px-4 py-3 text-xs font-mono text-gray-500 max-w-[140px]">
          <span className="truncate block" title={p.stripePaymentIntentId ?? p.transactionId ?? p.id}>
            {(p.stripePaymentIntentId ?? p.transactionId ?? p.id).substring(0, 20)}…
          </span>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-blue-50/40 border-b">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

              {/* Column 1 – IDs */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <Hash className="w-4 h-4" /> Transaction IDs
                </p>
                <IdChip label="Payment ID"      value={p.id} />
                <IdChip label="Stripe Intent"   value={p.stripePaymentIntentId} />
                <IdChip label="Stripe Charge"   value={p.stripeChargeId} />
                <IdChip label="Transaction ID"  value={p.transactionId} />
                {isBooking && <IdChip label="Booking ID"  value={p.bookingId} />}
                {!isBooking && <IdChip label="Package ID" value={p.packageId} />}
              </div>

              {/* Column 2 – People */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <User className="w-4 h-4" /> Users
                </p>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Paid by (tenant/owner)</div>
                  <div className="font-medium text-gray-900">{p.userName}</div>
                  <div className="text-xs text-gray-500">{p.userEmail}</div>
                  <IdChip label="User ID" value={p.userId} />
                </div>
                {isBooking && p.guestName && p.guestName !== p.userName && (
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Guest</div>
                    <div className="font-medium text-gray-900">{p.guestName}</div>
                    <div className="text-xs text-gray-500">{p.guestEmail}</div>
                    <IdChip label="Guest ID" value={p.guestId} />
                  </div>
                )}
                {isBooking && p.ownerName && (
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Property Owner</div>
                    <div className="font-medium text-gray-900">{p.ownerName}</div>
                    <div className="text-xs text-gray-500">{p.ownerEmail}</div>
                    <IdChip label="Owner ID" value={p.ownerId} />
                  </div>
                )}
              </div>

              {/* Column 3 – Payment breakdown + Property/Package */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-4 h-4" /> Payment Breakdown
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gross amount</span>
                    <span className="font-semibold">{fmt(p.amount, p.currency)}</span>
                  </div>
                  {p.commissionPercent != null && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform fee ({p.commissionPercent}%)</span>
                        <span className="text-red-600">-{fmt(p.commissionAmount ?? 0, p.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t pt-1 mt-1">
                        <span className="font-semibold text-gray-700">Owner earnings</span>
                        <span className="font-bold text-green-700">{fmt(p.ownerEarnings ?? p.amount, p.currency)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-sm text-gray-500 pt-1">
                    <span>Method</span>
                    <span>{p.paymentMethod?.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Currency</span>
                    <span>{p.currency}</span>
                  </div>
                </div>

                {isBooking && (p.checkIn || p.propertyTitle) && (
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Property
                    </p>
                    {p.propertyTitle && <div className="text-sm font-medium">{p.propertyTitle}</div>}
                    {p.propertyCity && <div className="text-xs text-gray-500">{p.propertyCity}</div>}
                    {p.checkIn && <div className="text-xs text-gray-500">Check-in: {fmtDay(p.checkIn)}</div>}
                    {p.checkOut && <div className="text-xs text-gray-500">Check-out: {fmtDay(p.checkOut)}</div>}
                    {p.nights && <div className="text-xs text-gray-500">{p.nights} night{p.nights !== 1 ? "s" : ""}</div>}
                    {p.bookingStatus && (
                      <div className="text-xs"><span className="text-gray-400">Booking status: </span>{p.bookingStatus}</div>
                    )}
                  </div>
                )}

                {!isBooking && p.packageName && (
                  <div className="pt-2 border-t space-y-1">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <Package className="w-3 h-3" /> Package
                    </p>
                    <div className="text-sm font-medium">{p.packageName}</div>
                    {p.subscriptionStatus && (
                      <div className="text-xs"><span className="text-gray-400">Subscription: </span>{p.subscriptionStatus}</div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[5px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInvoiceOpen(true);
                    }}
                  >
                    View Invoice
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-[5px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPaymentReceipt(toDocumentData(p), true);
                    }}
                  >
                    Download Receipt
                  </Button>
                </div>
              </div>
            </div>
            <PaymentDocumentDialog
              open={invoiceOpen}
              onOpenChange={setInvoiceOpen}
              data={toDocumentData(p)}
              showStripeIds
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminPaymentList({ payments, loading = false, empty = false }: AdminPaymentListProps) {
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-3 w-8" />
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paid By</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Property / Package</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stripe / Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <PaymentRow key={payment.id} p={payment} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t bg-gray-50 text-xs text-gray-500">
        Click any row to expand full transaction details
      </div>
    </div>
  );
}
