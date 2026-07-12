"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Home, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const propertyTypes = [
  {
    id: "buy",
    title: "Buy",
    description: "Find your dream home with our extensive collection of properties for sale",
    icon: Home,
    features: [
      "Wide selection of properties",
      "Detailed listings with photos",
      "Price negotiation options",
      "Legal documentation support",
    ],
    link: "/buy",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "long-rent",
    title: "Rent",
    description: "Secure your perfect rental home with transparent terms and fair pricing",
    icon: TrendingUp,
    features: [
      "Affordable monthly rates",
      "Flexible lease terms",
      "Verified landlords",
      "Maintenance support included",
    ],
    link: "/rent/long-rent",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "short-rent",
    title: "Short Stay",
    description: "Book furnished apartments and homes for short stays with flexibility",
    icon: Clock,
    features: [
      "Flexible booking periods",
      "Fully furnished options",
      "Quick check-in process",
      "24/7 customer support",
    ],
    link: "/rent/short-rent",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },

];

export default function PropertyTypesSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm font-medium">Property Categories</span>
          </div>
          <h2 className="font-spartan text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Explore Property Options
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you want to buy, rent short-term, or find a long-term home, we have the perfect option for you
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {propertyTypes.map((property, index) => {
            const IconComponent = property.icon;
            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredCard(property.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`relative group cursor-pointer transition-all duration-300 ${hoveredCard === property.id ? "scale-105" : ""
                  }`}
              >
                {/* Card */}
                <div
                  className={`h-full ${property.bgColor} border ${property.borderColor} rounded-2xl p-8 transition-all duration-300 ${hoveredCard === property.id ? "shadow-2xl" : "shadow-lg"
                    }`}
                >
                  {/* Icon */}
                  <div className={`inline-block p-4 rounded-xl bg-gradient-to-br ${property.color} mb-6`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 mb-6">{property.description}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {property.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${property.color} mt-2 flex-shrink-0`} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={property.link}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r ${property.color} text-white font-semibold transition-all duration-300 ${hoveredCard === property.id ? "gap-3 pr-4" : ""
                      }`}
                  >
                    Explore {property.title}
                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Floating decoration */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${property.color} opacity-0 blur-xl transition-opacity duration-300 -z-10 ${hoveredCard === property.id ? "opacity-20" : ""
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
