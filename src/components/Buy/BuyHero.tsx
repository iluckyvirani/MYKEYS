"use client";

import { motion } from "framer-motion";
import PropertySearch from "../search/PropertySearch";

interface BuyHeroProps {
  onSearchChange?: (city: string, zipCode: string) => void;
}

export default function BuyHero({ onSearchChange }: BuyHeroProps) {
    return (
        <section className="relative h-screen min-h-125 flex items-center justify-center overflow-hidden">
            {/* Background Image without zoom effect */}
            <div className="absolute inset-0 z-1">
                <div
                    className="absolute inset-0 bg-no-repeat bg-center bg-cover"
                    style={{
                        backgroundImage: "url('https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg')",
                    }}
                />

                {/* Gradient overlays for better text readability */}
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
                            Find Your Perfect
                            <span className="block text-green-400 mt-1">Home to Own</span>
                        </h1>

                        <p className="font-spartan text-lg sm:text-md text-gray-200 max-w-md mx-auto mb-10 font-light">
                            Browse thousands of properties for sale. No agents, no hidden fees,
                            direct owner contact for better deals.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <PropertySearch onSearch={onSearchChange} />
                </motion.div>
            </div>
        </section>
    );
}