import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ENERGY_SECTIONS } from "@/lib/energyEfficiency";

const ALL_GUIDES = ENERGY_SECTIONS.flatMap((s) =>
  s.guides.map((g) => ({ ...g, sectionTitle: s.title }))
);

export function generateStaticParams() {
  return ALL_GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function EnergyGuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = ALL_GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/inspire/energy-efficiency"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Greener Homes
          </Link>

          <p className="text-sm font-semibold text-green-700 mb-2">
            {guide.sectionTitle}
          </p>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#1a1a2e] leading-tight">
            {guide.title}
          </h1>

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
              Making greener choices at home can lower bills, improve comfort,
              and increase long-term value. This MYKEYS guide covers the
              essentials so you can take the next step with confidence.
            </p>
            <p>
              Explore more energy-efficiency guides, compare properties, and
              find a home that works better for your lifestyle — and the
              planet.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/inspire/energy-efficiency"
              className="inline-flex h-11 items-center px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer"
            >
              More greener homes guides
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
