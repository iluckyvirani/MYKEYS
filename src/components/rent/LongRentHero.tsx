"use client";

import { motion } from "framer-motion";
import PropertySearch from "../search/PropertySearch";

interface LongRentHeroProps {
  onSearchChange?: (city: string, zipCode: string) => void;
  initialCity?: string;
  initialZipCode?: string;
}

export default function LongRentHero({ onSearchChange, initialCity = "", initialZipCode = "" }: LongRentHeroProps) {
  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-2 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-gray-900 mb-1 leading-tight tracking-tight">
              Find Your Long Term
              <span className="block text-green-600 mt-1">Rental Home</span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-600 max-w-lg mx-auto  font-light">
              Rent directly from owners. Minimum 2+ months stays, better prices,
              and direct communication for a smooth rental experience.
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

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-[5px]">
            <div className="text-2xl font-bold text-gray-900">£0</div>
            <div className="text-green-600 text-sm">Agent fees</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-[5px]">
            <div className="text-2xl font-bold text-gray-900">2+</div>
            <div className="text-green-600 text-sm">Months minimum</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-[5px]">
            <div className="text-2xl font-bold text-gray-900">Direct</div>
            <div className="text-green-600 text-sm">Owner contact</div>
          </div>
          <div className="text-center p-4 bg-gray-50 border border-gray-100 rounded-[5px]">
            <div className="text-2xl font-bold text-gray-900">24h</div>
            <div className="text-green-600 text-sm">Avg. response</div>
          </div>
        </div>
      </div>
    </section>
  );
}