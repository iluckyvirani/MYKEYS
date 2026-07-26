"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Home,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Building2,
  TrendingUp,
  Hotel,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AboutPageContent } from "@/lib/content/aboutDefaults";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/content/aboutDefaults";

const STEP_META = [
  { icon: Search, color: "from-blue-500 to-cyan-500" },
  { icon: Home, color: "from-purple-500 to-violet-500" },
  { icon: Building2, color: "from-green-500 to-emerald-500" },
  { icon: CreditCard, color: "from-green-600 to-emerald-600" },
  { icon: MessageSquare, color: "from-blue-600 to-cyan-600" },
  { icon: CheckCircle, color: "from-amber-500 to-orange-500" },
];

const TRANSACTION_META = [
  {
    icon: Hotel,
    color: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
    textColor: "text-green-700",
    buttonColor: "bg-gradient-to-r from-green-600 to-emerald-600",
  },
  {
    icon: Building2,
    color: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
    textColor: "text-blue-700",
    buttonColor: "bg-gradient-to-r from-blue-600 to-cyan-600",
  },
  {
    icon: TrendingUp,
    color: "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200",
    textColor: "text-purple-700",
    buttonColor: "bg-gradient-to-r from-purple-600 to-violet-600",
  },
];

export default function HowItWorks({
  content = DEFAULT_ABOUT_CONTENT.howItWorks,
}: {
  content?: AboutPageContent["howItWorks"];
}) {
  const steps = content.steps?.length
    ? content.steps
    : DEFAULT_ABOUT_CONTENT.howItWorks.steps;
  const transactions = content.transactions?.length
    ? content.transactions
    : DEFAULT_ABOUT_CONTENT.howItWorks.transactions;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            {content.badge}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title}
            <span className="block text-blue-600">{content.titleHighlight}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="relative mb-20">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-green-500 via-blue-500 to-purple-500"></div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => {
              const meta = STEP_META[index % STEP_META.length];
              const Icon = meta.icon;
              const stepNumber = index + 1;
              return (
                <motion.div
                  key={stepNumber}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex flex-col md:flex-row items-center ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Step Content */}
                  <div
                    className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12"} mb-6 md:mb-0`}
                  >
                    <div className="bg-white rounded-[5px] shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`w-12 h-12 bg-linear-to-r ${meta.color} rounded-lg flex items-center justify-center`}
                        >
                          <div className="text-white text-xl font-bold">
                            {stepNumber}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {step.title}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            {step.types.map((type) => (
                              <span
                                key={type}
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  type === "Short"
                                    ? "bg-green-100 text-green-700"
                                    : type === "Long"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                      <div className="mt-4">
                        <div className="text-gray-400">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
                    <div
                      className={`w-12 h-12 bg-linear-to-r ${meta.color} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}
                    >
                      <div className="text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Empty div for layout */}
                  <div className="md:w-1/2"></div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Transaction Types Comparison */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {content.chooseTitle}
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            {content.chooseSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {transactions.map((transaction, index) => {
            const meta = TRANSACTION_META[index % TRANSACTION_META.length];
            const Icon = meta.icon;
            return (
              <motion.div
                key={transaction.type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-[5px] p-6 border ${meta.color}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`p-3 rounded-lg ${meta.color.split("bg-gradient-to-r ")[1].split(" ")[0].replace("from-", "bg-")} bg-opacity-20`}
                  >
                    <div className={meta.textColor}>
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {transaction.type}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {transaction.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Process:</div>
                  <div className="flex items-center justify-between text-sm">
                    {transaction.steps.split(" → ").map((stepLabel, idx) => (
                      <div key={idx} className="text-center">
                        <div
                          className={`w-8 h-8 rounded-full ${meta.textColor} bg-opacity-10 flex items-center justify-center mb-1`}
                        >
                          {idx + 1}
                        </div>
                        <div
                          className={`text-xs ${meta.textColor} font-medium`}
                        >
                          {stepLabel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Verified properties</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Secure transactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Direct communication</span>
                  </div>
                </div>

                <Button
                  asChild
                  className={`w-full ${meta.buttonColor} hover:opacity-90 text-white`}
                >
                  <Link href={transaction.href}>
                    Explore {transaction.type}
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-linear-to-r from-gray-900 to-black rounded-[5px] p-8 md:p-12 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            {content.ctaTitle}
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            {content.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 cursor-pointer rounded-[5px]"
            >
              <Link href="/signup">
                <Users className="w-5 h-5 mr-2" />
                {content.ctaPrimary}
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 rounded-[5px] border-white text-white hover:bg-white hover:text-gray-900 cursor-pointer px-8"
            >
              <Link href="/contact">{content.ctaSecondary}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
