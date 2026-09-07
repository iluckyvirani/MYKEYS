"use client";

import { useState } from "react";
import type { ServicePaymentSummary as Summary } from "@/lib/services/serviceCheckoutFees";

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n || 0);
}

export default function ServicePaymentSummary({
  summary,
  defaultOpen = true,
}: {
  summary: Summary;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const extraLabel = summary.extraLabel || "Additional fee";
  const feeParts = [
    summary.tax > 0 ? `Tax ${gbp(summary.tax)}` : null,
    summary.bookingFee > 0 ? `Booking fee ${gbp(summary.bookingFee)}` : null,
    summary.extraAmount > 0 ? `${extraLabel} ${gbp(summary.extraAmount)}` : null,
  ].filter(Boolean);

  if (!open) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-800">Amount to pay</p>
          <p className="text-lg font-bold text-gray-900">{gbp(summary.amountToPay)}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 ml-auto block text-sm text-gray-700 underline decoration-dashed underline-offset-4 cursor-pointer"
        >
          View breakup
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Payment summary</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          Hide
        </button>
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-700">Item total</span>
          <span className="text-gray-900 tabular-nums">{gbp(summary.basePrice)}</span>
        </div>
        {summary.slotSurcharge > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-700">
              {summary.slotLabel || "Slot"} extra
            </span>
            <span className="text-gray-900 tabular-nums">
              {gbp(summary.slotSurcharge)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <span
            className="text-gray-700 underline decoration-dashed underline-offset-4 decoration-gray-400"
            title={
              feeParts.length
                ? feeParts.join(" · ")
                : "No extra tax or platform fee"
            }
          >
            Taxes and Fee
          </span>
          <span className="text-gray-900 tabular-nums">{gbp(summary.taxesAndFee)}</span>
        </div>
        {summary.tip > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-700">Tip for professional</span>
            <span className="text-gray-900 tabular-nums">{gbp(summary.tip)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-gray-200 pt-3 space-y-2.5">
        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-900">
          <span>Total amount</span>
          <span className="tabular-nums">{gbp(summary.amountToPay)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-900">
          <span>Amount to pay</span>
          <span className="tabular-nums">{gbp(summary.amountToPay)}</span>
        </div>
      </div>
    </div>
  );
}
