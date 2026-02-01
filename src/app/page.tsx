"use client";

import { useState } from "react";
import HeroSection from "@/components/hero/HeroSection";
import Navbar from "@/components/layout/Navbar";
import FeaturedPropertiesComponent from "@/components/property/FeaturedProperties";
import StatsSection from "@/components/sections/StatsSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSectionWrapper />
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
