"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS,
  getFaqCategoryColor,
  getFaqCategoryIcon,
} from "@/lib/faq/constants";
import { FaqCategoryType, FaqItem } from "@/types/faq";

interface DynamicFAQSectionProps {
  categories: FaqCategoryType[];
  limit?: number;
  featuredOnly?: boolean;
  variant?: "accordion" | "cards";
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  showCategoryFilters?: boolean;
  compact?: boolean;
  showSupportCta?: boolean;
  className?: string;
}

export default function DynamicFAQSection({
  categories,
  limit,
  featuredOnly = false,
  variant = "accordion",
  title = "Frequently Asked Questions",
  subtitle,
  showViewAll = false,
  viewAllHref = "/faq",
  showCategoryFilters = false,
  compact = false,
  showSupportCta = false,
  className = "",
}: DynamicFAQSectionProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FaqCategoryType | "all">("all");

  const filterCategories = useMemo(
    () => FAQ_CATEGORIES.filter((c) => categories.includes(c.id)),
    [categories]
  );

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("category", categories.join(","));
        if (featuredOnly) params.set("featured", "true");
        if (limit) params.set("limit", String(limit));

        const response = await api.get(`/faqs?${params.toString()}`);
        setFaqs(response.data?.data || []);
      } catch {
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [categories, featuredOnly, limit]);

  const filteredFaqs =
    activeCategory === "all" ? faqs : faqs.filter((faq) => faq.category === activeCategory);

  const wrapperClass = compact
    ? `bg-white rounded-xl border border-gray-200 p-5 ${className}`
    : `bg-white rounded-[5px] shadow-lg overflow-hidden border border-gray-100 ${className}`;

  if (loading) {
    return (
      <div className={`${wrapperClass} flex justify-center py-12`}>
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className={wrapperClass}>
      <div className={compact ? "" : "p-8"}>
        <div className={`${compact ? "mb-4" : "mb-8"} ${variant === "cards" ? "text-center" : ""}`}>
          {!compact && (
            <div className={`flex items-center gap-3 ${variant === "cards" ? "justify-center" : ""}`}>
              <HelpCircle className="w-6 h-6 text-green-600" />
              <h3 className={`font-bold text-gray-900 ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>
            </div>
          )}
          {compact && <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>}
          {subtitle && (
            <p className={`text-gray-600 ${compact ? "text-sm" : "mt-2"} ${variant === "cards" ? "max-w-2xl mx-auto" : ""}`}>
              {subtitle}
            </p>
          )}
        </div>

        {showCategoryFilters && filterCategories.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              All
            </button>
            {filterCategories.map((category) => {
              const Icon = getFaqCategoryIcon(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        )}

        {variant === "cards" ? (
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="text-left p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h5 className="font-bold text-gray-900 mb-2">{faq.question}</h5>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const Icon = getFaqCategoryIcon(faq.category);
              return (
                <div key={faq.id} className="border border-gray-200 rounded-[5px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${getFaqCategoryColor(faq.category)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${
                        openFaq === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          <p className="text-gray-600 mb-4">{faq.answer}</p>
                          {faq.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {faq.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {showCategoryFilters && (
                            <p className="text-xs text-gray-400 mt-3">
                              {FAQ_CATEGORY_LABELS[faq.category]}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {showViewAll && (
          <div className={`${variant === "cards" ? "mt-8 text-center" : "mt-8 flex justify-center"}`}>
            <Button asChild variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50">
              <Link href={viewAllHref}>View All FAQ</Link>
            </Button>
          </div>
        )}

        {showSupportCta && (
          <div className="mt-12 p-6 bg-linear-to-r from-green-50 to-emerald-50 rounded-[5px] border border-green-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h4>
                <p className="text-gray-600">
                  Can&apos;t find what you&apos;re looking for? Our support team is ready to help.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-green-600 text-white rounded-[5px] font-medium hover:bg-green-700 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
