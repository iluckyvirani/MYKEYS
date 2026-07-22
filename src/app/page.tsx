"use client";

import { useState } from "react";
import HeroSection from "@/components/hero/HeroSection";
import Navbar from "@/components/layout/Navbar";
import FeaturedPropertiesComponent from "@/components/property/FeaturedProperties";
import StatsSection from "@/components/sections/StatsSection";
import PropertyTypesSection from "@/components/sections/PropertyTypesSection";
import UseCasesSection from "@/components/sections/UseCasesSection";
import ServicesPromotionSection from "@/components/sections/ServicesPromotionSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import Footer from "@/components/layout/Footer";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSectionWrapper />
      <PropertyTypesSection />
      <UseCasesSection />
      <ServicesPromotionSection />
      <TestimonialsSection />
      <StatsSection />
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
            categories={["OWNER", "USER"]}
            limit={6}
            showViewAll
            viewAllHref="/faq?category=OWNER"
            title="Questions from our community"
            subtitle="Clear answers for guests and property owners using MYKEYS — from fees to bookings."
          />
        </div>
      </section>
      <Footer />
    </>
  );
}

function HeroSectionWrapper() {
  const [selectedTab, setSelectedTab] = useState<"all" | "buy" | "short-rent" | "long-rent">("buy");

  return (
    <>
      <HeroSection selectedTab={selectedTab} onTabChange={setSelectedTab} />
      <FeaturedPropertiesComponent selectedTab={selectedTab} />
    </>
  );
}
