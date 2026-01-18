"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Home, PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BuyHero() {
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
                                    placeholder="Enter city, postcode or area"
                                    className="input-field bg-gray-50"
                                />
                            </div>

                            {/* Property Type */}
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                                <select className="input-field appearance-none bg-white">
                                    <option value="">Property Type</option>
                                    <option value="house">House</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="villa">Villa</option>
                                    <option value="flat">Flat</option>
                                    <option value="bungalow">Bungalow</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="relative">
                                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                                <select className="input-field appearance-none bg-white">
                                    <option value="">Price Range</option>
                                    <option value="0-250000">Up to £250,000</option>
                                    <option value="250000-500000">£250,000 - £500,000</option>
                                    <option value="500000-750000">£500,000 - £750,000</option>
                                    <option value="750000-1000000">£750,000 - £1M</option>
                                    <option value="1000000+">£1M+</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-center mt-2">
                            {/* Search Button */}
                            <Button className="w-100 rounded-tr-none rounded-tl-none h-12 bg-green-600 hover:bg-green-700 text-white">
                                <Search className="w-5 h-5 mr-2" />
                                Search Properties
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}