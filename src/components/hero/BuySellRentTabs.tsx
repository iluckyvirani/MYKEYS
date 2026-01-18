"use client";

import { Home, TrendingUp, Key, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

export default function BuySellRentTabs() {
  // CHANGED: Updated tab structure to match your business model
  const [activeTab, setActiveTab] = useState<"buy" | "short-rent" | "long-rent">("buy");
  const containerRef = useRef<HTMLDivElement>(null);

  // UPDATED: Changed "Sell" to "Short Stay" and "Rent" to "Long Rent"
  const tabs = [
    { id: "buy", label: "Buy", icon: Home, description: "Purchase Properties" },
    { id: "short-rent", label: "Short Stay", icon: Clock, description: "Airbnb-style Rentals" },
    { id: "long-rent", label: "Long Rent", icon: Calendar, description: "2+ Months Rental" },
  ];

  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div 
        ref={containerRef}
        className="relative bg-white/10 backdrop-blur-sm rounded-[5px] rounded-br-none rounded-bl-none p-2"
      >
        {/* Smooth Sliding Background */}
        <motion.div
          className="absolute rounded-[5px] bg-linear-to-r from-green-500 to-emerald-500 shadow-lg"
          animate={{
            x: `${activeTabIndex * (100 / 3) * 3}%`,
            width: "32%",
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
          style={{
            height: "calc(100% - 16px)",
            top: 8,
          }}
        />

        {/* Tabs */}
        <div className="relative flex z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "buy" | "short-rent" | "long-rent")}
                className="relative flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-[5px] cursor-pointer font-medium transition-colors duration-300 z-20 min-w-30"
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-green-500'}`} />
                </motion.div>
                <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-green-500'}`}>
                  {tab.label}
                </span>
                {/* <span className={`text-xs ${isActive ? 'text-white/90' : 'text-green-400/70'}`}>
                  {tab.description}
                </span> */}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}