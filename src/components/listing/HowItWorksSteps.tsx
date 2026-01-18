"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  Home,
  DollarSign,
  MessageCircle,
  Calendar,
  FileCheck,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Create Account",
      description: "Sign up as a property owner. Verification takes less than 5 minutes.",
      icon: <UserPlus className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      step: 2,
      title: "List Property",
      description: "Add photos, details, and set your price. Choose Sell, Short Rent, or Long Rent.",
      icon: <Home className="w-6 h-6" />,
      color: "from-emerald-500 to-green-500",
      tags: ["Sell", "Short Rent", "Long Rent"],
    },
    {
      step: 3,
      title: "Choose Package",
      description: "Select Free, Premium, or Professional package based on your needs.",
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
      note: "Free forever plan available",
    },
    {
      step: 4,
      title: "Get Inquiries",
      description: "Buyers or renters contact you directly through the platform.",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-orange-500 to-amber-500",
    },
    {
      step: 5,
      title: "Manage Bookings",
      description: "Handle viewings, bookings, and payments from one dashboard.",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-red-500 to-rose-500",
    },
    {
      step: 6,
      title: "Complete Transaction",
      description: "Finalize sale or rental with documentation and platform support.",
      icon: <FileCheck className="w-6 h-6" />,
      color: "from-indigo-500 to-violet-500",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Listing Works
            <span className="block text-emerald-600">In 6 Easy Steps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From creating your account to closing the deal — everything is simple and transparent.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-emerald-400 to-emerald-600" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Card */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12"}`}>
                  <div className="bg-white rounded-xl border shadow-md hover:shadow-xl transition p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg bg-linear-to-r ${step.color} flex items-center justify-center text-white font-bold`}
                      >
                        {step.step}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-3">{step.description}</p>

                    {step.tags && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {step.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {step.note && (
                      <p className="mt-3 text-sm text-emerald-600 font-medium">
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline Icon */}
                <div className="absolute md:relative left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0">
                  <div
                    className={`w-12 h-12 rounded-full bg-linear-to-r ${step.color} border-4 border-white shadow-lg flex items-center justify-center text-white`}
                  >
                    {step.icon}
                  </div>
                </div>

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
