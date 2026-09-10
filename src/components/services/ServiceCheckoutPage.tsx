"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Loader2,
  MapPin,
  Mail,
  Wallet,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import ServicePaymentSummary from "@/components/services/ServicePaymentSummary";
import ServiceBookingPaymentModal from "@/components/services/ServiceBookingPaymentModal";
import CheckoutAddressModal, {
  type CheckoutAddress,
} from "@/components/services/CheckoutAddressModal";
import CheckoutSlotModal, {
  type CheckoutSlot,
} from "@/components/services/CheckoutSlotModal";
import {
  computeServicePaymentSummary,
  formatSlotTime,
  getSlotSurcharge,
  SLOT_META,
  type ServiceCheckoutFees,
  type SlotPeriod,
} from "@/lib/services/serviceCheckoutFees";

const TIP_PRESETS = [5, 10, 15];

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n || 0);
}

function formatLocation(address: CheckoutAddress) {
  return [address.houseNumber, address.landmark, address.formattedAddress]
    .filter(Boolean)
    .join(", ");
}

function formatSlotLabel(slot: CheckoutSlot) {
  const d = new Date(`${slot.date}T00:00:00`);
  const day = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  return `${day} · ${formatSlotTime(slot.time)} · ${SLOT_META[slot.period].label}`;
}

