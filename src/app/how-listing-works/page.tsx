import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ListingHero from "@/components/listing/ListingHero";
import HowItWorksSteps from "@/components/listing/HowItWorksSteps";
import OwnerDashboardDemo from "@/components/listing/OwnerDashboardDemo";
import PropertyRegistrationFlow from "@/components/listing/PropertyRegistrationFlow";
import CTASection from "@/components/listing/CTASection";
import FeaturedPropertiesBenefits from "@/components/listing/FeaturedPropertiesBenefits";
import PackagesComparison from "@/components/listing/PackagesComparison";
// import PackagesComparison from '@/components/listing/PackagesComparison';
// import FeaturedPropertiesBenefits from '@/components/listing/FeaturedPropertiesBenefits';
// import CTASection from '@/components/listing/CTASection';


export default function HowListingWorksPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Banner */}
        <ListingHero />
        
        {/* How It Works Steps */}
        <HowItWorksSteps />
        
        {/* Owner Dashboard Demo */}
        <OwnerDashboardDemo />
        
        {/* Property Registration Flow */}
        <PropertyRegistrationFlow />
        
        {/* Packages Comparison */}
        {/* <PackagesComparison /> */}
        
        {/* Featured Properties Benefits */}
        <FeaturedPropertiesBenefits />
        
        {/* Call to Action */}
        <CTASection />
      </main>
      <Footer />
    </>
  );
}