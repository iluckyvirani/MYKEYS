import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MOVING_STORIES, SIDEBAR_FEATURED_STORY } from "@/lib/movingStories";

const ALL_STORIES = [...MOVING_STORIES, SIDEBAR_FEATURED_STORY];

export function generateStaticParams() {
  return ALL_STORIES.map((s) => ({ slug: s.slug }));
}

export default async function MovingStoryArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = ALL_STORIES.find((s) => s.slug === slug);

  if (!story) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/inspire/moving-stories"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Moving Stories
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            {story.title}
          </h1>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            {story.excerpt === "Read more" || story.excerpt.includes("story")
              ? "A MYKEYS moving story about finding the right home, and what made the move worthwhile."
              : story.excerpt}
          </p>

          <div className="mt-8 relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
            <img
              src={story.image}
              alt={story.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

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
