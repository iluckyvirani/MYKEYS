"use client";

import { motion } from "framer-motion";
import PropertySearch from "../search/PropertySearch";

interface ShortRentHeroProps {
  onSearchChange?: (city: string, zipCode: string) => void;
  initialCity?: string;
  initialZipCode?: string;
}

export default function ShortRentHero({ onSearchChange, initialCity = "", initialZipCode = "" }: ShortRentHeroProps) {
  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-gray-900 mb-1 leading-tight tracking-tight">
              Perfect Short Rents
              <span className="block text-green-600 mt-1">For Every Occasion</span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-600 max-w-lg mx-auto mb-10 font-light">
              Book beautiful properties for nights, weekends, or short getaways.
              Secure payments, verified hosts, and flexible cancellation.
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <PropertySearch onSearch={onSearchChange} initialCity={initialCity} initialZipCode={initialZipCode} />
        </motion.div>
      </div>
    </section>
  );
}