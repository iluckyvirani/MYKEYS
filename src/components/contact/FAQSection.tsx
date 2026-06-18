"use client";

import DynamicFAQSection from "@/components/faq/DynamicFAQSection";
import { FAQ_CATEGORIES } from "@/lib/faq/constants";

const ALL_FAQ_CATEGORIES = FAQ_CATEGORIES.map((c) => c.id);

export default function FAQSection() {
  return (
    <DynamicFAQSection
      categories={ALL_FAQ_CATEGORIES}
      showCategoryFilters
      showViewAll
      viewAllHref="/faq"
      showSupportCta
      title="Frequently Asked Questions"
    />
  );
}
