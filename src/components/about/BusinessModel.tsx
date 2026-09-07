"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  MessageSquare,
  DollarSign,
  Shield,
  Zap,
  Lock,
  Calculator,
  TrendingUp,
  Hotel,
  Building2,
} from "lucide-react";
import type { AboutPageContent } from "@/lib/content/aboutDefaults";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/content/aboutDefaults";

const FEATURE_META = [
  { icon: CreditCard, color: "from-green-500 to-emerald-600" },
  { icon: MessageSquare, color: "from-blue-500 to-cyan-600" },
  { icon: DollarSign, color: "from-purple-500 to-violet-600" },
  { icon: Shield, color: "from-amber-500 to-orange-600" },
  { icon: Zap, color: "from-green-500 to-emerald-600" },
  { icon: Lock, color: "from-red-500 to-pink-600" },
];

const REVENUE_META = [
  {
    icon: Hotel,
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
  },
  {
    icon: Building2,
    color: "bg-gradient-to-r from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    color: "bg-gradient-to-r from-purple-500 to-violet-500",
  },
  {
    icon: Calculator,
    color: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
];

export default function BusinessModel({
  content = DEFAULT_ABOUT_CONTENT.businessModel,
}: {
  content?: AboutPageContent["businessModel"];
}) {
  const features = content.features?.length
    ? content.features
    : DEFAULT_ABOUT_CONTENT.businessModel.features;
  const revenue = content.revenue?.length
    ? content.revenue
    : DEFAULT_ABOUT_CONTENT.businessModel.revenue;
  const winStats = content.winStats?.length
    ? content.winStats
    : DEFAULT_ABOUT_CONTENT.businessModel.winStats;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            {content.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
            <span className="block text-green-600">{content.titleHighlight}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {features.map((feature, index) => {
            const meta = FEATURE_META[index % FEATURE_META.length];
            const Icon = meta.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[5px] shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 bg-linear-to-r ${meta.color} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <div className="text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {feature.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          feature.model === "Short Term"
                            ? "bg-green-100 text-green-700"
                            : feature.model === "Long Term"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {feature.model}
                      </span>
                    </div>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Revenue Streams */}
        <div className="bg-linear-to-br from-gray-900 to-black rounded-[5px] p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              {content.revenueTitle}
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              {content.revenueSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {revenue.map((stream, index) => {
              const meta = REVENUE_META[index % REVENUE_META.length];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-[5px] p-6 border border-white/20"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${meta.color} flex items-center justify-center mb-4`}
                  >
                    <div className="text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">
                    {stream.type}
                  </h4>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stream.percentage}
                  </div>
                  <p className="text-gray-300 text-sm">{stream.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Value Proposition */}
          <div className="mt-12 p-6 bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-[5px] border border-green-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {content.winTitle}
                </h4>
                <p className="text-gray-200">{content.winSubtitle}</p>
              </div>
              <div className="flex items-center gap-4">
                {winStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-green-300 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
