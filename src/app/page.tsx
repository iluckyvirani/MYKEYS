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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <DynamicFAQSection
            categories={["OWNER", "USER"]}
            limit={6}
            showViewAll
            viewAllHref="/faq?category=OWNER"
            title="Questions from our community"
            subtitle="Help for guests and property owners using MYKEYS"
          />
        </div>
      </section>
      <Footer />
    </>
  );
}

function HeroSectionWrapper() {
  const [selectedTab, setSelectedTab] = useState<"all" | "buy" | "short-rent" | "long-rent">("all");

  return (
    <>
      <HeroSection selectedTab={selectedTab} onTabChange={setSelectedTab} />
      <FeaturedPropertiesComponent selectedTab={selectedTab} />
    </>
  );
}
