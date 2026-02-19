"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Property Buyer",
    image: "👩‍💼",
    content:
      "MYKEYS made finding my dream apartment so easy! The listings are detailed, verified, and the entire process was transparent.",
    rating: 5,
    propertyType: "Bought a 2BHK in Bengaluru",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Property Owner",
    image: "👨‍💼",
    content:
      "Listing my property on MYKEYS was effortless. I got qualified tenants quickly and the payment system is very reliable.",
    rating: 5,
    propertyType: "Listed 3 properties",
  },
  {
    id: 3,
    name: "Anita Desai",
    role: "Service User",
    image: "👩‍🚀",
    content:
      "The service booking system is incredible! Found a plumber in minutes, and the work quality was exceptional.",
    rating: 5,
    propertyType: "Booked 5+ services",
  },
  {
    id: 4,
    name: "Vikram Patel",
    role: "Service Provider",
    image: "👨‍🔧",
    content:
      "MYKEYS has transformed my plumbing business. I get consistent bookings and fair rates. Highly recommended for service providers!",
    rating: 5,
    propertyType: "Electrician, 100+ jobs",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from real users who found success on MYKEYS
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-blue-200 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-600 mb-6 line-clamp-4">"{testimonial.content}"</p>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-4">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>

                {/* Property/Service Type */}
                <p className="text-xs text-blue-600 font-medium">{testimonial.propertyType}</p>
              </div>

              {/* Hover effect background */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200/50"
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600">10K+</div>
            <p className="text-gray-600 text-sm mt-2">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-600">5K+</div>
            <p className="text-gray-600 text-sm mt-2">Properties Listed</p>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600">500+</div>
            <p className="text-gray-600 text-sm mt-2">Service Providers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-600">4.9★</div>
            <p className="text-gray-600 text-sm mt-2">Average Rating</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
