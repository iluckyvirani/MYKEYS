"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ENERGY_NAV_LINKS,
  ENERGY_SECTIONS,
  type EnergyGuide,
  type EnergyGuideSection,
} from "@/lib/energyEfficiency";

function ElectricHomeIllustration() {
  return (
    <div className="w-full h-full min-h-[160px] flex items-center justify-center bg-[#f4f7f6] p-6">
      <svg
        viewBox="0 0 220 140"
        className="w-full max-w-[220px] h-auto text-slate-800"
        aria-hidden
      >
        <path
          d="M40 95 V55 L110 20 L180 55 V95"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M70 95 V68 H100 V95" fill="none" stroke="currentColor" strokeWidth="3" />
        <rect x="120" y="62" width="28" height="22" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M55 52 L110 24 L165 52" fill="none" stroke="#3db2ad" strokeWidth="4" />
        <rect x="48" y="48" width="18" height="8" fill="#3db2ad" opacity="0.85" />
        <rect x="72" y="38" width="18" height="8" fill="#3db2ad" opacity="0.85" />
        <rect x="96" y="30" width="18" height="8" fill="#3db2ad" opacity="0.85" />
        <circle cx="185" cy="95" r="14" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="185" cy="95" r="6" fill="#3db2ad" />
        <path d="M171 95 H155" stroke="#3db2ad" strokeWidth="3" />
        <rect x="30" y="78" width="14" height="17" fill="none" stroke="#3db2ad" strokeWidth="3" rx="2" />
        <circle cx="200" cy="28" r="10" fill="none" stroke="#3db2ad" strokeWidth="3" />
      </svg>
    </div>
  );
}

function FeaturedGuideCard({ guide }: { guide: EnergyGuide }) {
  return (
    <Link
      href={`/inspire/energy-efficiency/${guide.slug}`}
      className="group flex flex-col sm:flex-row overflow-hidden rounded-xl bg-[#f6f6f6] cursor-pointer"
    >
      <div className="sm:w-[46%] aspect-[16/11] sm:aspect-auto sm:min-h-[180px] overflow-hidden bg-slate-200 shrink-0">
        {guide.illustrated ? (
          <ElectricHomeIllustration />
        ) : guide.image ? (
          <img
            src={guide.image}
            alt={guide.imageAlt || guide.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
      </div>
      <div className="flex-1 flex items-center px-5 py-6 sm:px-7">
        <h3 className="text-lg sm:text-xl font-bold text-[#1a1a2e] leading-snug group-hover:text-green-700 transition-colors">
          {guide.title}
        </h3>
      </div>
    </Link>
  );
}

function SmallGuideCard({ guide }: { guide: EnergyGuide }) {
  return (
    <Link
      href={`/inspire/energy-efficiency/${guide.slug}`}
      className="flex items-center justify-center text-center min-h-[96px] px-4 py-5 rounded-xl border border-gray-200 bg-white hover:border-green-400 cursor-pointer transition-colors"
    >
      <span className="text-[15px] font-bold text-[#1a1a2e] leading-snug">
        {guide.title}
      </span>
    </Link>
  );
}

function GuideSectionBlock({ section }: { section: EnergyGuideSection }) {
  const [featured, ...rest] = section.guides;
  const smallCards = rest.slice(0, 3);

  return (
    <section id={section.id} className="scroll-mt-28 mb-12 md:mb-14">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <h2 className="text-[26px] sm:text-[30px] font-bold text-[#1a1a2e] leading-tight">
          {section.title}
        </h2>
        <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase shrink-0">
          {section.guides.length} guides
        </span>
      </div>
      <p className="text-[15px] text-slate-600 mb-5 max-w-2xl leading-relaxed">
        {section.description}
      </p>

      {featured && (
        <div className="mb-3">
          <FeaturedGuideCard guide={featured} />
        </div>
      )}

      {smallCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {smallCards.map((guide) => (
            <SmallGuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <a
          href={`#${section.id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

export default function EnergyEfficiencyPage() {
  const [exploreOpen, setExploreOpen] = useState(true);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!query.trim()) return ENERGY_SECTIONS;
    const q = query.trim().toLowerCase();
    return ENERGY_SECTIONS.map((section) => ({
      ...section,
      guides: section.guides.filter((g) =>
        g.title.toLowerCase().includes(q)
      ),
    })).filter((s) => s.guides.length > 0);
  }, [query]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 md:pt-8">
          <div className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[340px] md:min-h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80"
              alt="Modern glass home extension at dusk"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative z-10 max-w-[420px] m-4 sm:m-6 md:m-8 bg-[#0f3d36] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
              <p className="text-sm font-medium text-white/85 mb-2">Guides</p>
              <h1 className="text-[2rem] sm:text-[2.35rem] font-bold leading-tight tracking-tight">
                <span className="text-green-400">Greener</span>{" "}
                <span className="text-white">Homes</span>
              </h1>
              <p className="mt-4 text-[15px] text-white/90 leading-relaxed">
                Learn about going greener at home, tips for reducing your energy
                bill, and the latest energy news.
              </p>
              <Link
                href="/inspire/property-guides"
                className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-white/95 hover:text-green-300 cursor-pointer"
              >
                ← Back to Guides
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          {/* Explore accordion */}
          <div className="border-b border-gray-200 pb-5 mb-8">
            <button
              type="button"
              onClick={() => setExploreOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 cursor-pointer text-left"
            >
              <h2 className="text-lg sm:text-xl font-bold text-[#1a1a2e]">
                Explore energy efficiency guides
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-slate-600 shrink-0 transition-transform ${
                  exploreOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {exploreOpen && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
                {ENERGY_NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[15px] font-semibold text-green-700 hover:text-green-800 py-1 cursor-pointer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-12 items-start">
            <div>
              {filteredSections.map((section) => (
                <GuideSectionBlock key={section.id} section={section} />
              ))}
              {filteredSections.length === 0 && (
                <p className="text-slate-500 py-8">No guides matched your search.</p>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-[96px]">
              {/* All guides */}
              <div className="rounded-xl bg-[#f6f6f6] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGuidesOpen((v) => !v)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-slate-700" />
                  <span className="flex-1 font-bold text-[#1a1a2e]">All guides</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      guidesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {guidesOpen && (
                  <div className="px-4 pb-4 space-y-2">
                    {ENERGY_NAV_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="block text-sm font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="rounded-xl bg-[#f6f6f6] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
                >
                  <Search className="w-5 h-5 text-slate-700" />
                  <span className="flex-1 font-bold text-[#1a1a2e]">Search</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      searchOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {searchOpen && (
                  <div className="px-4 pb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Search in guides
                    </label>
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Type here..."
                      className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm outline-none focus:border-green-500"
                    />
                    <button
                      type="button"
                      className="mt-3 w-full h-10 rounded-lg border-2 border-slate-800 text-slate-800 text-sm font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    >
                      View results
                    </button>
                    <Link
                      href="/inspire/property-news"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800 cursor-pointer"
                    >
                      Property News
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Account CTA */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-bold text-[#1a1a2e]">
                  Sign up for MY KEY Dashboard
                </h3>
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

              {/* Valuation CTA */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-bold text-[#1a1a2e]">
                  How much is my home worth?
                </h3>
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

              {/* Newsletter */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-bold text-[#1a1a2e]">
                  Do you get our weekly newsletter?
                </h3>
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
        </div>
      </main>
      <Footer />
    </>
  );
}
