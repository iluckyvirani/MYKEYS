"use client";

import { ArrowRight, CheckCircle, Star, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import DynamicFAQSection from "@/components/faq/DynamicFAQSection";

export default function CTASection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full translate-y-48 -translate-x-48 opacity-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Start Earning More?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join 15,000+ property owners who are maximizing their income with MYKEYS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Benefits */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Start Listing Today
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">List in 10 Minutes</h4>
                    <p className="text-gray-600">Complete your first listing in under 10 minutes with our guided setup.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">First Month Free</h4>
                    <p className="text-gray-600">Try Premium features free for 30 days. No credit card required.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Full Support</h4>
                    <p className="text-gray-600">Get 24/7 support and guidance from our property experts.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Average Monthly Earnings</p>
                    <p className="text-2xl font-bold text-emerald-600">£1,850+</p>
                    <p className="text-sm text-gray-600">Per property listed on MYKEYS</p>
                  </div>
                  <Users className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - CTA Form */}
          <div>
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Begin Your Journey
                </h3>
                <p className="text-emerald-100">
                  Create your owner account and list your first property
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Smith"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg placeholder-emerald-200 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg placeholder-emerald-200 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+44 1234 567890"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg placeholder-emerald-200 text-white focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    What type of property do you have?
                  </label>
                  <select className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-transparent">
                    <option value="" className="bg-emerald-600">Select property type</option>
                    <option value="apartment" className="bg-emerald-600">Apartment</option>
                    <option value="house" className="bg-emerald-600">House</option>
                    <option value="villa" className="bg-emerald-600">Villa</option>
                    <option value="flat" className="bg-emerald-600">Flat</option>
                    <option value="other" className="bg-emerald-600">Other</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded text-emerald-600"
                  />
                  <label htmlFor="terms" className="text-sm text-emerald-100">
                    I agree to receive emails and updates about my listing
                  </label>
                </div>
                
                <Button className="w-full bg-white text-emerald-700 hover:bg-gray-100 py-6 text-lg font-bold">
                  Start Listing Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <p className="text-center text-emerald-200 text-sm">
                  No credit card required • Free 30-day trial of Premium features
                </p>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">4.8★</div>
                <div className="text-sm text-gray-600">Trustpilot</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">15K+</div>
                <div className="text-sm text-gray-600">Active Owners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">£0</div>
                <div className="text-sm text-gray-600">Listing Fees</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20">
          <DynamicFAQSection
            categories={["LISTING"]}
            limit={4}
            featuredOnly
            variant="cards"
            title="Frequently Asked Questions"
            showViewAll
            viewAllHref="/faq?category=LISTING"
          />
        </div>
      </div>
    </section>
  );
}