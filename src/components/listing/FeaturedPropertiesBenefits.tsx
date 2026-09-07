"use client";

import { Star, Eye, TrendingUp, Target, Zap, Shield } from "lucide-react";
import PublicListingPackages from "@/components/listing/PublicListingPackages";

const benefits = [
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Increased Visibility",
    description: "Featured properties appear at the top of search results and get 5x more views.",
    stat: "500%",
    statLabel: "More Views",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Higher Conversion",
    description: "Get 3x more inquiries and book 70% faster than regular listings.",
    stat: "70%",
    statLabel: "Faster Booking",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Targeted Exposure",
    description: "Showcase to high-intent users actively searching in your area.",
    stat: "3x",
    statLabel: "More Inquiries",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Premium Badge",
    description: "Stand out with featured placement that builds trust with potential guests.",
    stat: "4.8★",
    statLabel: "Avg. Rating",
  },
];

export default function FeaturedPropertiesBenefits() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Featured, Get Noticed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Boost your listing&apos;s visibility with live owner and agent packages for Sale and Rent
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600 mb-6">{benefit.description}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-emerald-600">{benefit.stat}</span>
                <span className="text-gray-500 mb-1">{benefit.statLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <PublicListingPackages />

        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Success Story</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                &quot;Featured listing doubled my bookings in 30 days&quot;
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <div>
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="text-emerald-200">Property Owner in London</p>
                </div>
              </div>

              <p className="text-emerald-100">
                After upgrading my package, I went from 3–4 bookings per month to 8–10. Being at
                the top of search results and having direct inquiries made a real difference.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h4 className="text-xl font-bold mb-6">Sarah&apos;s Results</h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-200">Monthly Bookings</span>
                    <span className="font-bold">+150%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-3/4" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-200">Monthly Revenue</span>
                    <span className="font-bold">+£2,400</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-2/3" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-emerald-200">Inquiry Response Rate</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-full" />
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/20 rounded-lg">
                <p className="text-sm">
                  <Shield className="w-4 h-4 inline mr-2" />
                  <span className="font-medium">ROI:</span> Package paid back in the first week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
