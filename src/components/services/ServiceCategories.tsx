"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wrench,
  Sparkles,
  Wind,
  Zap,
  Paintbrush,
  Hammer,
  Users,
  Clock,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Verified Professionals",
    description: "All service providers are verified and background-checked for your safety and peace of mind.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Get immediate service with instant booking enabled professionals available in your area.",
  },
  {
    icon: Clock,
    title: "Schedule Service",
    description: "Schedule services at your convenience. Choose date, time, and preferred service professional.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Safe and secure payment options with transparent pricing. No hidden charges.",
  },
];

const categories = [
  {
    Icon: Wrench,
    title: "Plumbing",
    services: ["Pipe Repair", "Tap Maintenance", "Drain Cleaning", "Toilet Installation"],
  },
  {
    Icon: Sparkles,
    title: "Cleaning",
    services: ["Home Cleaning", "Office Cleaning", "Carpet Care", "Window Cleaning"],
  },
  {
    Icon: Wind,
    title: "AC Repair",
    services: ["Installation", "Repair", "Maintenance", "Gas Refill"],
  },
  {
    Icon: Zap,
    title: "Electrical",
    services: ["Wiring", "Switch Repair", "Appliance Fix", "Light Setup"],
  },
  {
    Icon: Paintbrush,
    title: "Painting",
    services: ["Wall Painting", "Exterior Work", "Furniture Paint", "Texture Coating"],
  },
  {
    Icon: Hammer,
    title: "Carpentry",
    services: ["Door Install", "Cabinet Repair", "Furniture Fix", "Shelving"],
  },
];

export default function ServiceCategories() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Choose Our Service Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience hassle-free home services with verified professionals at competitive prices
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-green-600 mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Categories Grid */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Service Categories
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full border-l-4 border-l-green-600 hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <category.Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-2xl">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.services.map((service, sidx) => (
                        <li
                          key={sidx}
                          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
                        >
                          <span className="w-2 h-2 bg-green-600 rounded-full" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          className="mt-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-12 text-white text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-bold mb-6">Three Simple Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Choose Service", desc: "Select your service category and professional" },
              { step: "2", title: "Book", desc: "Pick instant or schedule your preferred time slot" },
              { step: "3", title: "Enjoy", desc: "Pay securely and receive quality service" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-3xl font-bold mb-4 border-2 border-white/40">
                  {item.step}
                </div>
                <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                <p className="text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
