"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";
import { FAQ_CATEGORIES } from "@/lib/faq/constants";
import { FaqCategoryType } from "@/types/faq";

const ALL_CATEGORIES = FAQ_CATEGORIES.map((c) => c.id);

function FaqPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category")?.toUpperCase();
  const initialCategory =
    categoryParam && ALL_CATEGORIES.includes(categoryParam as FaqCategoryType)
      ? (categoryParam as FaqCategoryType)
      : "all";

  const [activeCategory, setActiveCategory] = useState<FaqCategoryType | "all">(initialCategory);

  useEffect(() => {
    if (
      categoryParam &&
      ALL_CATEGORIES.includes(categoryParam as FaqCategoryType)
    ) {
      setActiveCategory(categoryParam as FaqCategoryType);
    }
  }, [categoryParam]);

  const displayCategories =
    activeCategory === "all" ? ALL_CATEGORIES : [activeCategory];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Help Center
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse answers by topic — listing, renting, buying, services, and more.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Topics
            </button>
            {FAQ_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <DynamicFAQSection
            categories={displayCategories}
            showCategoryFilters={activeCategory === "all"}
            showSupportCta
            title="Frequently Asked Questions"
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function FaqPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-500">Loading FAQs...</p>
        </div>
      }
    >
      <FaqPageContent />
    </Suspense>
  );
}
