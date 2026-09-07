"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BuyLocationSearch from "@/components/buy/BuyLocationSearch";
import HowItWorks from "@/components/buy/HowItWorks";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";
import { useListingPageContent } from "@/hooks/useListingPageContent";

/** Kept for PropertyGrid / BuyFilters compatibility */
export interface BuyFiltersState {
  priceRange: [number, number];
  selectedTypes: string[];
  selectedBeds: number | null;
  selectedBaths: number | null;
  minRating: number;
  availableFrom: string;
  propertyPreferences: string[];
  searchLocation: string;
}

function BuyPageContent() {
  const searchParams = useSearchParams();
  const content = useListingPageContent("buy");
  const initialLocation =
    searchParams.get("location") ||
    searchParams.get("city") ||
    searchParams.get("zipCode") ||
    "";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white overflow-visible">
        <BuyLocationSearch
          initialLocation={initialLocation}
          title={content.hero.title}
          placeholder={content.hero.placeholder}
          buttonLabel={content.hero.buttonLabel}
        />
        <div className="relative z-0">
          <HowItWorks
            title={content.howItWorks.title}
            subtitle={content.howItWorks.subtitle}
            ctaTitle={content.howItWorks.ctaTitle}
            ctaSubtitle={content.howItWorks.ctaSubtitle}
            ctaButtonLabel={content.howItWorks.ctaButtonLabel}
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
                categories={["BUY"]}
                showViewAll
                viewAllHref="/faq?category=BUY"
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

export default function BuyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading…</p>
        </div>
      }
    >
      <BuyPageContent />
    </Suspense>
  );
}
