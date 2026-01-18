
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BuyHero from "@/components/Buy/BuyHero";
import BuyFilters from "@/components/search/BuyFilters";
import PropertyGrid from "@/components/property/PropertyGrid";
import HowItWorks from "@/components/Buy/HowItWorks";

export default function BuyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Banner */}
        <BuyHero />
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters (25%) */}
            <div className="lg:w-1/4">
              <BuyFilters />
            </div>
            
            {/* Right Content - Property Grid (75%) */}
            <div className="lg:w-3/4">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Properties For Sale
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">1,248</span> properties found in London
                </p>
              </div>
              
              <PropertyGrid />
            </div>
          </div>
        </div>
      
        <HowItWorks />
        
      </main>
      <Footer />
    </>
  );
}