export default function ServiceCheckoutPage({
  backHref,
}: {
  backHref: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const serviceId = searchParams.get("serviceId") || "";
  const providerId = searchParams.get("providerId") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [service, setService] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [checkoutFees, setCheckoutFees] = useState<ServiceCheckoutFees>({
    taxPercent: 0,
    bookingFee: 0,
    extraLabel: "",
    extraAmount: 0,
  });

  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [slot, setSlot] = useState<CheckoutSlot | null>(null);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [usingCustomTip, setUsingCustomTip] = useState(false);
  const [avoidCall, setAvoidCall] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [payment, setPayment] = useState<{
    bookingId: string;
    clientSecret: string;
    publishableKey?: string;
    amount: number;
    serviceName: string;
  } | null>(null);

  useEffect(() => {
    if (!serviceId || !providerId) {
      setError("Missing service or provider. Go back and choose a professional.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(
          `/services/marketplace?catalogServiceId=${encodeURIComponent(serviceId)}`
        );
        const data = res.data?.data;
        if (cancelled) return;
        setService(data?.selectedService || null);
        setProvider(
          (data?.providers || []).find((p: { id: string }) => p.id === providerId) ||
            null
        );
        if (data?.checkoutFees) setCheckoutFees(data.checkoutFees);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Failed to load checkout"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId, providerId]);

  const slotSurcharge = getSlotSurcharge(
    service,
    (slot?.period || null) as SlotPeriod | null
  );

  const summary = useMemo(
    () =>
      computeServicePaymentSummary(service?.price ?? 0, checkoutFees, {
        basePrice: service?.price ?? 0,
        slotSurcharge,
        slotPeriod: slot?.period || null,
        tip,
      }),
    [service?.price, checkoutFees, slotSurcharge, slot?.period, tip]
  );

  function applyTip(amount: number) {
    if (!usingCustomTip && tip === amount) {
      setTip(0);
      return;
    }
    setUsingCustomTip(false);
    setCustomTip("");
    setTip(amount);
  }

  function clearTip() {
    setUsingCustomTip(false);
    setCustomTip("");
    setTip(0);
  }

  async function handlePay() {
    if (!service || !provider || !address || !slot) return;
    setBooking(true);
    setError("");
    try {
      const res = await api.post("/services/book", {
        catalogServiceId: service.id,
        providerId: provider.id,
        location: formatLocation(address),
        destinationLat: address.lat,
        destinationLng: address.lng,
        scheduledDate: slot.date,
        scheduledTime: slot.time,
        bookingType: "scheduled",
        slotPeriod: slot.period,
        tipAmount: tip,
        description: [
          avoidCall ? "Avoid calling before reaching the location." : "",
          address.label ? `Address type: ${address.label}` : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
      const data = res.data?.data;
      if (data?.clientSecret && data.amount > 0) {
        setPayment({
          bookingId: data.booking.id,
          clientSecret: data.clientSecret,
          publishableKey: data.publishableKey,
          amount: data.amount,
          serviceName: service.name,
        });
      } else {
        toast({
          title: "Booking confirmed",
          description: "Your service request has been sent to the provider.",
        });
        router.push(backHref);
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Booking failed"
      );
    } finally {
      setBooking(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!service || !provider) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <p className="font-medium text-gray-900">Checkout unavailable</p>
        <p className="text-sm text-gray-500 mt-1">{error || "Select a service and provider again."}</p>
        <Link href={backHref} className="text-green-700 text-sm font-medium mt-4 inline-block">
          Back to services
        </Link>
      </div>
    );
  }

  const providerName = `${provider.user.firstName} ${provider.user.lastName}`.trim();
  const canPay = !!address && !!slot;

  return (
    <div className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white divide-y">
            <div className="px-4 py-3.5 flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Send booking details to</p>
                <p className="font-medium text-gray-900">
                  {user?.email || "Your MYKEYS account"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAddressOpen(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Address</p>
                  {address ? (
                    <>
                      <p className="font-medium text-gray-900">{address.label}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {formatLocation(address)}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium text-green-700">Select address</p>
                  )}
                </div>
              </div>
              <span className="text-sm text-green-700 font-medium shrink-0">
                {address ? "Edit" : "Select"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSlotOpen(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                <Clock className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Slot</p>
                  {slot ? (
                    <>
                      <p className="font-medium text-gray-900">{formatSlotLabel(slot)}</p>
                      {slotSurcharge > 0 && (
                        <p className="text-xs font-semibold text-amber-700 mt-0.5">
                          +{gbp(slotSurcharge)} extra for {SLOT_META[slot.period].label}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">Choose morning, afternoon or evening</p>
                  )}
                </div>
              </div>
              <span className="text-sm text-green-700 font-medium shrink-0">
                {slot ? "Edit" : "Select"}
              </span>
            </button>

            <div className="px-4 py-3.5 flex items-start gap-3">
              <Wallet className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Payment method</p>
                <p className="font-medium text-gray-900">Card via Stripe</p>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          )}

          <Button
            type="button"
            disabled={!canPay || booking}
            onClick={handlePay}
            className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          >
            {booking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
              </>
            ) : (
              `Proceed to pay ${gbp(summary.amountToPay)}`
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our T&C, Privacy and Cancellation Policy.
          </p>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <h3 className="font-semibold text-gray-900">Cancellation policy</h3>
            <p className="text-sm text-gray-600 mt-1">
              Free cancellations if done more than 12 hrs before the service. A
              fee will be charged otherwise.
            </p>
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              className="mt-2 text-sm text-gray-800 underline cursor-pointer"
            >
              Read full policy
            </button>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Checkout
            </p>
            <h1 className="text-lg font-semibold text-gray-900 mt-1">{service.name}</h1>
            <p className="text-sm text-gray-500">with {providerName}</p>
            <p className="text-xl font-bold text-gray-900 mt-3">{gbp(summary.itemTotal)}</p>
          </div>

          <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidCall}
              onChange={(e) => setAvoidCall(e.target.checked)}
              className="rounded border-gray-300"
            />
            Avoid calling before reaching the location.
          </label>

          <ServicePaymentSummary summary={summary} />

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <h3 className="font-semibold text-gray-900">
              Add a tip to thank the Professional
            </h3>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {TIP_PRESETS.map((amount) => {
                const selected = !usingCustomTip && tip === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => applyTip(amount)}
                    aria-pressed={selected}
                    className={`relative rounded-xl border px-2 py-2.5 text-sm font-medium cursor-pointer ${
                      selected
                        ? "border-green-600 bg-green-50 text-green-900"
                        : "border-gray-200 text-gray-800"
                    }`}
                  >
                    {gbp(amount)}
                    {selected && (
                      <span
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white"
                        aria-hidden
                      >
                        <X className="h-2.5 w-2.5" />
                      </span>
                    )}
                    {amount === 10 && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        POPULAR
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  if (usingCustomTip) {
                    clearTip();
                    return;
                  }
                  setUsingCustomTip(true);
                  setTip(Number(customTip) || 0);
                }}
                className={`relative rounded-xl border px-2 py-2.5 text-sm font-medium cursor-pointer ${
                  usingCustomTip
                    ? "border-green-600 bg-green-50 text-green-900"
                    : "border-gray-200 text-gray-800"
                }`}
              >
                Custom
                {usingCustomTip && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-white"
                    aria-hidden
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            </div>
            {usingCustomTip && (
              <Input
                type="number"
                min={0}
                step="0.5"
                value={customTip}
                onChange={(e) => {
                  setCustomTip(e.target.value);
                  setTip(Math.max(0, parseFloat(e.target.value) || 0));
                }}
                placeholder="Enter tip amount"
                className="mt-3 h-10 rounded-xl"
              />
            )}
            <p className="text-xs text-gray-500 mt-3">
              100% of the tip goes to the professional.
            </p>
          </div>
        </div>
      </div>

      <CheckoutAddressModal
        open={addressOpen}
        initial={address}
        defaultName={user ? `${user.firstName} ${user.lastName}`.trim() : ""}
        onClose={() => setAddressOpen(false)}
        onSave={(next) => {
          setAddress(next);
          setAddressOpen(false);
          if (!slot) setSlotOpen(true);
        }}
      />

      <CheckoutSlotModal
        open={slotOpen}
        service={service}
        initial={slot}
        onClose={() => setSlotOpen(false)}
        onSave={(next) => {
          setSlot(next);
          setSlotOpen(false);
        }}
      />

      {policyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h3 className="font-semibold text-gray-900">Cancellation policy</h3>
            <p className="text-sm text-gray-600 mt-2">
              Cancel more than 12 hours before the scheduled slot and you will
              not be charged a cancellation fee. Later cancellations may keep
              taxes, booking fees, or a portion of the service amount. Tips are
              refunded if the visit does not happen.
            </p>
            <Button
              type="button"
              onClick={() => setPolicyOpen(false)}
              className="mt-4 w-full rounded-xl bg-green-600 hover:bg-green-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {payment && (
        <ServiceBookingPaymentModal
          isOpen
          bookingId={payment.bookingId}
          serviceName={payment.serviceName}
          amount={payment.amount}
          clientSecret={payment.clientSecret}
          publishableKey={payment.publishableKey}
          onClose={() => setPayment(null)}
          onSuccess={() => {
            setPayment(null);
            toast({
              title: "Payment successful",
              description: "Your service booking is confirmed.",
            });
            router.push(backHref);
          }}
        />
      )}
    </div>
  );
}
