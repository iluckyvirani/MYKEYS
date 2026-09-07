"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BuySearchFiltersForm from "@/components/buy/BuySearchFiltersForm";
import { filtersFromSearchParams } from "@/lib/buySearch";

function BuySearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);

  useEffect(() => {
    if (!filters.location.trim()) {
      router.replace("/buy");
    }
  }, [filters.location, router]);

  if (!filters.location.trim()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting…</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <BuySearchFiltersForm initial={filters} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function BuySearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading filters…</p>
        </div>
      }
    >
      <BuySearchPageContent />
    </Suspense>
  );
}
