"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, Shield, Users, Zap } from "lucide-react";

export default function ServiceIntroduction() {
  const benefits = [
    {
      icon: Users,
      title: "Verified Professionals",
      description: "All service professionals are thoroughly verified, background-checked, and certified",
    },
    {
      icon: Zap,
      title: "Flexible Booking",
      description: "Choose between instant service or schedule for your preferred date and time",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Transparent pricing, secure payments, and guaranteed customer satisfaction",
    },
    {
      icon: Clock,
      title: "Fast Response",
      description: "Get professional help quickly with our instant booking service option",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Professional Services Made Easy
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">
            MYKEYS brings you a comprehensive platform to connect with verified service professionals. 
            Whether you need urgent plumbing repair, regular home cleaning, electrical work, or any other 
            household service, we have skilled professionals ready to help. With flexible booking options, 
            transparent pricing, and dedicated customer support, getting quality service has never been easier.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <benefit.icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12 border border-green-200"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2">
            {[
              { num: "1", title: "Browse", desc: "Explore verified professionals by service category" },
              { num: "2", title: "Select", desc: "Choose your preferred professional and service type" },
              { num: "3", title: "Book", desc: "Pick instant booking or schedule for your convenience" },
              { num: "4", title: "Enjoy", desc: "Get quality service with transparent pricing" },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                  {step.num}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block absolute w-12 h-0.5 bg-green-600 ml-24 -mb-12" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
