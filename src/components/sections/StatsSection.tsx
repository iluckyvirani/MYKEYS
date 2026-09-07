"use client";

import { motion } from "framer-motion";
import {
  Award,
  Building2,
  Users,
  ShieldCheck,
  Clock,
  Star,
  Home,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { useHomeContent } from "@/hooks/useHomeContent";

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Building2,
  Users,
  ShieldCheck,
  Clock,
  Star,
  Home,
  Globe,
};

export default function StatsSection() {
  const { content } = useHomeContent();
  const { badge, title, titleHighlight, subtitle, items, additionalStats } =
    content.stats;

  return (
    <>
      <section className="relative overflow-hidden py-24 md:py-32 bg-white border-t border-b border-gray-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-500/10 to-emerald-500/10 text-green-700 px-4 py-2 rounded-full mb-4 border border-green-500/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">{badge}</span>
            </div>

            <h2 className="font-spartan text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              {title}
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600 mt-1">
                {titleHighlight}
              </span>
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {items.map((stat, index) => {
              const Icon = ICON_MAP[stat.icon] || Building2;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-xs overflow-hidden transition-all duration-300 group-hover:shadow-md">
                    <div
                      className={`absolute inset-0 bg-linear-to-br ${stat.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative z-10 text-center">
                      <div
                        className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
                      >
                        <div className="text-white">
                          <Icon className="w-8 h-8" />
                        </div>
                      </div>

                      <div className="mb-2">
                        <motion.span
                          className="font-spartan text-5xl md:text-6xl font-bold text-gray-900"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.5 + index * 0.1,
                            type: "spring",
                            stiffness: 200,
                          }}
                        >
                          {stat.value}
                        </motion.span>
                      </div>

                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {stat.label}
                      </h4>
                      <p className="text-sm text-gray-600">{stat.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-xs"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(additionalStats || []).map((stat, index) => {
                const Icon = ICON_MAP[stat.icon] || Home;
                return (
                  <motion.div
                    key={`${stat.label}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group"
                  >
                    <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 hover:bg-gray-100/50 hover:shadow-xs transition-all duration-300">
                      <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-green-500/10 to-emerald-500/10 text-green-600 mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
