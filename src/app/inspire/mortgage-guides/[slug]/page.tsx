import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MORTGAGE_SECTIONS } from "@/lib/mortgageGuides";
import { getInspireItemsServer } from "@/lib/content/getInspireItemsServer";
import type { MortgageItemsContent } from "@/lib/content/inspireItems";

const DEFAULT_ALL = MORTGAGE_SECTIONS.flatMap((s) =>
  s.guides.map((g) => ({ ...g, sectionTitle: s.title }))
);

export function generateStaticParams() {
  return DEFAULT_ALL.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = true;

export default async function MortgageGuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { sections } =
    await getInspireItemsServer<MortgageItemsContent>("mortgage-guides");
  const allGuides = sections.flatMap((s) =>
    s.guides.map((g) => ({ ...g, sectionTitle: s.title }))
  );
  const guide = allGuides.find((g) => g.slug === slug);
  if (!guide) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <article className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-14">
          <Link
            href="/inspire/mortgage-guides"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Mortgage guides
          </Link>

          <p className="text-sm font-semibold text-green-700 mb-2">
            {guide.sectionTitle}
          </p>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#1a1a2e] leading-tight">
            {guide.title}
          </h1>
          {guide.minutes ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {guide.minutes} min read
            </p>
          ) : null}

          {guide.image ? (
            <div className="mt-8 relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
              <img
                src={guide.image}
                alt={guide.imageAlt || guide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-8 space-y-4 text-slate-700 leading-relaxed text-[1.05rem]">
            <p>
              Getting a mortgage is one of the biggest steps in buying a home.
              This MYKEYS guide explains the key points so you can move forward
              with more confidence.
            </p>
            <p>
              Always speak to a qualified mortgage adviser before making
              financial decisions. Your home may be repossessed if you do not
              keep up repayments on your mortgage.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/inspire/mortgage-guides"
              className="inline-flex h-11 items-center px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer"
            >
              More mortgage guides
            </Link>
            <Link
              href="/buy"
              className="inline-flex h-11 items-center px-5 rounded-lg border border-gray-300 text-slate-800 font-bold hover:border-green-500 cursor-pointer"
            >
              Browse homes for sale
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
