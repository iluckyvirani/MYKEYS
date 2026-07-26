"use client";

import { Search, Calendar, CreditCard, Key, Star, Home } from "lucide-react";

export default function HowShortRentWorks({
  title = "How Short Stays Work",
  subtitle = "Easy booking process from search to check-out",
}: {
  title?: string;
  subtitle?: string;
}) {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Search Properties",
      description: "Browse beautiful properties with photos, amenities, and reviews."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Select Dates",
      description: "Choose your check-in and check-out dates, number of guests."
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Secure Booking",
      description: "Book instantly with secure payment. We hold funds until check-in."
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: "Check In",
      description: "Get check-in instructions. Self check-in or meet the host."
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Enjoy Your Stay",
      description: "Make yourself at home. Contact host if you need anything."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Leave Review",
      description: "Share your experience and help other travelers."
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

        {/* Benefits */}
        <div className="mt-16 bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Book Short Rents with Hously?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  <span className="text-gray-700">Secure payment protection</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  <span className="text-gray-700">Verified hosts & properties</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  <span className="text-gray-700">Flexible cancellation policies</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full" />
                  </div>
                  <span className="text-gray-700">24/7 customer support</span>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="text-3xl font-bold text-blue-600">£0</div>
                <div className="text-gray-700 mt-2">Booking fees</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="text-3xl font-bold text-blue-600">100%</div>
                <div className="text-gray-700 mt-2">Payment protection</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="text-3xl font-bold text-blue-600">4.8★</div>
                <div className="text-gray-700 mt-2">Average rating</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl">
                <div className="text-3xl font-bold text-blue-600">24h</div>
                <div className="text-gray-700 mt-2">Support response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}