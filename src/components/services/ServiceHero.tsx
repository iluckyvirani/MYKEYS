"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Sparkles,
  Wind,
  Zap,
  Paintbrush,
  Hammer,
  CheckCircle,
} from "lucide-react";

interface ServiceHeroProps {
  onGetStarted?: () => void;
}

export default function ServiceHero({ onGetStarted }: ServiceHeroProps) {
  const features = [
    {
      icon: CheckCircle,
      text: "Verified Service Professionals",
    },
    {
      icon: Zap,
      text: "Instant & Scheduled Bookings",
    },
    {
      icon: Wrench,
      text: "Wide Range of Services",
    },
  ];

  const categoryIcons = [
    { Icon: Wrench, label: "Plumbing" },
    { Icon: Sparkles, label: "Cleaning" },
    { Icon: Wind, label: "AC Repair" },
    { Icon: Zap, label: "Electrical" },
    { Icon: Paintbrush, label: "Painting" },
    { Icon: Hammer, label: "Carpentry" },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-900 via-green-900 to-gray-900 py-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 -left-40 w-80 h-80 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-6xl font-bold text-white mb-4 leading-tight font-spartan">
              Professional Home Services
              <span className="block text-green-400 mt-2">
                At Your Doorstep
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-8 font-light leading-relaxed">
              Discover verified service professionals for plumbing, cleaning, electrical work, AC repair, painting, and much more. Book instantly for immediate service or schedule at your convenience. All professionals are thoroughly verified and background-checked for your safety and peace of mind.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 justify-center text-gray-200"
              >
                <feature.icon className="w-5 h-5 text-green-400" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              onClick={onGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-lg flex items-center gap-2 justify-center h-auto"
            >
              Browse Services
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-lg h-auto"
            >
              Become a Professional
            </Button>
          </motion.div>

          {/* Service Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-gray-300 mb-6 font-medium">Popular Services</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {categoryIcons.map(({ Icon, label }, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border border-white/10 hover:border-green-400/50 hover:bg-white/5 transition-all cursor-pointer group"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Icon className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors" />
                  <span className="text-xs text-gray-300 text-center">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </motion.div>
      </div>
    </section>
  );
}
