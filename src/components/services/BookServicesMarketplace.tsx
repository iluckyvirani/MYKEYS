"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  computeServicePaymentSummary,
  type ServiceCheckoutFees,
} from "@/lib/services/serviceCheckoutFees";
import {
  Loader2,
  Star,
  Wrench,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Check,
  Users,
  Search,
} from "lucide-react";

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
  morningSurcharge?: number;
  afternoonSurcharge?: number;
  eveningSurcharge?: number;
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

function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n || 0);
}

const STEPS: { key: Step; n: number; label: string; hint: string }[] = [
  { key: "categories", n: 1, label: "Category", hint: "What do you need?" },
  { key: "services", n: 2, label: "Service", hint: "Pick a job" },
  { key: "providers", n: 3, label: "Book", hint: "Choose a pro & pay" },
];

export default function BookServicesMarketplace({
  roleLabel = "you",
  checkoutPath = "/user/dashboard/services/checkout",
}: {
  roleLabel?: string;
  checkoutPath?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [catalogServiceId, setCatalogServiceId] = useState("");
  const [step, setStep] = useState<Step>("categories");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [checkoutFees, setCheckoutFees] = useState<ServiceCheckoutFees>({
    taxPercent: 0,
    bookingFee: 0,
    extraLabel: "",
    extraAmount: 0,
  });

  const selectedService = useMemo(
    () => catalog.find((c) => c.id === catalogServiceId) || null,
    [catalog, catalogServiceId]
  );

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || step !== "categories") return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [categories, query, step]);

  const filteredCatalog = useMemo(() => {
    const byCat = selectedCategoryIds.length
      ? catalog.filter((c) => selectedCategoryIds.includes(c.categoryId))
      : catalog;
    const q = query.trim().toLowerCase();
    if (!q || step !== "services") return byCat;
    return byCat.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q) ||
        (s.category?.name || "").toLowerCase().includes(q)
    );
  }, [catalog, selectedCategoryIds, query, step]);

  async function loadMarketplace() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/services/marketplace");
      const data = res.data?.data;
      setCategories(data?.categories ?? []);
      setCatalog(data?.catalog ?? []);
      if (data?.checkoutFees) {
        setCheckoutFees(data.checkoutFees);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load services";
      setError(message);
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
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load providers";
      setError(message);
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
    setProviders([]);
    setQuery("");
    setStep("services");
  }

  function goToProviders(serviceId: string) {
    setCatalogServiceId(serviceId);
    setQuery("");
    setStep("providers");
    loadProviders(serviceId);
  }

  function goToCheckout(provider: Provider) {
    if (!catalogServiceId) return;
    router.push(
      `${checkoutPath}?serviceId=${encodeURIComponent(catalogServiceId)}&providerId=${encodeURIComponent(provider.id)}`
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-green-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
              Book a professional
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Services for {roleLabel}
            </h1>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Choose a category, pick the job, then book a verified provider.
              You pay MYKEYS at the listed price.
            </p>
          </div>
          <Link
            href="/user/dashboard/service-bookings"
            className="text-sm font-medium text-green-700 hover:text-green-800 inline-flex items-center gap-1"
          >
            View my bookings
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {STEPS.map((s, i) => {
            const active = step === s.key;
            const done =
              (s.key === "categories" && step !== "categories") ||
              (s.key === "services" && step === "providers");
            return (
              <div key={s.key} className="relative">
                {i < STEPS.length - 1 && (
                  <span
                    className={`hidden sm:block absolute top-4 left-[calc(50%+18px)] right-[-50%] h-0.5 ${
                      done ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
                <div
                  className={`relative rounded-xl border px-3 py-3 text-center sm:text-left ${
                    active
                      ? "border-green-500 bg-green-50"
                      : done
                        ? "border-green-200 bg-white"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        active || done
                          ? "bg-green-600 text-white"
                          : "bg-white text-gray-400 border border-gray-200"
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : s.n}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          active ? "text-green-800" : "text-gray-800"
                        }`}
                      >
                        {s.label}
                      </p>
                      <p className="hidden sm:block text-xs text-gray-500 truncate">
                        {s.hint}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {step === "categories" && (
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search categories — plumbing, cleaning, electrics…"
                className="pl-9 h-11 rounded-xl bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl"
                onClick={() => setSelectedCategoryIds(categories.map((c) => c.id))}
              >
                Select all
              </Button>
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-xl"
                onClick={() => goToServices()}
                disabled={categories.length === 0}
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {selectedCategoryIds.length
              ? `${selectedCategoryIds.length} categor${selectedCategoryIds.length === 1 ? "y" : "ies"} selected`
              : "Select one or more categories, or continue to see all services."}
          </p>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed bg-white">
              <p className="font-medium text-gray-800">No matching categories</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((c) => {
                const selected = selectedCategoryIds.includes(c.id);
                const count = c.serviceCount ?? 0;
                return (
                  <motion.button
                    key={c.id}
                    type="button"
                    whileHover={{ y: -2 }}
                    onClick={() => toggleCategory(c.id)}
                    className={`flex items-start gap-4 text-left rounded-2xl border bg-white p-4 transition-all cursor-pointer ${
                      selected
                        ? "border-green-500 ring-2 ring-green-100 shadow-sm"
                        : "border-gray-200 hover:border-green-300 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        selected ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      {c.icon || "🧰"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{c.name}</h3>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            selected
                              ? "bg-green-600 border-green-600 text-white"
                              : "border-gray-300 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {c.description || "Browse jobs in this category."}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {count} service{count === 1 ? "" : "s"}
                        </span>
                        <span
                          role="link"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToServices([c.id]);
                          }}
                          className="text-xs font-semibold text-green-700 hover:underline"
                        >
                          View jobs →
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
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStep("categories");
              }}
              className="text-sm text-green-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Categories
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                className="pl-9 h-11 rounded-xl bg-white"
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Choose a service</h2>
            <p className="text-sm text-gray-500">
              {filteredCatalog.length} job{filteredCatalog.length === 1 ? "" : "s"} available
            </p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed bg-white">
              <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-800">No services found</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 cursor-pointer rounded-xl"
                onClick={() => setStep("categories")}
              >
                Change categories
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCatalog.map((s) => (
                <motion.article
                  key={s.id}
                  whileHover={{ y: -3 }}
                  className="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-md transition-all"
                >
                  <div className="relative h-40 bg-gray-100">
                    {s.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.image}
                        alt={s.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-50 flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-green-400" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/95 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {s.category?.name || "Service"}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                      {s.description || "Fixed-price catalog service."}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">From</p>
                        <p className="text-xl font-bold text-gray-900">{gbp(s.price)}</p>
                      </div>
                      <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {s._count?.offeredBy ?? 0} pros
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToProviders(s.id)}
                      className="mt-4 w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-medium cursor-pointer inline-flex items-center justify-center gap-1"
                    >
                      See providers
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      )}

      {step === "providers" && (
        <section className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setStep("services");
            }}
            className="text-sm text-green-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> All services
          </button>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Choose a provider
                {selectedService ? ` for ${selectedService.name}` : ""}
              </h2>
              <p className="text-sm text-gray-500">
                Click a provider to open the checkout page. Slot extras, if set
                by admin, are added there. From{" "}
                {selectedService
                  ? gbp(
                      computeServicePaymentSummary(
                        selectedService.price,
                        checkoutFees
                      ).amountToPay
                    )
                  : "the listed price"}
                .
              </p>
            </div>

            {providersLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : providers.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed bg-white">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-800">No providers for this service yet</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {providers.map((p, idx) => {
                  const name = `${p.user.firstName} ${p.user.lastName}`.trim();
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => goToCheckout(p)}
                      className="w-full text-left rounded-2xl border border-gray-200 bg-white p-4 flex gap-4 cursor-pointer transition-all hover:border-green-400 hover:shadow-sm"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-green-50 shrink-0 flex items-center justify-center">
                        {p.user.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.user.avatar}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-green-700 font-semibold">
                            {p.user.firstName?.[0]}
                            {p.user.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-sm">
                              <span className="inline-flex items-center gap-1 text-gray-700">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                {p.rating.toFixed(1)}
                                <span className="text-gray-400">({p.totalReviews})</span>
                              </span>
                              {idx === 0 && (
                                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                  Top rated
                                </span>
                              )}
                            </div>
                          </div>
                          {p.documentVerified && (
                            <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full inline-flex items-center gap-1 shrink-0">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                          {p.bio || "Trusted MYKEYS professional."}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {p.completedBookings} jobs completed
                          </p>
                          <span className="text-sm font-semibold text-green-700">
                            Book →
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
