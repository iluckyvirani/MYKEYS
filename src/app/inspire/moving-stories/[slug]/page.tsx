import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPageContent } from "@/lib/content/pageContent";
import {
  DEFAULT_MOVING_STORIES_LIST,
  getAllMovingStories,
  mergeMovingStoriesList,
  MOVING_STORIES,
  SIDEBAR_FEATURED_STORY,
} from "@/lib/movingStories";

export function generateStaticParams() {
  return [...MOVING_STORIES, SIDEBAR_FEATURED_STORY].map((s) => ({
    slug: s.slug,
  }));
}

export const dynamicParams = true;

export default async function MovingStoryArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let list = DEFAULT_MOVING_STORIES_LIST;
  try {
    const content = await getPageContent("moving-stories");
    list = mergeMovingStoriesList(
      content.stories as Parameters<typeof mergeMovingStoriesList>[0]
    );
  } catch {
    // keep defaults
  }

  const story = getAllMovingStories(list).find((s) => s.slug === slug);

  if (!story) notFound();

  const intro =
    !story.excerpt ||
    story.excerpt === "Read more" ||
    story.excerpt.includes("story")
      ? "A MYKEYS moving story about finding the right home, and what made the move worthwhile."
      : story.excerpt;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <section className="relative w-full h-[min(78vh,720px)] min-h-[320px] bg-slate-200 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.image}
            alt={story.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />

          <div className="absolute inset-x-0 top-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 md:pt-6">
              <Link
                href="/inspire/moving-stories"
                className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Moving Stories
              </Link>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight max-w-3xl">
                {story.title}
              </h1>
            </div>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <p className="text-slate-600 text-lg leading-relaxed">{intro}</p>

          <div className="mt-8 space-y-4 text-slate-700 leading-relaxed text-[1.05rem]">
            <p>
              Moving home is rarely just about four walls — it&apos;s about
              lifestyle, community, and the moments that make a place feel like
              yours. This story captures why this move felt like the right one.
            </p>
            <p>
              From the first viewing to settling in, the journey shows how the
              right location, the right property, and the right timing can
              change everything. Whether you&apos;re buying, renting, or
              renovating, there&apos;s inspiration here for your next step.
            </p>
            <p>
              Ready to start your own move? Explore homes for sale and to rent
              on MYKEYS, or share your story so others can learn from your
              journey.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/buy"
              className="inline-flex h-11 items-center px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer"
            >
              Browse homes for sale
            </Link>
            <Link
              href="/rent/whole-property"
              className="inline-flex h-11 items-center px-5 rounded-lg border border-gray-300 text-slate-800 font-bold hover:border-green-500 cursor-pointer"
            >
              Browse homes to rent
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
