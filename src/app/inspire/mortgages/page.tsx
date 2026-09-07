"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import MortgageCalculator from "@/components/inspire/MortgageCalculator";

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
            Work out what you could pay each month, then explore MYKEYS guides
            and homes for sale.
          </p>

          <div className="mb-12">
            <MortgageCalculator />
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
                <Home className="w-4 h-4 mr-2" />
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
