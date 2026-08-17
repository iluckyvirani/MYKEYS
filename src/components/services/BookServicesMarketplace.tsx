"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Star,
  MapPin,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ServiceBookingPaymentModal from "@/components/services/ServiceBookingPaymentModal";

type Category = { id: string; name: string; description?: string | null; icon?: string | null };
type CatalogItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  commissionPercent: number;
  categoryId: string;
  category?: { id: string; name: string };
};
type Provider = {
  id: string;
  bio?: string | null;
  rating: number;
  totalReviews: number;
  completedBookings: number;
  documentVerified: boolean;
  serviceAreas?: unknown;
  user: { id: string; firstName: string; lastName: string; avatar?: string | null };
};

type Props = {
  roleLabel?: string;
};

export default function BookServicesMarketplace({ roleLabel = "you" }: Props) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [catalogServiceId, setCatalogServiceId] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  const [location, setLocation] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [description, setDescription] = useState("");

  const [payment, setPayment] = useState<{
    bookingId: string;
    clientSecret: string;
    publishableKey?: string;
    amount: number;
    serviceName: string;
  } | null>(null);

  const selectedService = useMemo(
    () => catalog.find((c) => c.id === catalogServiceId) || null,
    [catalog, catalogServiceId]
  );

  const filteredCatalog = useMemo(
    () =>
      categoryId ? catalog.filter((c) => c.categoryId === categoryId) : catalog,
    [catalog, categoryId]
  );

  async function loadMarketplace(opts?: { categoryId?: string; catalogServiceId?: string }) {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (opts?.categoryId) params.set("categoryId", opts.categoryId);
      if (opts?.catalogServiceId) params.set("catalogServiceId", opts.catalogServiceId);
      const res = await api.get(`/services/marketplace?${params.toString()}`);
      const data = res.data?.data;
      setCategories(data?.categories ?? []);
      setCatalog(data?.catalog ?? []);
      setProviders(data?.providers ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketplace();
  }, []);

  useEffect(() => {
    if (catalogServiceId) {
      loadMarketplace({ categoryId: categoryId || undefined, catalogServiceId });
      setSelectedProvider(null);
    } else {
      setProviders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogServiceId]);

  async function handleBook() {
    if (!selectedService || !selectedProvider) return;
    setBooking(true);
    setError("");
    try {
      const res = await api.post("/services/book", {
        catalogServiceId: selectedService.id,
        providerId: selectedProvider.id,
        location,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        description,
      });
      const data = res.data?.data;
      if (data?.clientSecret && data.amount > 0) {
        setPayment({
          bookingId: data.booking.id,
          clientSecret: data.clientSecret,
          publishableKey: data.publishableKey,
          amount: data.amount,
          serviceName: selectedService.name,
        });
      } else {
        alert("Booking confirmed!");
        setSelectedProvider(null);
        setDescription("");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 text-white p-8 md:p-10">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="text-teal-100 text-sm font-medium flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" /> Book trusted professionals
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Find a service for {roleLabel}
          </h1>
          <p className="mt-3 text-teal-50/90 text-sm md:text-base leading-relaxed">
            Choose a MYKEYS catalog service, then pick a top-rated provider.
            Payment goes securely to MYKEYS. Completion is confirmed by email OTP.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {/* Step 1: Category */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">1. Category</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={!categoryId ? "default" : "outline"}
            className={!categoryId ? "bg-teal-700 hover:bg-teal-800 text-white" : ""}
            onClick={() => {
              setCategoryId("");
              setCatalogServiceId("");
              loadMarketplace();
            }}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={categoryId === c.id ? "default" : "outline"}
              className={
                categoryId === c.id ? "bg-teal-700 hover:bg-teal-800 text-white" : ""
              }
              onClick={() => {
                setCategoryId(c.id);
                setCatalogServiceId("");
                loadMarketplace({ categoryId: c.id });
              }}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Step 2: Catalog service */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">2. Service</h2>
        {loading && !filteredCatalog.length ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
          </div>
        ) : filteredCatalog.length === 0 ? (
          <p className="text-sm text-gray-500">No catalog services in this category yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCatalog.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCatalogServiceId(s.id)}
                className={`text-left rounded-xl border p-4 transition hover:shadow-md ${
                  catalogServiceId === s.id
                    ? "border-teal-500 ring-2 ring-teal-100 bg-teal-50/40"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.category?.name}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                {s.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{s.description}</p>
                )}
                <p className="mt-3 text-lg font-bold text-teal-800">£{s.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Step 3: Providers */}
      {catalogServiceId && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            3. Choose a provider
            <span className="text-sm font-normal text-gray-500 ml-2">
              Top rated first
            </span>
          </h2>
          {loading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
            </div>
          ) : providers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No providers offer this service yet. Check back soon.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {providers.map((p, idx) => {
                const name = `${p.user.firstName} ${p.user.lastName}`.trim();
                const selected = selectedProvider?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProvider(p)}
                    className={`text-left rounded-xl border p-4 transition ${
                      selected
                        ? "border-teal-500 ring-2 ring-teal-100 bg-white"
                        : "border-gray-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 text-white flex items-center justify-center font-semibold">
                        {p.user.firstName?.[0]}
                        {p.user.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{name}</p>
                          {idx === 0 && (
                            <Badge className="bg-amber-100 text-amber-800">Top rated</Badge>
                          )}
                          {p.documentVerified && (
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            {p.rating.toFixed(1)} ({p.totalReviews})
                          </span>
                          <span>{p.completedBookings} jobs</span>
                        </div>
                      </div>
                    </div>
                    {p.bio && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{p.bio}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Step 4: Details + pay */}
      {selectedService && selectedProvider && (
        <section className="bg-white border rounded-2xl p-6 space-y-4 max-w-xl">
          <h2 className="text-lg font-semibold text-gray-900">4. Booking details</h2>
          <p className="text-sm text-gray-600">
            {selectedService.name} with{" "}
            <strong>
              {selectedProvider.user.firstName} {selectedProvider.user.lastName}
            </strong>{" "}
            — <strong>£{selectedService.price.toFixed(2)}</strong>
          </p>
          <div className="space-y-1.5">
            <Label>Location *</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Address or area"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                min={today}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need"
            />
          </div>
          <Button
            type="button"
            disabled={booking || !location.trim()}
            onClick={handleBook}
            className="bg-teal-700 hover:bg-teal-800 text-white w-full sm:w-auto"
          >
            {booking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
              </>
            ) : (
              <>Pay £{selectedService.price.toFixed(2)} to MYKEYS</>
            )}
          </Button>
        </section>
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
            setSelectedProvider(null);
            alert("Payment successful — booking confirmed!");
          }}
        />
      )}
    </div>
  );
}
