"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Home,
  Rocket,
  Search,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  GUIDE_CATEGORIES,
  GUIDE_SIDEBAR_ACCORDIONS,
} from "@/lib/propertyGuides";

const ACCORDION_ICONS = {
  calculators: Calculator,
  resources: Rocket,
  market: Home,
} as const;

export default function PropertyGuidesPage() {
  const [query, setQuery] = useState("");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUIDE_CATEGORIES;
    return GUIDE_CATEGORIES.map((cat) => ({
      ...cat,
      links: cat.links.filter((l) => l.label.toLowerCase().includes(q)),
    })).filter(
      (cat) =>
        cat.title.toLowerCase().includes(q) || cat.links.length > 0
    );
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const el = document.getElementById("guides-grid");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f7f7] pt-[72px] md:pt-[80px]">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 md:pt-8">
          <div className="relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[380px] md:min-h-[420px] flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80"
              alt="Bright living space with plants"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />

            <div className="relative z-10 w-[min(100%-2rem,520px)] mx-4 bg-[#0f3d36] text-white rounded-2xl p-6 sm:p-8 md:p-9 shadow-xl">
              <h1 className="text-[2rem] sm:text-[2.4rem] font-bold tracking-tight leading-tight">
                Property guides
              </h1>
              <p className="mt-2 text-base sm:text-lg text-white/90">
                For every step of your moving journey.
              </p>

              <form onSubmit={handleSearch} className="mt-6">
                <label className="block text-sm text-white/90 mb-2">
                  What are you looking for?
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. first-time buyers"
                    className="flex-1 h-12 px-4 rounded-lg bg-white text-slate-800 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-green-400"
                  />
                  <button
                    type="submit"
                    className="h-12 px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Search guides
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Grid + sidebar */}
        <section
          id="guides-grid"
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-[#1a1a2e] mb-3">
                    {cat.title}
                  </h2>
                  <ul className="space-y-2">
                    {cat.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[15px] font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <p className="text-slate-500 sm:col-span-2 py-6">
                  No guides matched “{query}”.
                </p>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-[96px]">
              {GUIDE_SIDEBAR_ACCORDIONS.map((item) => {
                const Icon =
                  ACCORDION_ICONS[item.id as keyof typeof ACCORDION_ICONS] ||
                  Home;
                const open = openAccordion === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl bg-[#ececec] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAccordion((prev) =>
                          prev === item.id ? null : item.id
                        )
                      }
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-slate-700 shrink-0" />
                      <span className="flex-1 font-bold text-[#1a1a2e] text-[15px]">
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 space-y-2">
                        {item.links.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="block text-sm font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-2">
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3 leading-snug">
                  Do more with a MYKEYS account
                </h3>
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h4 className="text-base font-bold text-[#1a1a2e]">
                    Sign up for MY KEY Dashboard
                  </h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Save properties, see your sent enquiries, set up alerts and
                    more.
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                  >
                    Create an account or sign in
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="text-base font-bold text-[#1a1a2e]">
                  How much is my home worth?
                </h4>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  When you track a property, you get an instant estimate of its
                  value.
                </p>
                <Link
                  href="/buy"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                >
                  Browse properties for sale
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="text-base font-bold text-[#1a1a2e]">
                  Do you get our weekly newsletter?
                </h4>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  A must-have if you&apos;re thinking of moving — or want the
                  latest housing market updates.
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                >
                  Sign up for our newsletter
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
