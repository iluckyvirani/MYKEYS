"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Building, TrendingUp, Building2, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AboutPageContent } from "@/lib/content/aboutDefaults";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/content/aboutDefaults";

const CARD_META = [
  {
    icon: Hotel,
    iconClass: "from-green-500 to-emerald-600",
    hoverBorder: "hover:border-green-400/50",
  },
  {
    icon: Building2,
    iconClass: "from-blue-500 to-cyan-600",
    hoverBorder: "hover:border-blue-400/50",
  },
  {
    icon: TrendingUp,
    iconClass: "from-purple-500 to-violet-600",
    hoverBorder: "hover:border-purple-400/50",
  },
];

export default function HeroBanner({
  content = DEFAULT_ABOUT_CONTENT.hero,
}: {
  content?: AboutPageContent["hero"];
}) {
  const cards = content.cards?.length
    ? content.cards
    : DEFAULT_ABOUT_CONTENT.hero.cards;

  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden bg-white border-b border-gray-100">
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-gray-900 mb-1 leading-tight tracking-tight">
              {content.title}
              <span className="block text-green-600 mt-1">
                {content.titleHighlight}
              </span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-600 max-w-lg mx-auto mb-5 font-light">
              {content.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-[5px] h-12 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              >
                <Link href="/how-listing-works">
                  <Building className="w-5 h-5 mr-2" />
                  {content.primaryCta || "List Your Property"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer px-8 py-6 rounded-[5px] text-lg"
              >
                <Link href="/buy">
                  <Home className="w-5 h-5 mr-2" />
                  {content.secondaryCta || "Find Properties"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10"
        >
          {cards.map((card, index) => {
            const meta = CARD_META[index % CARD_META.length];
            const Icon = meta.icon;
            return (
              <Link
                key={`${card.href}-${index}`}
                href={card.href}
                className={`block bg-gray-50 rounded-[5px] p-6 border border-gray-100 ${meta.hoverBorder} transition-all duration-300 hover:scale-105`}
              >
                <div
                  className={`w-12 h-12 bg-linear-to-br ${meta.iconClass} rounded-lg flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600">{card.description}</p>
              </Link>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
}
