"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  Home, 
  Building2, 
  TrendingUp, 
  Shield, 
  Star,
  MessageSquare,
  Globe
} from "lucide-react";
import CountUp from 'react-countup';

export default function StatsSection() {
  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      value: 50000,
      suffix: "+",
      label: "Active Users",
      description: "Property seekers & owners",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Home className="w-8 h-8" />,
      value: 15000,
      suffix: "+",
      label: "Properties Listed",
      description: "Across all transaction types",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      value: 95,
      suffix: "%",
      label: "Satisfaction Rate",
      description: "User satisfaction score",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      value: 3,
      suffix: "B",
      label: "Transaction Value",
      description: "Total property value transacted",
      color: "from-amber-500 to-orange-500"
    },
  ];

  const achievements = [
    {
      title: "Short Stay Bookings",
      value: "45,000+",
      description: "Nights booked through platform",
      icon: "🏨"
    },
    {
      title: "Long Term Rentals",
      value: "8,200+",
      description: "Successful rental matches",
      icon: "🏠"
    },
    {
      title: "Properties Sold",
      value: "1,500+",
      description: "Direct owner-buyer sales",
      icon: "💰"
    },
    {
      title: "Cities Covered",
      value: "120+",
      description: "Across 15 countries",
      icon: "🌍"
    },
  ];

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[5px] shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`w-16 h-16 bg-linear-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                <CountUp
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={2.5}
                  className="font-bold"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{stat.label}</h3>
              <p className="text-gray-600 text-sm">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-linear-to-r from-gray-900 to-black rounded-[5px] p-8 md:p-12 mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Our Achievements
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Building the future of property transactions, one satisfied user at a time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-[5px] p-6 border border-white/20 hover:border-white/40 transition-colors duration-300"
              >
                <div className="text-3xl mb-4">{achievement.icon}</div>
                <div className="text-2xl font-bold text-white mb-2">{achievement.value}</div>
                <h4 className="text-lg font-bold text-white mb-2">{achievement.title}</h4>
                <p className="text-gray-300 text-sm">{achievement.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-[5px] p-6 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">4.8/5</div>
                  <div className="text-green-300">Platform Rating</div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-[5px] p-6 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">24h</div>
                  <div className="text-blue-300">Avg. Response Time</div>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-300" />
              </div>
            </div>

            <div className="bg-linear-to-r from-purple-500/20 to-violet-500/20 rounded-[5px] p-6 border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-purple-300">Verified Properties</div>
                </div>
                <Shield className="w-8 h-8 text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Growth Timeline */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Rapid Growth Journey
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            From startup to market leader in property transactions
          </p>

          <div className="relative">
            {/* Timeline */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              {[
                { year: "2021", event: "Platform Launch", properties: "500" },
                { year: "2022", event: "Expand to 50 Cities", properties: "5,000" },
                { year: "2023", event: "Add Purchase Feature", properties: "10,000" },
                { year: "2024", event: "International Launch", properties: "15,000+" },
              ].map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center relative z-10"
                >
                  <div className="w-20 h-20 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-white text-2xl font-bold">{milestone.year}</div>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{milestone.event}</h4>
                  <p className="text-gray-600">{milestone.properties} Properties</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}