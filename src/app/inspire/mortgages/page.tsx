import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Home, Calculator } from "lucide-react";

export default function MortgagesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">
            Inspire
          </p>
          <h1 className="font-spartan text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Mortgages
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl">
            Explore mortgage guidance and tools to help you buy with confidence.
            Compare options and get ready for your next property move.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-100">
              <Calculator className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Plan your budget
              </h2>
              <p className="text-slate-600 text-sm">
                Understand deposits, monthly payments, and what you can afford before you make an offer.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-100">
              <Home className="w-8 h-8 text-green-600 mb-3" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Ready to buy?
              </h2>
              <p className="text-slate-600 text-sm">
                Browse homes for sale on MYKEYS and find a property that fits your mortgage plans.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/inspire/mortgage-guides">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]">
                Mortgage guides
              </Button>
            </Link>
            <Link href="/buy">
              <Button
                variant="outline"
                className="rounded-[5px] border-green-500 text-slate-800"
              >
                Browse properties for sale
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
