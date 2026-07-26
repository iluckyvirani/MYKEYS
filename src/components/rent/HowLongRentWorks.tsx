"use client";

import { Search, MessageCircle, Home, FileText, Key, Users } from "lucide-react";

export default function HowLongRentWorks({
  title = "How Long Term Rental Works",
  subtitle = "Direct rental process from search to move-in",
}: {
  title?: string;
  subtitle?: string;
}) {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Find Properties",
      description: "Browse available long-term rentals with detailed listings."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Send Inquiry",
      description: "Contact owners directly with your requirements and questions."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Arrange Viewing",
      description: "Schedule property viewings directly with the owner."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Submit Documents",
      description: "Provide required documents for tenancy application."
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Sign Agreement",
      description: "Review and sign the tenancy agreement digitally."
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: "Move In",
      description: "Get keys and move into your new home. Welcome!"
    }
  ];

  return (
    <section className="py-16 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  {step.icon}
                </div>
                <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-16 bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Benefits of Renting Directly
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">💰 Save Money</h4>
                  <p className="text-gray-700">No agent fees means lower rents and deposits.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">🗣️ Direct Communication</h4>
                  <p className="text-gray-700">Talk directly with owners for faster responses and better negotiation.</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">📋 Paperwork Made Easy</h4>
                  <p className="text-gray-700">Digital agreements and document submission through our platform.</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8">
              <h4 className="font-bold text-xl mb-6 text-gray-900">Typical Savings vs Agents</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Agent Fees (Traditional)</span>
                    <span className="font-bold text-red-600">£1,500+</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Hously Direct Rental</span>
                    <span className="font-bold text-green-600">£0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <span className="font-bold">Average saving:</span> £1,200-£2,000 per tenancy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}