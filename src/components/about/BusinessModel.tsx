"use client";

import { motion } from "framer-motion";
import { 
  CreditCard, 
  MessageSquare, 
  DollarSign, 
  Shield, 
  Zap, 
  Lock,
  Calculator,
  Users,
  Home,
  Building,
  TrendingUp,
  Hotel,
  Building2
} from "lucide-react";

export default function BusinessModel() {
  const features = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Short Stay Payments",
      description: "Secure payment processing with release after check-in. Platform holds funds for buyer/seller protection.",
      color: "from-green-500 to-emerald-600",
      model: "Short Term"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Direct Communication",
      description: "For long-term rentals and purchases, connect directly with owners. No middlemen, faster decisions.",
      color: "from-blue-500 to-cyan-600",
      model: "Long Term"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Commission Model",
      description: "Short stays: 10-15%. Long rentals: 5-8%. Property sales: 1.5-3.5%. Transparent pricing always.",
      color: "from-purple-500 to-violet-600",
      model: "All Types"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verification System",
      description: "All properties and owners verified. Document checks, identity verification, and property inspection.",
      color: "from-amber-500 to-orange-600",
      model: "All Types"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Booking",
      description: "Short stays available for instant booking. Real-time availability calendar and instant confirmation.",
      color: "from-green-500 to-emerald-600",
      model: "Short Term"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Secure Transactions",
      description: "Bank-level encryption. Escrow services for large transactions. Fraud prevention systems.",
      color: "from-red-500 to-pink-600",
      model: "All Types"
    },
  ];

  const revenueStreams = [
    {
      type: "Short Stay Commission",
      percentage: "10-15%",
      description: "Per booking commission",
      icon: <Hotel className="w-5 h-5" />,
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      type: "Long Term Lead Fee",
      percentage: "One Month Rent",
      description: "Success fee per rental",
      icon: <Building2 className="w-5 h-5" />,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      type: "Property Sale Commission",
      percentage: "1.5-3.5%",
      description: "Per successful sale",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-gradient-to-r from-purple-500 to-violet-500"
    },
    {
      type: "Premium Packages",
      percentage: "Monthly/Annual",
      description: "For property owners",
      icon: <Calculator className="w-5 h-5" />,
      color: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            Our Business Model
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How We Make Property
            <span className="block text-green-600">Transactions Better</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've created a transparent, efficient marketplace that benefits both property owners and seekers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[5px] shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 bg-linear-to-r ${feature.color} rounded-lg flex items-center justify-center shrink-0`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      feature.model === "Short Term" ? "bg-green-100 text-green-700" :
                      feature.model === "Long Term" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {feature.model}
                    </span>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue Streams */}
        <div className="bg-linear-to-br from-gray-900 to-black rounded-[5px] p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Revenue Streams</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Sustainable business model with multiple revenue streams ensuring platform growth and user benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {revenueStreams.map((stream, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-[5px] p-6 border border-white/20"
              >
                <div className={`w-10 h-10 rounded-lg ${stream.color} flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {stream.icon}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{stream.type}</h4>
                <div className="text-2xl font-bold text-white mb-1">{stream.percentage}</div>
                <p className="text-gray-300 text-sm">{stream.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Value Proposition */}
          <div className="mt-12 p-6 bg-linear-to-r from-green-500/20 to-emerald-500/20 rounded-[5px] border border-green-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Win-Win for Everyone</h4>
                <p className="text-gray-200">
                  Owners get better prices, users save money, and we ensure secure transactions.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">30%</div>
                  <div className="text-green-300 text-sm">Cheaper for Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15%</div>
                  <div className="text-green-300 text-sm">Higher for Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-green-300 text-sm">Secure Transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}