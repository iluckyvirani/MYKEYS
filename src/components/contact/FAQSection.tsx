"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  ChevronDown,
  Hotel,
  Building2,
  TrendingUp,
  CreditCard,
  Shield,
  Users
} from "lucide-react";

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqCategories = [
    { id: "all", label: "All Questions", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "short", label: "Short Rent", icon: <Hotel className="w-4 h-4" /> },
    { id: "long", label: "Long Term", icon: <Building2 className="w-4 h-4" /> },
    { id: "buy", label: "Property Purchase", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "payment", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { id: "safety", label: "Trust & Safety", icon: <Shield className="w-4 h-4" /> },
    { id: "owner", label: "For Owners", icon: <Users className="w-4 h-4" /> },
  ];

  const faqs = [
    {
      id: "1",
      question: "How does short rent booking work?",
      answer: "Short rents work like Airbnb: browse properties, select check-in/out dates, book instantly, and pay securely. The payment is held by our platform and released to the owner after check-in confirmation.",
      category: "short",
      tags: ["booking", "payment", "short-stay"]
    },
    {
      id: "2",
      question: "What's the minimum stay for long term rentals?",
      answer: "Long term rentals require a minimum stay of 2 months. Most owners prefer 6-12 month agreements. You can filter properties by minimum duration on the search page.",
      category: "long",
      tags: ["duration", "rental", "long-term"]
    },
    {
      id: "3",
      question: "How do property purchases work on your platform?",
      answer: "For property purchases, you send inquiries directly to owners. We facilitate the connection and provide document verification. Final negotiations and transactions happen directly between buyer and seller with our support.",
      category: "buy",
      tags: ["purchase", "inquiry", "verification"]
    },
    {
      id: "4",
      question: "How are payments secured for short rents?",
      answer: "We use escrow services for short rent payments. Your payment is held securely until 24 hours after check-in. If there are any issues, our support team mediates between parties.",
      category: "payment",
      tags: ["security", "escrow", "short-stay"]
    },
    {
      id: "5",
      question: "How are properties and owners verified?",
      answer: "We conduct thorough verification including ID checks, property documentation review, and in some cases, physical inspections. All verified properties and owners have a badge on their listings.",
      category: "safety",
      tags: ["verification", "safety", "trust"]
    },
    {
      id: "6",
      question: "What commission do you charge property owners?",
      answer: "Commission varies by service: 10-15% for short rents, 5-8% for long term rentals (one month's rent), and 1.5-3.5% for property sales. We offer different packages with varying commission rates.",
      category: "owner",
      tags: ["commission", "fees", "owners"]
    },
    {
      id: "7",
      question: "Can I book a short rent for just one night?",
      answer: "Minimum stay requirements vary by property. Most short rent properties require 2-night minimum, especially on weekends. You can filter by minimum nights during search.",
      category: "short",
      tags: ["minimum-stay", "short-stay", "booking"]
    },
    {
      id: "8",
      question: "How quickly do owners respond to inquiries?",
      answer: "Most owners respond within 24 hours. Our platform shows owner response rates and average response times on each listing. You can also message multiple owners simultaneously.",
      category: "long",
      tags: ["response-time", "communication", "owners"]
    },
  ];

  const filteredFaqs = activeCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="bg-white rounded-[5px] shadow-lg overflow-hidden border border-gray-100">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-[5px] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    faq.category === "short" ? "bg-green-100 text-green-600" :
                    faq.category === "long" ? "bg-blue-100 text-blue-600" :
                    faq.category === "buy" ? "bg-purple-100 text-purple-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {faq.category === "short" ? <Hotel className="w-4 h-4" /> :
                     faq.category === "long" ? <Building2 className="w-4 h-4" /> :
                     faq.category === "buy" ? <TrendingUp className="w-4 h-4" /> :
                     <HelpCircle className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-gray-900">{faq.question}</span>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 p-6 bg-linear-to-r from-green-50 to-emerald-50 rounded-[5px] border border-green-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h4>
              <p className="text-gray-600">Can't find what you're looking for? Our support team is ready to help.</p>
            </div>
            <div className="flex gap-4">
              <a 
                href="#live-chat" 
                className="px-6 py-3 bg-green-600 text-white rounded-[5px] font-medium hover:bg-green-700 transition-colors"
              >
                Live Chat
              </a>
              <a 
                href="mailto:support@propertyplatform.com" 
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-[5px] font-medium hover:bg-gray-50 transition-colors"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}