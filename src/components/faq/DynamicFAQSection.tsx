"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, HelpCircle, Loader2, MessageCircle } from "lucide-react";
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
  variant?: "accordion" | "cards" | "spotlight";
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
  const [activeCategory, setActiveCategory] = useState<FaqCategoryType | "all">(
    "all"
  );

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
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  // ── Spotlight (homepage) ──────────────────────────────────────────
  if (variant === "spotlight") {
    if (loading) {
      return (
        <div className={`flex justify-center py-16 ${className}`}>
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      );
    }
    if (faqs.length === 0) return null;

    return (
      <div className={className}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] gap-10 lg:gap-14 items-start">
          {/* Intro */}
          <div className="lg:sticky lg:top-[100px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0f3d36] text-green-300 px-3 py-1 text-xs font-bold tracking-wide uppercase">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#0f3d36] leading-tight tracking-tight">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed max-w-md">
                {subtitle}
              </p>
            ) : null}

            <div className="mt-8 hidden lg:flex flex-col gap-3">
              {showViewAll ? (
                <Link
                  href={viewAllHref}
                  className="inline-flex h-11 items-center justify-center gap-2 px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm cursor-pointer transition-colors"
                >
                  View all FAQs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center gap-2 px-5 rounded-lg border border-[#0f3d36]/20 text-[#0f3d36] font-bold text-sm hover:bg-white cursor-pointer transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact support
              </Link>
            </div>
          </div>

          {/* Accordion list */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === faq.id;
              const Icon = getFaqCategoryIcon(faq.category);
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-white border-green-500/40 shadow-md shadow-green-900/5"
                      : "bg-white/80 border-slate-200/80 hover:border-green-400/50 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-start gap-4 cursor-pointer"
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        isOpen
                          ? "bg-green-600 text-white"
                          : "bg-[#0f3d36]/8 text-[#0f3d36]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`font-semibold leading-snug ${
                            isOpen ? "text-[#0f3d36]" : "text-slate-800"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                            isOpen
                              ? "rotate-180 text-green-600"
                              : "text-slate-400"
                          }`}
                        />
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Icon className="w-3.5 h-3.5 text-green-700" />
                        {FAQ_CATEGORY_LABELS[faq.category]}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                      >
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.25rem] sm:pl-[4.75rem]">
                          <div className="border-l-2 border-green-500 pl-4">
                            <p className="text-slate-600 leading-relaxed text-[15px]">
                              {faq.answer}
                            </p>
                            {faq.tags.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {faq.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-md bg-green-50 text-green-800 text-xs font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Mobile CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 lg:hidden">
              {showViewAll ? (
                <Link
                  href={viewAllHref}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 px-5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm cursor-pointer"
                >
                  View all FAQs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 px-5 rounded-lg border border-[#0f3d36]/20 text-[#0f3d36] font-bold text-sm cursor-pointer"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Default accordion / cards ─────────────────────────────────────
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
        <div
          className={`${compact ? "mb-4" : "mb-8"} ${
            variant === "cards" ? "text-center" : ""
          }`}
        >
          {!compact && (
            <div
              className={`flex items-center gap-3 ${
                variant === "cards" ? "justify-center" : ""
              }`}
            >
              <HelpCircle className="w-6 h-6 text-green-600" />
              <h3
                className={`font-bold text-gray-900 ${
                  compact ? "text-lg" : "text-2xl"
                }`}
              >
                {title}
              </h3>
            </div>
          )}
          {compact && (
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p
              className={`text-gray-600 ${compact ? "text-sm" : "mt-2"} ${
                variant === "cards" ? "max-w-2xl mx-auto" : ""
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {showCategoryFilters && filterCategories.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
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
              <div
                key={faq.id}
                className="text-left p-6 bg-white rounded-xl shadow-lg border border-gray-100"
              >
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
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-[5px] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(openFaq === faq.id ? null : faq.id)
                    }
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${getFaqCategoryColor(
                          faq.category
                        )}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {faq.question}
                      </span>
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
          <div
            className={`${
              variant === "cards" ? "mt-8 text-center" : "mt-8 flex justify-center"
            }`}
          >
            <Button
              asChild
              variant="outline"
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 cursor-pointer"
            >
              <Link href={viewAllHref}>View All FAQ</Link>
            </Button>
          </div>
        )}

        {showSupportCta && (
          <div className="mt-12 p-6 bg-linear-to-r from-green-50 to-emerald-50 rounded-[5px] border border-green-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Still have questions?
                </h4>
                <p className="text-gray-600">
                  Can&apos;t find what you&apos;re looking for? Our support team
                  is ready to help.
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-green-600 text-white rounded-[5px] font-medium hover:bg-green-700 transition-colors cursor-pointer"
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
