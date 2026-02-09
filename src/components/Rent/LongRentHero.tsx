"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Home, CalendarDays, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import PropertySearchBarsecond from "../search/PropertySearchBarsecond";

interface LongRentHeroProps {
  onSearchChange?: (query: string, location: string) => void;
}

export default function LongRentHero({ onSearchChange }: LongRentHeroProps) {
  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-1">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-white mb-1 leading-tight tracking-tight">
              Find Your Long Term
              <span className="block text-green-400 mt-1">Rental Home</span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-200 max-w-lg mx-auto mb-10 font-light">
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
          <PropertySearchBarsecond onSearch={onSearchChange} />
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-[5px]">
            <div className="text-2xl font-bold text-white">£0</div>
            <div className="text-green-300 text-sm">Agent fees</div>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-[5px]">
            <div className="text-2xl font-bold text-white">2+</div>
            <div className="text-green-300 text-sm">Months minimum</div>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-[5px]">
            <div className="text-2xl font-bold text-white">Direct</div>
            <div className="text-green-300 text-sm">Owner contact</div>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-[5px]">
            <div className="text-2xl font-bold text-white">24h</div>
            <div className="text-green-300 text-sm">Avg. response</div>
          </div>
        </div>
      </div>
    </section>
  );
}