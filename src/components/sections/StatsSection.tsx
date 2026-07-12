"use client";

import { motion } from "framer-motion";
import { Award, Building2, Users, ShieldCheck, Clock, Star, Home, Globe } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      id: 1,
      icon: <Building2 className="w-8 h-8" />,
      value: "1,548+",
      label: "Properties Sold",
      color: "from-green-500 to-emerald-600",
      description: "Successful transactions"
    },
    {
      id: 2,
      icon: <Award className="w-8 h-8" />,
      value: "25+",
      label: "Awards Gained",
      color: "from-blue-500 to-cyan-600",
      description: "Industry recognition"
    },
    {
      id: 3,
      icon: <Clock className="w-8 h-8" />,
      value: "9+",
      label: "Years Experience",
      color: "from-purple-500 to-violet-600",
      description: "Trusted expertise"
    },
    {
      id: 4,
      icon: <Users className="w-8 h-8" />,
      value: "98%",
      label: "Client Satisfaction",
      color: "from-amber-500 to-orange-600",
      description: "Happy customers"
    }
  ];

  const additionalStats = [
    {
      icon: <Home className="w-6 h-6" />,
      value: "500+",
      label: "Properties Listed"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      value: "24/7",
      label: "Support Available"
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: "4.9",
      label: "Average Rating"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      value: "50+",
      label: "Cities Covered"
    }
  ];

  return (
    <>
      {/* Main Stats Section - White Background */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-white border-t border-b border-gray-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-linear-to-r from-green-500/10 to-emerald-500/10 text-green-700 px-4 py-2 rounded-full mb-4 border border-green-500/20">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium">Our Achievements</span>
            </div>
            
            <h2 className="font-spartan text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-600 mt-1">
                of Happy Clients
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Years of excellence in delivering premium real estate solutions with unmatched customer satisfaction.
            </p>
          </motion.div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-xs overflow-hidden transition-all duration-300 group-hover:shadow-md">
                  {/* Gradient Background Hover Effect */}
                  <div className={`absolute inset-0 bg-linear-to-br ${stat.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      <div className="text-white">
                        {stat.icon}
                      </div>
                    </div>
                    
                    {/* Value */}
                    <div className="mb-2">
                      <motion.span 
                        className="font-spartan text-5xl md:text-6xl font-bold text-gray-900"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: 0.5 + (index * 0.1),
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        {stat.value}
                      </motion.span>
                    </div>
                    
                    {/* Label */}
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</h4>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600">{stat.description}</p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-linear-to-br from-gray-200/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-linear-to-tr from-gray-200/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-xs"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {additionalStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <div className="text-center p-6 bg-white rounded-2xl border border-gray-100 hover:bg-gray-100/50 hover:shadow-xs transition-all duration-300">
                    {/* Icon */}
                    <div className="inline-flex p-3 rounded-xl bg-linear-to-br from-green-500/10 to-emerald-500/10 text-green-600 mb-4 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    
                    {/* Value */}
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    
                    {/* Label */}
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8"
          >
            {['Forbes', 'Business Insider', 'TechCrunch', 'Bloomberg', 'WSJ'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + (index * 0.1) }}
                whileHover={{ y: -4 }}
                className="text-gray-400 hover:text-gray-800 transition-colors"
              >
                <div className="text-sm opacity-60 mb-1">Featured in</div>
                <div className="text-xl font-semibold">{company}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}