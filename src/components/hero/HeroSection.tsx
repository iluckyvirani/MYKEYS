"use client";

import { motion } from "framer-motion";
import BuySellRentTabs from "./BuySellRentTabs";
import PropertySearchBar from "../search/PropertySearchBar";
import { useState } from "react";
import { useHomeContent } from "@/hooks/useHomeContent";

export default function HeroSection({
  selectedTab: propSelectedTab,
  onTabChange: propOnTabChange,
}: {
  selectedTab: "all" | "buy" | "short-rent" | "long-rent";
  onTabChange: (tab: "all" | "buy" | "short-rent" | "long-rent") => void;
}) {
  const [localSelectedTab, setLocalSelectedTab] = useState<
    "all" | "buy" | "short-rent" | "long-rent"
  >(propSelectedTab);
  const { content } = useHomeContent();
  const hero = content.hero;

  const handleTabChange = (tab: "all" | "buy" | "short-rent" | "long-rent") => {
    setLocalSelectedTab(tab);
    propOnTabChange(tab);
  };

  return (
    <section className="relative h-screen min-h-175 flex items-center justify-center overflow-hidden bg-white">
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-bold text-gray-900 mb-1 leading-tight tracking-tight">
              {hero.title}
              <span className="block text-green-600 mt-1">
                {hero.titleHighlight}
              </span>
            </h1>

            <p className="font-spartan text-lg sm:text-xl text-gray-600 max-w-lg mx-auto mb-10 font-light">
              {hero.subtitle}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <BuySellRentTabs
            selectedTab={localSelectedTab}
            onTabChange={handleTabChange}
          />
        </motion.div>

        {localSelectedTab !== "all" && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <PropertySearchBar selectedType={localSelectedTab} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
