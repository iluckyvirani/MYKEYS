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
