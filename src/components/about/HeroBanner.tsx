"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Building,
  TrendingUp,
  Building2,
  Hotel
} from "lucide-react";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    title: "Short Rents",
    description: "Book instantly. Pay per night. Full Airbnb-style experience with verified properties.",
    icon: Hotel,
    href: "/rent/short-rent",
    iconClass: "from-green-500 to-emerald-600",
    hoverBorder: "hover:border-green-400/50",
  },
  {
    title: "Long Term Rentals",
    description: "Connect directly with owners. 2+ month stays. No agent fees. Better deals.",
    icon: Building2,
    href: "/rent/long-rent",
    iconClass: "from-blue-500 to-cyan-600",
    hoverBorder: "hover:border-blue-400/50",
  },
  {
    title: "Property Purchase",
    description: "Buy directly from owners. Transparent pricing. Complete documentation support.",
    icon: TrendingUp,
    href: "/buy",
    iconClass: "from-purple-500 to-violet-600",
    hoverBorder: "hover:border-purple-400/50",
  },
];

export default function HeroBanner() {
  return (
    <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
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

      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-5 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-spartan text-4xl sm:text-5xl md:text-5xl font-bold text-white mb-1 leading-tight tracking-tight">
              One Platform,
              <span className="block text-green-400 mt-1">
                Three Ways to Property
              </span>
            </h1>

            <p className="font-spartan text-lg sm:text-md text-gray-200 max-w-lg mx-auto mb-5 font-light">
              We're revolutionizing property transactions with our unified platform.
              Whether you need a short rent, long-term rental, or want to buy a home -
              we've got you covered with transparent pricing and direct owner connections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-[5px] h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                <Link href="/how-listing-works">
                  <Building className="w-5 h-5 mr-2" />
                  List Your Property
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-gray-900 cursor-pointer px-8 py-6 rounded-[5px] text-lg"
              >
                <Link href="/buy">
                  <Home className="w-5 h-5 mr-2" />
                  Find Properties
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10"
        >
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`block bg-white/10 backdrop-blur-sm rounded-[5px] p-6 border border-white/20 ${card.hoverBorder} transition-all duration-300 hover:scale-105`}
              >
                <div className={`w-12 h-12 bg-linear-to-br ${card.iconClass} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-300">{card.description}</p>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  );
}