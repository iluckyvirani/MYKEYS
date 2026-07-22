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
  LIST_PAGE_SIZE,
  MOVING_STORIES,
  SIDEBAR_FEATURED_STORY,
  type MovingStory,
} from "@/lib/movingStories";

function OverlayCard({
  story,
  large = false,
}: {
  story: MovingStory;
  large?: boolean;
}) {
  return (
    <Link
      href={`/inspire/moving-stories/${story.slug}`}
      className="group relative block h-full min-h-[220px] overflow-hidden rounded-md bg-slate-200 cursor-pointer"
    >
      <img
        src={story.image}
        alt={story.imageAlt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
        <div className="flex gap-3">
          <span
            className="w-[3px] shrink-0 rounded-full bg-green-500 self-stretch min-h-[2.5rem]"
            aria-hidden
          />
          <div className="min-w-0">
            <h2
              className={`font-bold leading-snug ${
                large
                  ? "text-xl sm:text-2xl md:text-[1.65rem] max-w-lg"
                  : "text-[15px] sm:text-base"
              }`}
            >
              {story.title}
            </h2>
            <span className="mt-2 inline-flex items-center gap-0.5 text-sm font-semibold text-white/95 group-hover:text-green-200">
              {story.cta}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ListRow({ story }: { story: MovingStory }) {
  return (
    <article className="group">
      <Link
        href={`/inspire/moving-stories/${story.slug}`}
        className="flex gap-4 sm:gap-5 cursor-pointer"
      >
        <div className="relative w-[140px] sm:w-[180px] md:w-[200px] aspect-[16/11] shrink-0 overflow-hidden rounded-md bg-slate-100">
          <img
            src={story.image}
            alt={story.imageAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0 flex flex-col justify-center py-0.5">
          <h2 className="text-[1.05rem] sm:text-xl font-bold text-slate-900 leading-snug group-hover:text-green-700 transition-colors">
            {story.title}
          </h2>
          {story.excerpt ? (
            <p className="mt-1.5 text-sm text-slate-500">{story.excerpt}</p>
          ) : null}
          <span className="mt-2 inline-flex items-center gap-0.5 text-sm font-bold text-green-600">
            {story.cta}
          </span>
        </div>
      </Link>
    </article>
  );
}

function ShareSidebarBox() {
  return (
    <div className="bg-[#f6f6f6] rounded-md p-5 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
        We&apos;d love to hear your moving story
      </h3>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        Everyone has a moving story. Share yours with us for the chance to be
        featured on MYKEYS.
      </p>
      <Link
        href="/contact"
        className="mt-5 flex items-center justify-center w-full h-11 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors cursor-pointer"
      >
        Share your story
      </Link>
    </div>
  );
}

function SidebarFeaturedCard({ story }: { story: MovingStory }) {
  return (
    <Link
      href={`/inspire/moving-stories/${story.slug}`}
      className="group relative block overflow-hidden rounded-md bg-slate-200 aspect-[3/4] cursor-pointer"
    >
      <img
        src={story.image}
        alt={story.imageAlt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="absolute left-3 right-3 bottom-3 sm:left-4 sm:right-auto sm:bottom-4 sm:max-w-[85%]">
        <div className="bg-white rounded-md p-3.5 shadow-md">
          <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold mb-2">
            <Home className="w-3.5 h-3.5" />
            Moving Stories
          </div>
          <p className="text-[15px] font-bold text-slate-900 leading-snug">
            {story.title}
          </p>
          <span className="mt-2 inline-flex items-center gap-0.5 text-sm font-bold text-green-600 group-hover:text-green-700">
            {story.cta}
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FollowUs() {
  const links = [
    { icon: Facebook, label: "Facebook", href: "#" },
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Instagram, label: "Instagram", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">Follow us</h3>
      <div className="flex items-center gap-3">
        {links.map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="w-10 h-10 rounded-full bg-[#f0f0f0] text-slate-700 flex items-center justify-center hover:bg-green-100 hover:text-green-700 transition-colors cursor-pointer"
          >
            <Icon className="w-4 h-4" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function MovingStoriesPage() {
  const hero = MOVING_STORIES[0];
  const sideA = MOVING_STORIES[1];
  const sideB = MOVING_STORIES[2];

  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil((MOVING_STORIES.length - 3) / LIST_PAGE_SIZE)
  );

  const listStories = useMemo(() => {
    const listAll = MOVING_STORIES.slice(3);
    const start = (page - 1) * LIST_PAGE_SIZE;
    return listAll.slice(start, start + LIST_PAGE_SIZE);
  }, [page]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8 md:py-10">
          {/* Title */}
          <header className="mb-8 md:mb-10">
            <h1 className="text-[32px] sm:text-[36px] md:text-[40px] font-bold text-[#1a1a2e] tracking-tight leading-tight">
              Moving Stories
            </h1>
            <p className="mt-2.5 text-[15px] sm:text-base text-[#4a4a5a] max-w-3xl leading-relaxed font-normal">
              Homemovers share the stories behind their move, including why it
              ended up being the right move.
            </p>
          </header>

          {/* Hero mosaic: large left + 2 stacked right */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-10 md:mb-12">
            <div className="lg:col-span-2 min-h-[280px] sm:min-h-[360px] lg:min-h-[480px]">
              {hero && <OverlayCard story={hero} large />}
            </div>
            <div className="flex flex-col gap-3 sm:gap-4 min-h-[420px] lg:min-h-[480px]">
              <div className="flex-1 min-h-[200px]">
                {sideA && <OverlayCard story={sideA} />}
              </div>
              <div className="flex-1 min-h-[200px]">
                {sideB && <OverlayCard story={sideB} />}
              </div>
            </div>
          </section>

          {/* List + sidebar */}
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-10 lg:gap-12 items-start">
            <div>
              <div className="space-y-8 sm:space-y-10">
                {listStories.map((story) => (
                  <ListRow key={story.id} story={story} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="mt-10 flex flex-wrap items-center gap-2"
                  aria-label="Pagination"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`min-w-9 h-9 px-2.5 rounded text-sm font-bold cursor-pointer ${
                          page === n
                            ? "bg-green-600 text-white"
                            : "text-slate-800 border border-gray-200 hover:border-green-500"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}
                  {page < totalPages && (
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      className="h-9 px-3 rounded text-sm font-bold text-slate-800 border border-gray-200 hover:border-green-500 cursor-pointer"
                    >
                      Next
                    </button>
                  )}
                </nav>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-[96px]">
              <ShareSidebarBox />
              <SidebarFeaturedCard story={SIDEBAR_FEATURED_STORY} />
              <FollowUs />
            </aside>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
