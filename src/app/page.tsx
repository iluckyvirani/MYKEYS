import HeroSection from "@/components/hero/HeroSection";
import Navbar from "@/components/layout/Navbar";
import FeaturedProperties from "@/components/property/FeaturedProperties";
import StatsSection from "@/components/sections/StatsSection";
import { TestimonialsSection } from "@/components/testimonials";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <StatsSection />
      <Footer />
    </>
  );
}
