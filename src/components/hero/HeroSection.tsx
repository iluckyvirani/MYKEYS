"use client";

import { motion } from "framer-motion";
import BuySellRentTabs from "./BuySellRentTabs";
import PropertySearchBar from "../search/PropertySearchBar";

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-175 flex items-center justify-center overflow-hidden">
      {/* Zoom Background Image Effect */}
      <div className="zoom-image">
        {/* Background Image with zoom effect */}
        <div
          className="absolute inset-0 image-wrap z-1 bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg')",
            transform: 'scale(1.1)',
            transition: 'transform 10s ease-out',
          }}
        />

        {/* Black overlay */}
        {/* <div className="absolute inset-0 bg-black/20 z-2" /> */}

        {/* Gradient overlays for better text readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/80 z-3" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent z-3" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-9">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-bold text-white mb-1 leading-tight tracking-tight">
              Find Your Perfect
              <span className="block text-green-400 mt-1">Dream Property</span>
            </h1>

            <p className="font-spartan text-lg sm:text-xl text-gray-200 max-w-lg mx-auto mb-10 font-light">
              Discover properties seamlessly. Buy, Short rent (nightly bookings), or Long Term Rent (2+ months minimum).
              No hidden fees, just transparent real estate solutions.
            </p>
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <BuySellRentTabs />
        </motion.div>

        {/* Property Search */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PropertySearchBar />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
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