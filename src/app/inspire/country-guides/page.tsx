import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { COUNTRY_GUIDES, type CountryGuide } from "@/lib/countryGuides";

function CountryCard({ guide }: { guide: CountryGuide }) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col">
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={guide.image}
          alt={guide.imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0f3d36] leading-snug">
            {guide.title}
          </h2>
          <img
            src={`https://flagcdn.com/w40/${guide.flagCode}.png`}
            srcSet={`https://flagcdn.com/w80/${guide.flagCode}.png 2x`}
            alt={`${guide.name} flag`}
            width={32}
            height={24}
            className="w-8 h-6 object-cover rounded-[2px] shadow-sm shrink-0"
          />
        </div>
        <ul className="mt-4 space-y-2.5">
          <li>
            <Link
              href={`/inspire/country-guides/${guide.slug}`}
              className="text-[15px] font-semibold text-green-700 hover:text-green-800 cursor-pointer"
            >
              {guide.name} Buying Guide
            </Link>
          </li>
          <li>
            <Link
              href={guide.blogHref}
              className="text-[15px] font-semibold text-green-700 hover:text-green-800 cursor-pointer"
            >
              {guide.name} on our blog
            </Link>
          </li>
          <li>
            <Link
              href={guide.propertiesHref}
              className="text-[15px] font-semibold text-green-700 hover:text-green-800 cursor-pointer"
            >
              Properties in {guide.name}
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
}

export default function CountryGuidesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7f7f7] pt-[72px] md:pt-[80px]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-10 md:py-14">
          <h1 className="text-2xl sm:text-[1.85rem] font-bold text-[#0f3d36]">
            Country Guides - Guides to Top Destinations
          </h1>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {COUNTRY_GUIDES.map((guide) => (
              <CountryCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
