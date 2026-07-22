import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  COUNTRY_GUIDES,
  getCountryGuide,
} from "@/lib/countryGuides";

export function generateStaticParams() {
  return COUNTRY_GUIDES.map((c) => ({ slug: c.slug }));
}

export default async function CountryGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getCountryGuide(slug);
  if (!guide) notFound();

  const others = COUNTRY_GUIDES.filter((c) => c.slug !== slug).slice(0, 3);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-[72px] md:pt-[80px]">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            href="/inspire/country-guides"
            className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-800 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Country guides
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <img
              src={`https://flagcdn.com/w40/${guide.flagCode}.png`}
              srcSet={`https://flagcdn.com/w80/${guide.flagCode}.png 2x`}
              alt={`${guide.name} flag`}
              width={40}
              height={30}
              className="w-10 h-7 object-cover rounded-[2px] shadow-sm"
            />
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              Country guide
            </p>
          </div>

          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#0f3d36] leading-tight">
            {guide.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            {guide.intro}
          </p>

          <div className="mt-8 relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
            <img
              src={guide.image}
              alt={guide.imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="mt-10 space-y-8">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0f3d36]">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-[1.05rem] text-slate-700 leading-relaxed">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={guide.blogHref}
              className="inline-flex h-11 items-center px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold cursor-pointer"
            >
              {guide.name} on our blog
            </Link>
            <Link
              href={guide.propertiesHref}
              className="inline-flex h-11 items-center px-5 rounded-lg border border-gray-300 text-slate-800 font-bold hover:border-green-500 cursor-pointer"
            >
              Browse properties
            </Link>
          </div>

          <p className="mt-8 text-xs text-slate-500 leading-relaxed">
            This guide is for general information only and is not legal or
            financial advice. Always take local professional advice before
            buying property overseas.
          </p>
        </article>

        {others.length > 0 ? (
          <section className="border-t border-gray-100 bg-[#fafafa]">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10">
              <h2 className="text-xl font-bold text-[#0f3d36] mb-6">
                More country guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {others.map((c) => (
                  <Link
                    key={c.id}
                    href={`/inspire/country-guides/${c.slug}`}
                    className="group overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <img
                        src={c.image}
                        alt={c.imageAlt}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[#0f3d36] group-hover:text-green-700">
                        {c.title}
                      </h3>
                      <img
                        src={`https://flagcdn.com/w40/${c.flagCode}.png`}
                        alt=""
                        width={28}
                        height={20}
                        className="w-7 h-5 object-cover rounded-[2px] shrink-0"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
