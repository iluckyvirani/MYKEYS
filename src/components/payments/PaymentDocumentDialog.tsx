"use client";

import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PaymentDocumentData = {
  id: string;
  title: string;
  propertyTitle?: string | null;
  city?: string | null;
  amount: number;
  currency?: string;
  status: string;
  paymentMethod?: string | null;
  bookingId?: string | null;
  transactionId?: string | null;
  stripePaymentIntentId?: string | null;
  createdAt: string;
  checkIn?: string | null;
  checkOut?: string | null;
};

function formatCurrency(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPrintableHtml(
  data: PaymentDocumentData,
  kind: "invoice" | "receipt",
  showStripeIds: boolean
) {
  const heading = kind === "invoice" ? "Invoice" : "Payment Receipt";
  const number = data.bookingId || data.id;
  const location = [data.propertyTitle, data.city].filter(Boolean).join(" · ");
  const method = (data.paymentMethod || "Card").replace(/_/g, " ");
  const stripeRow =
    showStripeIds && data.stripePaymentIntentId
      ? `<tr><td>Stripe Intent</td><td>${escapeHtml(data.stripePaymentIntentId)}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MYKEYS ${heading} ${escapeHtml(number)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
    .brand { color: #0f766e; font-size: 22px; font-weight: 700; }
    h1 { font-size: 24px; margin: 8px 0 24px; }
    .meta, table { width: 100%; border-collapse: collapse; }
    .box { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    td { padding: 8px 0; vertical-align: top; }
    td:first-child { color: #6b7280; width: 180px; }
    .total { font-size: 22px; font-weight: 700; }
    .foot { margin-top: 32px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="brand">MYKEYS</div>
  <h1>${heading}</h1>
  <div class="box">
    <table class="meta">
      <tr><td>Document no.</td><td>${escapeHtml(number)}</td></tr>
      <tr><td>Date</td><td>${escapeHtml(formatDate(data.createdAt))}</td></tr>
      <tr><td>Status</td><td>${escapeHtml(data.status)}</td></tr>
      ${location ? `<tr><td>Property</td><td>${escapeHtml(location)}</td></tr>` : ""}
      ${data.checkIn ? `<tr><td>Stay</td><td>${escapeHtml(formatDate(data.checkIn))} → ${escapeHtml(formatDate(data.checkOut))}</td></tr>` : ""}
    </table>
  </div>
  <table>
    <tr><td>Description</td><td>${escapeHtml(data.title)}</td></tr>
    <tr><td>Payment method</td><td>${escapeHtml(method)}</td></tr>
    ${data.bookingId ? `<tr><td>Booking ID</td><td>${escapeHtml(data.bookingId)}</td></tr>` : ""}
    ${data.transactionId ? `<tr><td>Transaction ID</td><td>${escapeHtml(data.transactionId)}</td></tr>` : ""}
    ${stripeRow}
    <tr><td>Amount</td><td class="total">${escapeHtml(formatCurrency(data.amount, data.currency))}</td></tr>
  </table>
  <p class="foot">Thank you for using MYKEYS. This ${kind} is generated from your payment record.</p>
</body>
</html>`;
}

function openPrintWindow(html: string) {
  const popup = window.open("", "_blank", "width=800,height=900");
  if (!popup) return false;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  setTimeout(() => popup.print(), 250);
  return true;
}

function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadPaymentReceipt(
  data: PaymentDocumentData,
  showStripeIds = false
) {
  const html = buildPrintableHtml(data, "receipt", showStripeIds);
  const slug = data.bookingId || data.id;
  downloadHtml(html, `MYKEYS-receipt-${slug}.html`);
  openPrintWindow(html);
}

export function PaymentDocumentDialog({
  open,
  onOpenChange,
  data,
  showStripeIds = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PaymentDocumentData | null;
  showStripeIds?: boolean;
}) {
  if (!data) return null;

  const location = [data.propertyTitle, data.city].filter(Boolean).join(" · ");
  const method = (data.paymentMethod || "Card").replace(/_/g, " ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-700" />
            Invoice
          </DialogTitle>
          <DialogDescription>
            MYKEYS payment invoice for this booking
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-teal-800">MYKEYS</p>
              <p className="text-sm text-gray-500">Property booking invoice</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
              <p className="font-semibold text-gray-900">{data.status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Invoice date</p>
              <p className="font-medium">{formatDate(data.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Document no.</p>
              <p className="font-medium break-all">{data.bookingId || data.id}</p>
            </div>
          </div>

          {location && (
            <div className="text-sm">
              <p className="text-gray-500">Property</p>
              <p className="font-medium">{location}</p>
            </div>
          )}

          {(data.checkIn || data.checkOut) && (
            <div className="text-sm">
              <p className="text-gray-500">Stay</p>
              <p className="font-medium">
                {formatDate(data.checkIn)} → {formatDate(data.checkOut)}
              </p>
            </div>
          )}

          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{data.title}</span>
              <span className="font-medium">
                {formatCurrency(data.amount, data.currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Payment method</span>
              <span>{method}</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t">
              <span>Total</span>
              <span>{formatCurrency(data.amount, data.currency)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1 break-all">
            {data.bookingId && <p>Booking ID: {data.bookingId}</p>}
            {data.transactionId && <p>Transaction ID: {data.transactionId}</p>}
            {showStripeIds && data.stripePaymentIntentId && (
              <p>Stripe Intent: {data.stripePaymentIntentId}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-[5px]"
            onClick={() =>
              openPrintWindow(buildPrintableHtml(data, "invoice", showStripeIds))
            }
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            type="button"
            className="rounded-[5px] bg-teal-700 hover:bg-teal-800"
            onClick={() => downloadPaymentReceipt(data, showStripeIds)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
