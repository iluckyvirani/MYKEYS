"use client";

import { Search, MessageCircle, Home, FileCheck, PoundSterling, Users } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Find Properties",
      description: "Browse thousands of properties for sale. Use advanced filters to find exactly what you want."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Send Inquiry",
      description: "Contact owners directly through our platform. No agents, no commissions."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Schedule Viewing",
      description: "Arrange property viewings directly with the owner at a time that suits you."
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Make Offer",
      description: "Negotiate directly with the owner and make your offer through our secure platform."
    },
    {
      icon: <PoundSterling className="w-8 h-8" />,
      title: "Complete Purchase",
      description: "We provide all necessary documentation and guide you through the purchase process."
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Move In",
      description: "Get the keys and move into your new home! Celebrate your successful purchase."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Buying Works on Hously
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, transparent process from search to settlement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 text-green-600">
                  {step.icon}
                </div>
                <div className="absolute top-6 right-6 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to find your dream home?
              </h3>
              <p className="text-green-100 mb-6">
                Start your property search today and connect directly with owners.
                Save thousands in agent fees and get better deals.
              </p>
              <button className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg">
                Start Searching
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl font-bold">£15,000</div>
                <div className="text-sm text-green-200">Avg. saving vs agents</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl font-bold">24h</div>
                <div className="text-sm text-green-200">Avg. response time</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-green-200">Customer satisfaction</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg">
                <div className="text-3xl font-bold">£0</div>
                <div className="text-sm text-green-200">Buyer fees</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}