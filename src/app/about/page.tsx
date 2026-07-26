"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/about/HeroBanner";
import BusinessModel from "@/components/about/BusinessModel";
import HowItWorks from "@/components/about/HowItWorks";
import StatsSection from "@/components/about/StatsSection";
import { useAboutContent } from "@/hooks/useAboutContent";

export default function AboutPage() {
  const content = useAboutContent();

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <HeroBanner content={content.hero} />
        <BusinessModel content={content.businessModel} />
        <HowItWorks content={content.howItWorks} />
        <StatsSection content={content.stats} />
      </main>
      <Footer />
    </>
  );
}
