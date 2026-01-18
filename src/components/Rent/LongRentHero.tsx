"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Home, CalendarDays, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LongRentHero() {
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

        {/* Quick Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/10 rounded-[5px] shadow-lg p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Search */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <input
                  type="text"
                  placeholder="City, postcode or area"
                  className="input-field bg-gray-50"
                />
              </div>

              {/* Property Type */}
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <select className="input-field appearance-none bg-white">
                  <option value="">Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="flat">Flat</option>
                  <option value="studio">Studio</option>
                  <option value="bungalow">Bungalow</option>
                </select>
              </div>

              {/* Duration */}
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <select className="input-field appearance-none bg-white">
                  <option value="">Min. Duration</option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
            </div>


            <div className="flex items-center justify-center mt-2">
              {/* Search Button */}
              <Button className="w-100 rounded-tr-none rounded-tl-none h-12 bg-green-600 hover:bg-green-700 text-white">
                <Search className="w-5 h-5 mr-2" />
                Find Rentals
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-[5px] hover:bg-blue-100 transition-colors">
                Bills included
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-[5px] hover:bg-gray-200 transition-colors">
                Furnished
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-[5px] hover:bg-gray-200 transition-colors">
                Garden
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-[5px] hover:bg-gray-200 transition-colors">
                Parking
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-[5px] hover:bg-gray-200 transition-colors">
                Pet friendly
              </button>
            </div>
          </div>
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