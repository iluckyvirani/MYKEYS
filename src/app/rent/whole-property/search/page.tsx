"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RentSearchFiltersForm from "@/components/rent/RentSearchFiltersForm";
import { filtersFromSearchParams } from "@/lib/rentSearch";

function WholePropertySearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = filtersFromSearchParams(searchParams);

  useEffect(() => {
    if (!filters.location.trim()) {
      router.replace("/rent/whole-property");
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
          <RentSearchFiltersForm initial={filters} kind="whole-property" />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function WholePropertySearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading filters…</p>
        </div>
      }
    >
      <WholePropertySearchContent />
    </Suspense>
  );
}
