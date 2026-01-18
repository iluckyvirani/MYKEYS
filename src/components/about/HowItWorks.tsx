"use client";

import { motion } from "framer-motion";
import { 
  Search, 
  Home, 
  MessageSquare, 
  CreditCard, 
  Key, 
  CheckCircle,
  Calendar,
  Building2,
  TrendingUp,
  Hotel,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Browse & Search",
      description: "Use filters to find exactly what you need - short stays, long rentals, or properties to buy.",
      icon: <Search className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      types: ["Short", "Long", "Buy"]
    },
    {
      step: 2,
      title: "View Details",
      description: "Check property details, photos, reviews, and pricing for each transaction type.",
      icon: <Home className="w-6 h-6" />,
      color: "from-purple-500 to-violet-500",
      types: ["Short", "Long", "Buy"]
    },
    {
      step: 3,
      title: "Choose Your Path",
      description: "Select transaction type - instant book for short stays or send inquiry for long term/buy.",
      icon: <Building2 className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      types: ["Short", "Long", "Buy"]
    },
    {
      step: 4,
      title: "Short Stay: Book & Pay",
      description: "Instant booking with secure payment. Platform holds funds until check-in completion.",
      icon: <CreditCard className="w-6 h-6" />,
      color: "from-green-600 to-emerald-600",
      types: ["Short"]
    },
    {
      step: 5,
      title: "Long Term/Buy: Connect",
      description: "Send inquiry, chat directly with owner, negotiate terms, and finalize offline.",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-blue-600 to-cyan-600",
      types: ["Long", "Buy"]
    },
    {
      step: 6,
      title: "Complete & Review",
      description: "Finish transaction, move in, and leave review for future users.",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500",
      types: ["Short", "Long", "Buy"]
    },
  ];

  const transactionTypes = [
    {
      type: "Short Stay",
      icon: <Hotel className="w-8 h-8" />,
      description: "Airbnb-style booking",
      steps: "Search → Book → Pay → Stay → Review",
      color: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      textColor: "text-green-700",
      buttonColor: "bg-gradient-to-r from-green-600 to-emerald-600"
    },
    {
      type: "Long Term Rent",
      icon: <Building2 className="w-8 h-8" />,
      description: "2+ months rental",
      steps: "Search → Inquiry → Chat → View → Rent",
      color: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
      textColor: "text-blue-700",
      buttonColor: "bg-gradient-to-r from-blue-600 to-cyan-600"
    },
    {
      type: "Property Purchase",
      icon: <TrendingUp className="w-8 h-8" />,
      description: "Buy directly from owners",
      steps: "Search → Inquiry → View → Negotiate → Buy",
      color: "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200",
      textColor: "text-purple-700",
      buttonColor: "bg-gradient-to-r from-purple-600 to-violet-600"
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
            <span className="block text-blue-600">For Everyone</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're looking for a weekend stay, a year-long rental, or your dream home purchase.
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="relative mb-20">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-green-500 via-blue-500 to-purple-500"></div>
          
          {/* Steps */}
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Step Content */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'} mb-6 md:mb-0`}>
                  <div className="bg-white rounded-[5px] shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 bg-linear-to-r ${step.color} rounded-lg flex items-center justify-center`}>
                        <div className="text-white text-xl font-bold">{step.step}</div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                        <div className="flex gap-2 mt-1">
                          {step.types.map((type) => (
                            <span
                              key={type}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                type === "Short" ? "bg-green-100 text-green-700" :
                                type === "Long" ? "bg-blue-100 text-blue-700" :
                                "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                    <div className="mt-4">
                      <div className="text-gray-400">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
                  <div className={`w-12 h-12 bg-linear-to-r ${step.color} rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Empty div for layout */}
                <div className="md:w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transaction Types Comparison */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Transaction Type
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Different needs, different processes - all on one platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {transactionTypes.map((transaction, index) => (
            <motion.div
              key={transaction.type}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-[5px] p-6 border ${transaction.color}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-lg ${transaction.color.split('bg-gradient-to-r ')[1].split(' ')[0].replace('from-', 'bg-')} bg-opacity-20`}>
                  <div className={transaction.textColor}>
                    {transaction.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{transaction.type}</h4>
                  <p className="text-gray-600 text-sm">{transaction.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Process:</div>
                <div className="flex items-center justify-between text-sm">
                  {transaction.steps.split(' → ').map((step, idx) => (
                    <div key={idx} className="text-center">
                      <div className={`w-8 h-8 rounded-full ${transaction.textColor} bg-opacity-10 flex items-center justify-center mb-1`}>
                        {idx + 1}
                      </div>
                      <div className={`text-xs ${transaction.textColor} font-medium`}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified properties</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Direct communication</span>
                </div>
              </div>

              <Button className={`w-full ${transaction.buttonColor} hover:opacity-90 text-white`}>
                Explore {transaction.type}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-20 bg-linear-to-r from-gray-900 to-black rounded-[5px] p-8 md:p-12 text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied users and property owners on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 cursor-pointer rounded-[5px]"
            >
              <Users className="w-5 h-5 mr-2" />
              Sign Up Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 rounded-[5px] border-white text-white hover:bg-white cursor-pointer px-8"
            >
              Schedule Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}