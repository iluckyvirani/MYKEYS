import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
// import LongRentHero from "@/components/Rent/LongRentHero";
import BuyFilters from "@/components/search/BuyFilters"; // Reuse or create LongRentFilters
import PropertyGrid from "@/components/property/PropertyGrid";
import LongRentHero from "@/components/Rent/LongRentHero";
import HowLongRentWorks from "@/components/Rent/HowLongRentWorks";
// import HowLongRentWorks from "@/components/Rent/HowLongRentWorks";

export default function LongRentPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Banner with search */}
        <LongRentHero />
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters (25%) */}
            <div className="lg:w-1/4">
              <BuyFilters /> {/* You can create a specific LongRentFilters component */}
            </div>
            
            {/* Right Content - Property Grid (75%) */}
            <div className="lg:w-3/4">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Long Term Rentals
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">2,347</span> properties available for long term rent in London
                </p>
              </div>
              
              <PropertyGrid />
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <HowLongRentWorks />
      </main>
      <Footer />
    </>
  );
}