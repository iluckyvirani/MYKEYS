"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Users, Loader2 } from "lucide-react";
import { DatePickerInput } from "@/components/property/DatePickerInput";
import { StripePaymentModal } from "@/components/StripePaymentModal";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { BlockedDateRange } from "@/lib/bookings/bookingAvailability";

interface PropertyShortStayBookingProps {
  propertyId: string;
  propertyTitle: string;
  pricePerNight: number;
  cleaningFee?: number;
  serviceFee?: number;
  maxGuests?: number;
  minStay?: number;
  maxStay?: number | null;
  blockedRanges?: BlockedDateRange[];
}

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn + "T00:00:00");
  const b = new Date(checkOut + "T00:00:00");
  const diff = Math.round((b.getTime() - a.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

export default function PropertyShortStayBooking({
  propertyId,
  propertyTitle,
  pricePerNight,
  cleaningFee = 0,
  serviceFee = 0,
  maxGuests = 2,
  minStay = 1,
  maxStay = null,
  blockedRanges = [],
}: PropertyShortStayBookingProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [bookingTotal, setBookingTotal] = useState(0);

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * pricePerNight;
  const total = subtotal + (cleaningFee || 0) + (serviceFee || 0);

  const stayHint = useMemo(() => {
    const parts = [`Min ${minStay} night${minStay === 1 ? "" : "s"}`];
    if (maxStay) parts.push(`max ${maxStay}`);
    return parts.join(" · ");
  }, [minStay, maxStay]);

  const handleBook = async () => {
    setError("");
    if (!localStorage.getItem("accessToken")) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates");
      return;
    }
    if (nights < minStay) {
      setError(`Minimum stay is ${minStay} night${minStay === 1 ? "" : "s"}`);
      return;
    }
    if (maxStay && nights > maxStay) {
      setError(`Maximum stay is ${maxStay} nights`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/bookings", {
        propertyId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        specialRequests: specialRequests.trim() || undefined,
      });
      if (res.data?.success && res.data.data) {
        const booking = res.data.data;
        setBookingId(booking.id);
        setBookingTotal(booking.totalAmount ?? total);
        setPaymentOpen(true);
      } else {
        setError(res.data?.message || "Could not create booking");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Booking failed. Please check dates and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-[4px] p-5 shadow-sm border border-gray-200 space-y-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-extrabold text-[#0f172a]">
              {formatCurrency(pricePerNight)}
            </span>
            <span className="text-[14px] text-gray-500 font-medium">/ night</span>
          </div>
          <p className="text-[12px] text-gray-500 mt-1">{stayHint}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <DatePickerInput
            label="Check-in"
            value={checkIn}
            onChange={(v) => {
              setCheckIn(v);
              if (checkOut && nightsBetween(v, checkOut) <= 0) setCheckOut("");
            }}
            rangeStart={checkIn}
            rangeEnd={checkOut}
            blockedRanges={blockedRanges}
            pickerMode="check-in"
          />
          <DatePickerInput
            label="Check-out"
            value={checkOut}
            onChange={setCheckOut}
            minDate={checkIn || undefined}
            rangeStart={checkIn}
            rangeEnd={checkOut}
            blockedRanges={blockedRanges}
            pickerMode="check-out"
          />
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
            className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm outline-none focus:border-[#339390] cursor-pointer"
          >
            {Array.from({ length: Math.max(maxGuests, 1) }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n} guest{n === 1 ? "" : "s"}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">
            Special requests (optional)
          </label>
          <textarea
            rows={2}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Early check-in, extra towels…"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#339390]"
          />
        </div>

        {nights > 0 && (
          <div className="space-y-2 text-[13px] border-t border-gray-100 pt-3">
            <div className="flex justify-between text-gray-700">
              <span>
                {formatCurrency(pricePerNight)} × {nights} night
                {nights === 1 ? "" : "s"}
              </span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {cleaningFee > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Cleaning fee</span>
                <span>{formatCurrency(cleaningFee)}</span>
              </div>
            )}
            {serviceFee > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Service fee</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-[#0f172a] text-[15px] pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={loading}
          className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-[15px] py-3 px-4 rounded-[6px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Booking…
            </>
          ) : (
            <>
              <CalendarDays className="w-4 h-4" />
              Reserve
            </>
          )}
        </button>

        <p className="text-[11px] text-gray-500 text-center">
          You won&apos;t be charged until you complete payment
        </p>
      </div>

      <StripePaymentModal
        isOpen={paymentOpen}
        bookingId={bookingId}
        amount={bookingTotal}
        propertyTitle={propertyTitle}
        onClose={() => setPaymentOpen(false)}
        onPaymentSuccess={() => {
          setPaymentOpen(false);
          router.push("/user/dashboard/bookings");
        }}
      />
    </>
  );
}
