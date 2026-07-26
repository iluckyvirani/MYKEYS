"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Link2,
  Search,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  MORTGAGE_NAV_LINKS,
  MORTGAGE_QUICK_LINKS,
  type MortgageGuide,
  type MortgageGuideSection,
} from "@/lib/mortgageGuides";
import { useInspirePageContent } from "@/hooks/useInspirePageContent";
import { useInspireItems } from "@/hooks/useInspireItems";
import type { MortgageItemsContent } from "@/lib/content/inspireItems";

function QuickIcon({ type }: { type: "home" | "calculator" | "bolt" }) {
  if (type === "home") return <Home className="w-4 h-4 text-[#0f3d36]" />;
  if (type === "bolt") return <Zap className="w-4 h-4 text-[#0f3d36]" />;
  return <Calculator className="w-4 h-4 text-[#0f3d36]" />;
}

function FeaturedGuideCard({ guide }: { guide: MortgageGuide }) {
  return (
    <Link
      href={`/inspire/mortgage-guides/${guide.slug}`}
      className="group flex flex-col sm:flex-row overflow-hidden rounded-xl bg-[#f6f6f6] cursor-pointer"
    >
      <div className="sm:w-[46%] aspect-[16/11] sm:aspect-auto sm:min-h-[180px] overflow-hidden bg-slate-200 shrink-0">
        {guide.image ? (
          <img
            src={guide.image}
            alt={guide.imageAlt || guide.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-slate-200" />
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center px-5 py-6 sm:px-7">
        <h3 className="text-lg sm:text-xl font-bold text-[#1a1a2e] leading-snug group-hover:text-green-700 transition-colors">
          {guide.title}
        </h3>
        {guide.minutes ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {guide.minutes} min
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function SmallGuideCard({ guide }: { guide: MortgageGuide }) {
  return (
    <Link
      href={`/inspire/mortgage-guides/${guide.slug}`}
      className="flex items-center justify-center text-center min-h-[96px] px-4 py-5 rounded-xl border border-gray-200 bg-white hover:border-green-400 cursor-pointer transition-colors"
    >
      <span className="text-[15px] font-bold text-[#1a1a2e] leading-snug">
        {guide.title}
      </span>
    </Link>
  );
}

function GuideSectionBlock({
  section,
  showCalculatorBanner,
}: {
  section: MortgageGuideSection;
  showCalculatorBanner?: boolean;
}) {
  const [featured, ...rest] = section.guides;
  const smallCards = rest.slice(0, 3);

  return (
    <section id={section.id} className="scroll-mt-28 mb-12 md:mb-14">
      {showCalculatorBanner && (
        <Link
          href="/inspire/mortgages"
          className="mb-10 flex items-center overflow-hidden rounded-2xl cursor-pointer group"
        >
          <div className="flex-1 bg-[#0f3d36] text-white px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-lg sm:text-xl font-bold">
              Try our Mortgage Calculator
            </p>
          </div>
          <div className="hidden sm:flex items-center justify-end gap-3 bg-green-100 px-6 py-5 min-w-[180px]">
            <Calculator className="w-8 h-8 text-[#0f3d36]" />
            <Home className="w-7 h-7 text-green-700" />
            <span className="w-10 h-10 rounded-full bg-[#0f3d36] text-white flex items-center justify-center group-hover:bg-green-700 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </span>
          </div>
        </Link>
      )}

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

export default function MortgageGuidesPage() {
  const content = useInspirePageContent("mortgage-guides");
  const { sections, spotlight } =
    useInspireItems<MortgageItemsContent>("mortgage-guides");
  const [exploreOpen, setExploreOpen] = useState(true);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;
    const q = query.trim().toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        guides: section.guides.filter((g) =>
          g.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.guides.length > 0);
  }, [query, sections]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        {/* Hero */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 pt-6 md:pt-8">
          <div className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[340px] md:min-h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80"
              alt="Couple discussing their mortgage plans at home"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative z-10 max-w-[440px] m-4 sm:m-6 md:m-8 bg-[#0f3d36] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
              <h1 className="text-[2rem] sm:text-[2.35rem] font-bold leading-tight tracking-tight">
                {content.hero.titleHighlight ? (
                  <>
                    <span className="text-green-400">
                      {content.hero.titleHighlight}
                    </span>{" "}
                    <span className="text-white">{content.hero.title}</span>
                  </>
                ) : (
                  content.hero.title
                )}
              </h1>
              <p className="mt-4 text-[15px] text-white/90 leading-relaxed">
                {content.hero.subtitle}
              </p>
              <Link
                href="/inspire/mortgages"
                className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-green-300 hover:text-green-200 cursor-pointer"
              >
                {content.hero.ctaLabel || "← Back to Mortgages"}
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-10 items-start mb-8">
            <div className="border-b border-gray-200 pb-5">
              <button
                type="button"
                onClick={() => setExploreOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 cursor-pointer text-left"
              >
                <h2 className="text-lg sm:text-xl font-bold text-[#1a1a2e]">
                  {content.hero.sectionTitle || "Explore mortgage guides"}
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 shrink-0 transition-transform ${
                    exploreOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {exploreOpen && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
                  {MORTGAGE_NAV_LINKS.map((link) => (
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

            <div className="rounded-xl bg-green-50 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#1a1a2e]">Quick links</h3>
                <Link2 className="w-4 h-4 text-green-700" />
              </div>
              <ul className="space-y-2.5">
                {MORTGAGE_QUICK_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2.5 text-sm font-semibold text-green-700 hover:text-green-800 cursor-pointer"
                    >
                      <QuickIcon type={item.icon} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-12 items-start">
            <div>
              {filteredSections.map((section, index) => (
                <GuideSectionBlock
                  key={section.id}
                  section={section}
                  showCalculatorBanner={
                    section.id === "different-types-of-mortgages"
                  }
                />
              ))}
              {filteredSections.length === 0 && (
                <p className="text-slate-500 py-8">
                  No guides matched your search.
                </p>
              )}
            </div>

            <aside className="space-y-4 lg:sticky lg:top-[96px]">
              <div className="rounded-xl bg-[#f6f6f6] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGuidesOpen((v) => !v)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-slate-700" />
                  <span className="flex-1 font-bold text-[#1a1a2e]">
                    All guides
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform ${
                      guidesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {guidesOpen && (
                  <div className="px-4 pb-4 space-y-2">
                    {MORTGAGE_NAV_LINKS.map((link) => (
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
            </aside>
          </div>
        </div>

        {/* Spotlight */}
        <section className="bg-[#0f3d36] text-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-12">
            <p className="text-xs font-semibold tracking-[0.12em] uppercase text-white/70 mb-2">
              Spotlight news & guides
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Getting a mortgage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {spotlight.map((item) => (
                <Link
                  key={item.slug}
                  href={`/inspire/mortgage-guides/${item.slug}`}
                  className="group rounded-xl overflow-hidden bg-[#165048] cursor-pointer"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white leading-snug group-hover:text-green-200">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[11px] font-semibold tracking-wide uppercase text-green-200/80">
                      {item.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
          <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
            Please note: Your home may be repossessed if you do not keep up
            repayments on your mortgage or any other debt secured on it. The
            guides on this page are for general information only and do not
            constitute financial advice. Always seek advice from a qualified
            mortgage adviser.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
