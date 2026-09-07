import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PROPERTY_NEWS } from "@/lib/propertyNews";
import { getInspireItemsServer } from "@/lib/content/getInspireItemsServer";
import type { PropertyNewsItemsContent } from "@/lib/content/inspireItems";

export function generateStaticParams() {
  return PROPERTY_NEWS.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = true;

export default async function PropertyNewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { items } =
    await getInspireItemsServer<PropertyNewsItemsContent>("property-news");
  const article = items.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/inspire/property-news"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Property news
          </Link>

          <div className="flex items-center gap-2 text-[13px] mb-3">
            <span className="w-[2px] h-3.5 bg-green-600 shrink-0" aria-hidden />
            <span className="font-semibold text-green-700">
              {article.category}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{article.date}</span>
          </div>

          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#1a1a2e] leading-tight">
            {article.title}
          </h1>
          {article.summary ? (
            <p className="mt-3 text-lg text-slate-600">{article.summary}</p>
          ) : null}

          <div className="mt-8 relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
            <img
              src={article.image}
              alt={article.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="mt-8 space-y-4 text-slate-700 leading-relaxed text-[1.05rem]">
            <p>
              Stay informed with the latest housing-market insights, buyer
              trends, and home-moving updates from MYKEYS. This article breaks
              down what matters — and how it could affect your next move.
            </p>
            <p>
              Whether you&apos;re buying, selling, or renting, understanding
              the wider market helps you make confident decisions. Explore more
              guides and stories across our Inspire section.
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
              href="/inspire/moving-stories"
              className="inline-flex h-11 items-center px-5 rounded-lg border border-gray-300 text-slate-800 font-bold hover:border-green-500 cursor-pointer"
            >
              Moving Stories
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
