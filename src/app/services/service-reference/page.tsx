// app/services/service-reference/page.tsx - Service Reference Page for Service Professionals
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Zap,
  Droplets,
  Wind,
  Home,
  Paintbrush,
  CheckCircle,
  Users,
  TrendingUp,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";

const serviceCategories = [
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "Plumbing Services",
    description: "Installation, repair, and maintenance of plumbing systems",
    services: ["Pipe Installation", "Leak Repairs", "Fixture Installation", "Drain Cleaning"],
    demand: "High",
    avgEarning: "₹1,500-2,500",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Electrical Services",
    description: "Electrical wiring, repairs, and safety installations",
    services: ["Wiring Installation", "Circuit Repairs", "Switch Installation", "Safety Inspection"],
    demand: "Very High",
    avgEarning: "₹1,200-2,000",
  },
  {
    icon: <Droplets className="w-8 h-8" />,
    title: "HVAC Services",
    description: "Air conditioning installation, repair, and maintenance",
    services: ["AC Installation", "Servicing & Repair", "Duct Cleaning", "Performance Check"],
    demand: "High",
    avgEarning: "₹2,000-4,000",
  },
  {
    icon: <Paintbrush className="w-8 h-8" />,
    title: "Painting Services",
    description: "Interior and exterior painting with quality finishes",
    services: ["Interior Painting", "Exterior Painting", "Wall Texturing", "Wood Finishing"],
    demand: "Medium",
    avgEarning: "₹3,000-5,000",
  },
  {
    icon: <Home className="w-8 h-8" />,
    title: "Maintenance Services",
    description: "General home and office maintenance and repairs",
    services: ["Drywall Repair", "Door/Window Fix", "General Repairs", "Safety Check"],
    demand: "High",
    avgEarning: "₹800-1,500",
  },
  {
    icon: <Wind className="w-8 h-8" />,
    title: "Cleaning Services",
    description: "Professional cleaning for homes and offices",
    services: ["Deep Cleaning", "Regular Cleaning", "Carpet Cleaning", "Office Cleaning"],
    demand: "Medium",
    avgEarning: "₹500-1,200",
  },
];

const benefits = [
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Grow Your Business",
    description: "Connect with more customers and expand your service reach",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Build Your Reputation",
    description: "Get genuine reviews and build trust with customers",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Increase Earnings",
    description: "Earn consistently with regular bookings",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Easy Management",
    description: "Manage bookings and payments from one platform",
  },
];

import { DollarSign } from "lucide-react";

export default function ServiceReferencePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-green-50 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Service Professional Resources
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Find comprehensive information about service categories, earnings, and
                best practices for service professionals on our platform.
              </p>
              <Link href="/service/dashboard/services">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg">
                  Start Managing Services <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Available Service Categories
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-green-600 mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {category.description}
                  </p>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Available Services:
                    </p>
                    <ul className="space-y-1">
                      {category.services.map((service, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Demand</span>
                      <span className="text-sm font-semibold text-green-600">
                        {category.demand}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Earning/Job</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {category.avgEarning}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Why Join as a Service Professional?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Register",
                  description: "Sign up and create your service profile",
                },
                {
                  step: "2",
                  title: "Add Services",
                  description: "List your services with pricing and details",
                },
                {
                  step: "3",
                  title: "Get Bookings",
                  description: "Receive service requests from customers",
                },
                {
                  step: "4",
                  title: "Earn & Grow",
                  description: "Build your reputation and increase earnings",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-green-600 transform -translate-y-1/2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Grow Your Service Business?
            </h2>
            <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of service professionals already earning through MYKEYS.
              Start building your success story today.
            </p>
            <Link href="/service/dashboard">
              <Button className="bg-white hover:bg-gray-100 text-green-600 px-8 py-3 rounded-lg text-lg font-semibold">
                Go to Service Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
