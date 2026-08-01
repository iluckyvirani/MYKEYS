"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentLocationSearch from "@/components/rent/RentLocationSearch";
import HowShortRentWorks from "@/components/rent/HowShortRentWorks";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";
import { useListingPageContent } from "@/hooks/useListingPageContent";

function ShortRentPageContent() {
  const searchParams = useSearchParams();
  const content = useListingPageContent("short-stay");
  const initialLocation =
    searchParams.get("location") ||
    searchParams.get("city") ||
    searchParams.get("zipCode") ||
    "";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white overflow-visible">
        <RentLocationSearch
          initialLocation={initialLocation}
          kind="short-rent"
          title={content.hero.title}
          placeholder={content.hero.placeholder}
          buttonLabel={content.hero.buttonLabel}
        />
        <div className="relative z-0">
          <HowShortRentWorks
            title={content.howItWorks.title}
            subtitle={content.howItWorks.subtitle}
            whyTitle={content.howItWorks.ctaTitle}
            benefits={content.howItWorks.benefits}
            stats={content.howItWorks.stats}
          />
          <section className="relative py-16 md:py-20 overflow-hidden bg-[#f3f8f7]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 12% 20%, rgba(84,201,196,0.35), transparent 42%), radial-gradient(circle at 88% 70%, rgba(182,119,42,0.18), transparent 40%)",
              }}
            />
            <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
              <DynamicFAQSection
                variant="spotlight"
                categories={["SHORT_RENT"]}
                showViewAll
                viewAllHref="/faq?category=SHORT_RENT"
                title={content.faq.title}
                subtitle={content.faq.subtitle}
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShortRentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading…</p>
        </div>
      }
    >
      <ShortRentPageContent />
    </Suspense>
  );
}
