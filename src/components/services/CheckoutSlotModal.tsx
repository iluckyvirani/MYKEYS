"use client";

import { useMemo, useState } from "react";
import { CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SLOT_META,
  formatSlotTime,
  getSlotSurcharge,
  type SlotPeriod,
  type ServiceSlotPricing,
} from "@/lib/services/serviceCheckoutFees";

export type CheckoutSlot = {
  date: string;
  time: string;
  period: SlotPeriod;
};

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n || 0);
}

function nextDays(count = 7) {
  const days: { iso: string; day: string; date: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    days.push({
      iso,
      day:
        i === 0
          ? "Today"
          : d.toLocaleDateString("en-GB", { weekday: "short" }),
      date: String(d.getDate()).padStart(2, "0"),
    });
  }
  return days;
}

export default function CheckoutSlotModal({
  open,
  service,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  service: ServiceSlotPricing;
  initial?: CheckoutSlot | null;
  onClose: () => void;
  onSave: (slot: CheckoutSlot) => void;
}) {
  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(initial?.date || days[0].iso);
  const [period, setPeriod] = useState<SlotPeriod>(initial?.period || "morning");
  const [time, setTime] = useState(initial?.time || "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border p-1.5 text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 pr-8">
          When should the professional arrive?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Service duration depends on the job. Pick a start slot.
        </p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => setDate(d.iso)}
              className={`min-w-[68px] rounded-xl border px-3 py-2 text-center cursor-pointer ${
                date === d.iso
                  ? "border-green-600 bg-green-50 text-green-900"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <p className="text-xs">{d.day}</p>
              <p className="text-lg font-semibold">{d.date}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-600 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Online payment only for selected date
        </div>

        <div className="mt-4 flex gap-2">
          {(Object.keys(SLOT_META) as SlotPeriod[]).map((key) => {
            const extra = getSlotSurcharge(service, key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPeriod(key);
                  setTime("");
                }}
                className={`flex-1 rounded-xl border px-2 py-2 text-sm cursor-pointer ${
                  period === key
                    ? "border-green-600 bg-green-50 text-green-900"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <p className="font-medium">{SLOT_META[key].label}</p>
                {extra > 0 && (
                  <p className="text-[11px] text-amber-700 font-semibold">
                    +{gbp(extra)} extra
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-sm font-medium text-gray-800 mt-4 mb-2">
          Select start time of service
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SLOT_META[period].times.map((slotTime) => {
            const extra = getSlotSurcharge(service, period);
            return (
              <button
                key={slotTime}
                type="button"
                onClick={() => setTime(slotTime)}
                className={`rounded-xl border px-2 py-2.5 text-sm cursor-pointer ${
                  time === slotTime
                    ? "border-green-600 bg-green-50 text-green-900"
                    : "border-gray-200 text-gray-800"
                }`}
              >
                <span>{formatSlotTime(slotTime)}</span>
                {extra > 0 && (
                  <span className="block text-[10px] font-semibold text-amber-700">
                    +{gbp(extra)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          disabled={!date || !time}
          onClick={() => onSave({ date, time, period })}
          className="mt-5 w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white cursor-pointer"
        >
          Proceed to checkout
        </Button>
      </div>
    </div>
  );
}
