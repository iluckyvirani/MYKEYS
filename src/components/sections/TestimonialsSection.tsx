"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useHomeContent } from "@/hooks/useHomeContent";

export default function TestimonialsSection() {
  const { content } = useHomeContent();
  const { title, subtitle, items, barStats } = content.testimonials;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-blue-200 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-600 mb-6 line-clamp-4">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 font-medium">
                  {testimonial.propertyType}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200/50"
        >
          {(barStats || []).map((stat, i) => (
            <div key={`${stat.label}-${i}`} className="text-center">
              <div
                className={`text-3xl sm:text-4xl font-bold ${
                  i % 2 === 0 ? "text-blue-600" : "text-cyan-600"
                }`}
              >
                {stat.value}
              </div>
              <p className="text-gray-600 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
