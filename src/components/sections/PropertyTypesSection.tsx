"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Clock, TrendingUp, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useHomeContent } from "@/hooks/useHomeContent";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Clock,
  TrendingUp,
};

export default function PropertyTypesSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { content } = useHomeContent();
  const { badge, title, subtitle, items } = content.categories;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium">{badge}</span>
          </div>
          <h2 className="font-spartan text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((property, index) => {
            const IconComponent = ICON_MAP[property.icon] || Home;
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredCard(property.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  hoveredCard === property.id ? "scale-105" : ""
                }`}
              >
                <div
                  className={`h-full ${property.bgColor} border ${property.borderColor} rounded-2xl p-8 transition-all duration-300 ${
                    hoveredCard === property.id ? "shadow-2xl" : "shadow-lg"
                  }`}
                >
                  <div
                    className={`inline-block p-4 rounded-xl bg-gradient-to-br ${property.color} mb-6`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{property.description}</p>

                  <ul className="space-y-3 mb-8">
                    {(property.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${property.color} mt-2 flex-shrink-0`}
                        />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={property.link}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r ${property.color} text-white font-semibold transition-all duration-300 ${
                      hoveredCard === property.id ? "gap-3 pr-4" : ""
                    }`}
                  >
                    Explore {property.title}
                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${property.color} opacity-0 blur-xl transition-opacity duration-300 -z-10 ${
                    hoveredCard === property.id ? "opacity-20" : ""
                  }`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
