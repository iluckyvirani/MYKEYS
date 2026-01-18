"use client";

import { motion } from "framer-motion";
import { Home, TrendingUp, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ListingHero() {
  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-1">
        <div
          className="absolute inset-0 bg-no-repeat bg-center bg-cover"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1600')",
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-white mb-1 leading-tight">
              List Your Property
              <span className="block text-green-400 mt-2">Earn More, Hassle Less</span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-200 max-w-lg mb-5 font-light">
              Join thousands of property owners who are maximizing their earnings
              with Hously. List once, reach millions of potential buyers and renters.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-white/10 cursor-pointer text-green-400 hover:bg-green-400 hover:text-white px-8 py-6 text-lg font-semibold rounded-[5px]">
                Start Listing Now
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/10 rounded-[5px] p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Why List with Hously?</h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Higher Earnings</h4>
                  <p className="text-white/80">Save 15-25% on agent commissions. Keep more of your rental income.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Direct Control</h4>
                  <p className="text-white/80">Manage your property directly. Set your own terms and pricing.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Fast Results</h4>
                  <p className="text-white/80">Average listing gets first inquiry within 24 hours.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/10  rounded-[5px]">
            <div className="text-3xl font-bold text-white">15,000+</div>
            <div className="text-emerald-200">Active Owners</div>
          </div>
          <div className="text-center p-6 bg-white/10 rounded-[5px]">
            <div className="text-3xl font-bold text-white">£4.2B</div>
            <div className="text-emerald-200">Property Value</div>
          </div>
          <div className="text-center p-6 bg-white/10  rounded-[5px]">
            <div className="text-3xl font-bold text-white">98%</div>
            <div className="text-emerald-200">Satisfaction Rate</div>
          </div>
          <div className="text-center p-6 bg-white/10  rounded-[5px]">
            <div className="text-3xl font-bold text-white">24h</div>
            <div className="text-emerald-200">Avg. First Inquiry</div>
          </div>
        </div>
      </div>
    </section>
  );
}