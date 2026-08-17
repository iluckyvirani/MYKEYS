"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Star,
  MapPin,
  Wrench,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Check,
  Users,
  Briefcase,
} from "lucide-react";
import ServiceBookingPaymentModal from "@/components/services/ServiceBookingPaymentModal";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  serviceCount?: number;
};
type CatalogItem = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price: number;
  categoryId: string;
  category?: { id: string; name: string };
  _count?: { offeredBy: number };
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

type Step = "categories" | "services" | "providers";

const CATEGORY_GRADIENTS = [
  "from-teal-700 via-teal-600 to-emerald-500",
  "from-sky-700 via-blue-600 to-cyan-500",
  "from-violet-700 via-purple-600 to-fuchsia-500",
  "from-amber-600 via-orange-500 to-rose-500",
  "from-slate-700 via-slate-600 to-teal-600",
  "from-rose-600 via-pink-500 to-orange-400",
];

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n || 0);
}

export default function BookServicesMarketplace({
  roleLabel = "you",
}: {
  roleLabel?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [catalogServiceId, setCatalogServiceId] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [step, setStep] = useState<Step>("categories");
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
      selectedCategoryIds.length
        ? catalog.filter((c) => selectedCategoryIds.includes(c.categoryId))
        : catalog,
    [catalog, selectedCategoryIds]
  );

  async function loadMarketplace() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/services/marketplace");
      const data = res.data?.data;
      setCategories(data?.categories ?? []);
      setCatalog(data?.catalog ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  async function loadProviders(serviceId: string) {
    try {
      setProvidersLoading(true);
      setError("");
      const res = await api.get(
        `/services/marketplace?catalogServiceId=${encodeURIComponent(serviceId)}`
      );
      setProviders(res.data?.data?.providers ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load providers");
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  }

  useEffect(() => {
    loadMarketplace();
  }, []);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function goToServices(ids?: string[]) {
    if (ids) setSelectedCategoryIds(ids);
    const chosen = ids ?? selectedCategoryIds;
    if (chosen.length === 0 && categories.length) {
      setSelectedCategoryIds(categories.map((c) => c.id));
    }
    setCatalogServiceId("");
    setSelectedProvider(null);
    setProviders([]);
    setStep("services");
  }

  function goToProviders(serviceId: string) {
    setCatalogServiceId(serviceId);
    setSelectedProvider(null);
    setStep("providers");
    loadProviders(serviceId);
  }

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
      <div className="relative overflow-hidden rounded-[5px] bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-600 text-white p-8 md:p-10">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="text-teal-100 text-sm font-medium flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" /> Book trusted professionals
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Find a service for {roleLabel}
          </h1>
          <p className="mt-3 text-teal-50/90 text-sm md:text-base leading-relaxed">
            Pick categories, choose a service, then book a top-rated provider.
            You pay MYKEYS at the listed price.
          </p>
        </div>
      </div>

      <ol className="grid grid-cols-3 gap-2 text-sm">
        {(
          [
            { key: "categories", n: 1, label: "Categories" },
            { key: "services", n: 2, label: "Services" },
            { key: "providers", n: 3, label: "Providers" },
          ] as const
        ).map((s) => {
          const active = step === s.key;
          const done =
            (s.key === "categories" && step !== "categories") ||
            (s.key === "services" && step === "providers");
          return (
            <li
              key={s.key}
              className={`rounded-[5px] border px-3 py-2 flex items-center gap-2 ${
                active
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : done
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-gray-200 bg-white text-gray-500"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  active || done
                    ? "bg-teal-700 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : s.n}
              </span>
              <span className="font-medium hidden sm:inline">{s.label}</span>
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="rounded-[5px] border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {step === "categories" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Choose categories
              </h2>
              <p className="text-sm text-gray-500">
                Select one or more. Then we show every matching service as cards.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setSelectedCategoryIds(categories.map((c) => c.id))}
              >
                Select all
              </Button>
              <Button
                type="button"
                className="bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                onClick={() => goToServices()}
                disabled={categories.length === 0}
              >
                Show services
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((c, idx) => {
                const selected = selectedCategoryIds.includes(c.id);
                const count = c.serviceCount ?? 0;
                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => toggleCategory(c.id)}
                    className={`group text-left bg-white rounded-[5px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border cursor-pointer ${
                      selected
                        ? "border-teal-500 ring-2 ring-teal-100"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[idx % CATEGORY_GRADIENTS.length]}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-7xl">
                        {c.icon || "🧰"}
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full">
                          {count} service{count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center ${
                          selected
                            ? "bg-teal-600 text-white"
                            : "bg-white/90 text-gray-400"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {c.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                        {c.description || "Browse catalog services in this category."}
                      </p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm font-medium text-teal-700">
                          {selected ? "Selected" : "Tap to select"}
                        </span>
                        <span
                          role="link"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToServices([c.id]);
                          }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline"
                        >
                          View services <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {step === "services" && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => setStep("categories")}
                className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1 mb-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to categories
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                Choose a service
              </h2>
              <p className="text-sm text-gray-500">
                {selectedCategoryIds.length
                  ? `${filteredCatalog.length} services from ${selectedCategoryIds.length} categor${selectedCategoryIds.length === 1 ? "y" : "ies"}`
                  : `${filteredCatalog.length} services`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="py-16 text-center border border-dashed rounded-[5px] bg-white">
              <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-800">No services in these categories</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 cursor-pointer"
                onClick={() => setStep("categories")}
              >
                Choose different categories
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCatalog.map((s) => (
                <motion.div
                  key={s.id}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-[5px] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-700 to-emerald-500 flex items-center justify-center">
                        <Wrench className="w-14 h-14 text-white/80" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 bg-linear-to-r from-green-500 to-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {s.category?.name || "Service"}
                    </span>
                    <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-full">
                      {gbp(s.price)}
                    </span>
                    <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-1">Fixed price</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {gbp(s.price)}
                    </h3>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {s.name}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                      {s.description || "Book this catalog service with a verified provider."}
                    </p>
                    <div className="flex items-center gap-4 py-4 border-y border-gray-100 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-green-600" />
                        {s._count?.offeredBy ?? 0} providers
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        Pay MYKEYS
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToProviders(s.id)}
                      className="w-full mt-6 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 group-hover:text-white border border-green-200 group-hover:border-transparent group-hover:from-green-600 group-hover:to-emerald-600 font-medium py-3 rounded-[5px] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg"
                    >
                      Choose providers
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {step === "providers" && (
        <section className="space-y-6">
          <div>
            <button
              type="button"
              onClick={() => {
                setStep("services");
                setSelectedProvider(null);
              }}
              className="text-sm text-teal-700 hover:underline inline-flex items-center gap-1 mb-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back to services
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              Book a provider
              {selectedService ? ` for ${selectedService.name}` : ""}
            </h2>
            <p className="text-sm text-gray-500">
              Sorted by rating, then completed jobs. You pay{" "}
              {selectedService ? gbp(selectedService.price) : "the catalog price"}{" "}
              to MYKEYS.
            </p>
          </div>

          {providersLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
            </div>
          ) : providers.length === 0 ? (
            <div className="py-16 text-center border border-dashed rounded-[5px] bg-white">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-800">
                No providers offer this yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Try another service, or check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {providers.map((p, idx) => {
                const name = `${p.user.firstName} ${p.user.lastName}`.trim();
                const selected = selectedProvider?.id === p.id;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedProvider(p)}
                    className={`group text-left bg-white rounded-[5px] shadow-lg hover:shadow-2xl transition-all overflow-hidden border cursor-pointer ${
                      selected
                        ? "border-teal-500 ring-2 ring-teal-100"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-700 to-emerald-500">
                      {p.user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.user.avatar}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-semibold">
                          {p.user.firstName?.[0]}
                          {p.user.lastName?.[0]}
                        </div>
                      )}
                      {idx === 0 && (
                        <span className="absolute top-4 left-4 bg-linear-to-r from-amber-500 to-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                          Top rated
                        </span>
                      )}
                      {p.documentVerified && (
                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{p.rating.toFixed(1)}</span>
                          <span className="text-gray-400">({p.totalReviews})</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                        {p.bio || "Trusted MYKEYS professional."}
                      </p>
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 text-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.completedBookings}
                          </p>
                          <p className="text-xs text-gray-500">Jobs done</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.totalReviews}
                          </p>
                          <p className="text-xs text-gray-500">Reviews</p>
                        </div>
                      </div>
                      <div className="mt-5 text-sm font-medium text-green-700 inline-flex items-center gap-1">
                        {selected ? "Selected — complete booking below" : "Select provider"}
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {selectedService && selectedProvider && (
            <div className="bg-white border border-gray-100 rounded-[5px] shadow-lg p-6 space-y-4 max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900">Booking details</h3>
              <p className="text-sm text-gray-600">
                {selectedService.name} with{" "}
                <strong>
                  {selectedProvider.user.firstName} {selectedProvider.user.lastName}
                </strong>
              </p>
              <div className="space-y-1.5">
                <Label>Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Address or area"
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    min={today}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you need"
                  className="h-11"
                />
              </div>
              <Button
                type="button"
                disabled={booking || !location.trim()}
                onClick={handleBook}
                className="bg-teal-700 hover:bg-teal-800 text-white w-full h-11 cursor-pointer"
              >
                {booking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…
                  </>
                ) : (
                  <>Pay {gbp(selectedService.price)} to MYKEYS</>
                )}
              </Button>
            </div>
          )}
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
