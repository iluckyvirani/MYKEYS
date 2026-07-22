"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Facebook,
  Home,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  PROPERTY_NEWS,
  PROPERTY_NEWS_CATEGORIES,
  PROPERTY_NEWS_SIDEBAR_STORY,
  type PropertyNewsArticle,
} from "@/lib/propertyNews";

function HeroOverlayCard({
  article,
  large = false,
}: {
  article: PropertyNewsArticle;
  large?: boolean;
}) {
  return (
    <Link
      href={`/inspire/property-news/${article.slug}`}
      className="group relative block h-full min-h-[200px] overflow-hidden rounded-md bg-slate-200 cursor-pointer"
    >
      <img
        src={article.image}
        alt={article.imageAlt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
        <div className="flex gap-3">
          <span
            className="w-[3px] shrink-0 rounded-full bg-green-500 self-stretch min-h-[2rem]"
            aria-hidden
          />
          <div className="min-w-0">
            <h2
              className={`font-bold leading-snug ${
                large
                  ? "text-xl sm:text-2xl md:text-[1.7rem] max-w-md"
                  : "text-[15px] sm:text-base"
              }`}
            >
              {article.title}
            </h2>
            {article.summary ? (
              <p
                className={`mt-1 text-white/90 leading-snug ${
                  large ? "text-sm sm:text-base" : "text-xs sm:text-sm"
                }`}
              >
                {article.summary}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewsGridCard({ article }: { article: PropertyNewsArticle }) {
  return (
    <article className="group">
      <Link
        href={`/inspire/property-news/${article.slug}`}
        className="block cursor-pointer"
      >
        <div className="relative">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-slate-100">
            <img
              src={article.image}
              alt={article.imageAlt}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          {/* Title box overlapping bottom of image */}
          <div className="relative z-10 mx-3 sm:mx-4 -mt-8 sm:-mt-10">
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 px-4 py-3.5 sm:px-5 sm:py-4">
              <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1a1a2e] leading-snug group-hover:text-green-700 transition-colors">
                {article.title}
              </h2>
            </div>
          </div>
        </div>
        <div className="mt-3 px-1 flex items-center gap-2 text-[13px]">
          <span className="w-[2px] h-3.5 bg-green-600 shrink-0" aria-hidden />
          <span className="font-semibold text-green-700">{article.category}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{article.date}</span>
        </div>
      </Link>
    </article>
  );
}

export default function PropertyNewsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const hero = PROPERTY_NEWS[0];
  const sideA = PROPERTY_NEWS[1];
  const sideB = PROPERTY_NEWS[2];

  const gridArticles = useMemo(() => {
    let items = PROPERTY_NEWS.slice(3);
    if (activeCategory) {
      items = PROPERTY_NEWS.filter((a) => a.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, query]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          <header className="mb-8 md:mb-10">
            <h1 className="text-[32px] sm:text-[36px] md:text-[40px] font-bold text-[#1a1a2e] tracking-tight leading-tight">
              Property news
            </h1>
            <p className="mt-2.5 text-[15px] sm:text-base text-[#4a4a5a] max-w-3xl leading-relaxed font-normal">
              The latest on the housing market, property inspiration and
              home-moving news.
            </p>
          </header>

          {/* Hero mosaic */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-10 md:mb-12">
            <div className="lg:col-span-2 min-h-[260px] sm:min-h-[340px] lg:min-h-[420px]">
              {hero && <HeroOverlayCard article={hero} large />}
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 min-h-[400px] lg:min-h-[420px]">
              <div className="flex-1 min-h-[190px]">
                {sideA && <HeroOverlayCard article={sideA} />}
              </div>
              <div className="flex-1 min-h-[190px]">
                {sideB && <HeroOverlayCard article={sideB} />}
              </div>
            </div>
          </section>

          {/* Grid + sidebar */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_300px] gap-10 lg:gap-12 items-start">
            <div>
              {gridArticles.length === 0 ? (
                <p className="text-slate-500 py-10">No articles found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
                  {gridArticles.map((article) => (
                    <NewsGridCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-[96px]">
              <form onSubmit={onSearch} className="flex items-stretch gap-0">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 h-10 px-3 border border-gray-300 border-r-0 rounded-l-md text-sm text-slate-800 outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  className="h-10 px-4 border border-gray-300 bg-[#f3f3f3] text-sm font-semibold text-slate-800 rounded-r-md hover:bg-gray-200 cursor-pointer"
                >
                  Search
                </button>
              </form>

              <div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">
                  Categories
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveCategory(null)}
                      className={`text-sm font-semibold cursor-pointer ${
                        !activeCategory
                          ? "text-green-700"
                          : "text-green-600 hover:text-green-700"
                      }`}
                    >
                      All
                    </button>
                  </li>
                  {PROPERTY_NEWS_CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveCategory((prev) =>
                            prev === cat ? null : cat
                          )
                        }
                        className={`text-sm font-semibold cursor-pointer ${
                          activeCategory === cat
                            ? "text-green-800 underline"
                            : "text-green-600 hover:text-green-700"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/inspire/moving-stories/${PROPERTY_NEWS_SIDEBAR_STORY.slug}`}
                className="group relative block overflow-hidden rounded-md bg-slate-200 aspect-[4/3] cursor-pointer"
              >
                <img
                  src={PROPERTY_NEWS_SIDEBAR_STORY.image}
                  alt={PROPERTY_NEWS_SIDEBAR_STORY.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-3 right-3 bottom-3">
                  <div className="bg-white rounded-md p-3 shadow-md">
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold mb-1.5">
                      <Home className="w-3.5 h-3.5" />
                      Moving Stories
                    </div>
                    <p className="text-[14px] font-bold text-slate-900 leading-snug">
                      {PROPERTY_NEWS_SIDEBAR_STORY.title}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-0.5 text-sm font-bold text-green-600">
                      {PROPERTY_NEWS_SIDEBAR_STORY.cta}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>

              <div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">
                  Follow us
                </h3>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Facebook, label: "Facebook" },
                    { icon: Twitter, label: "Twitter" },
                    { icon: Instagram, label: "Instagram" },
                    { icon: Linkedin, label: "LinkedIn" },
                  ].map(({ icon: Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className="w-10 h-10 rounded-full bg-[#f0f0f0] text-slate-700 flex items-center justify-center hover:bg-green-100 hover:text-green-700 transition-colors cursor-pointer"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
