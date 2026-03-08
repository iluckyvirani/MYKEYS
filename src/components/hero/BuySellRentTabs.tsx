"use client";

import { Home, TrendingUp, Key, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function BuySellRentTabs({ selectedTab, onTabChange }: { selectedTab: "all" | "buy" | "short-rent" | "long-rent" | "" ; onTabChange: (tab: "all" | "buy" | "short-rent" | "long-rent") => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    // { id: "all", label: "All Properties", icon: Home },
    { id: "buy", label: "BUY", icon: Home },
    { id: "short-rent", label: "Short Rent", icon: Clock },
    { id: "long-rent", label: "Long Rent", icon: Calendar },
  ];

  const activeTabIndex = tabs.findIndex(tab => tab.id === selectedTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div
        ref={containerRef}
        className="relative bg-white/10 backdrop-blur-sm rounded-[5px] p-2"
      >
        {/* Smooth Sliding Background - Only show when tab is selected */}
        {activeTabIndex !== -1 && (
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
        )}

        {/* Tabs */}
        <div className="relative flex z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabIndex === tabs.findIndex(t => t.id === tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as "buy" | "short-rent" | "long-rent")}
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