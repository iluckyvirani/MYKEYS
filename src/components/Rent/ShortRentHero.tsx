"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShortRentHero() {
  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-1">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
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
              Perfect Short Rents
              <span className="block text-green-400 mt-1">For Every Occasion</span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-200 max-w-lg mx-auto mb-10 font-light">
              Book beautiful properties for nights, weekends, or short getaways.
              Secure payments, verified hosts, and flexible cancellation.
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Location Search */}
              <div className="relative md:col-span-2">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="input-field bg-gray-50"
                />
              </div>

              {/* Check-in Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <input
                  type="date"
                  className="input-field bg-gray-50"
                  placeholder="Check-in"
                />
              </div>

              {/* Check-out Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <input
                  type="date"
                  className="input-field bg-gray-50"
                  placeholder="Check-out"
                />
              </div>

              {/* Guests */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                <select className="input-field appearance-none bg-white">
                  <option value="">Guests</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5+">5+ Guests</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-center mt-2">
              {/* Search Button */}
              <Button className="w-100 rounded-tr-none rounded-tl-none h-12 bg-green-600 hover:bg-green-700 text-white">
                <Search className="w-5 h-5 mr-2" />
               Search Stays
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                Entire homes
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Pet friendly
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Wi-Fi included
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Pool
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Free parking
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}