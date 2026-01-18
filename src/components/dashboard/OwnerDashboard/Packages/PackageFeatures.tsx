"use client";

import { Check, X, Star, Target, Globe, Crown } from "lucide-react";

const features = [
  {
    category: "Property Management",
    items: [
      { name: "Property Listings", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Unlimited Photos", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Virtual Tours", basic: false, professional: true, premium: true, enterprise: true },
      { name: "3D Floor Plans", basic: false, professional: false, premium: true, enterprise: true },
      { name: "Property Scheduling", basic: true, professional: true, premium: true, enterprise: true },
    ],
  },
  {
    category: "Booking & Calendar",
    items: [
      { name: "Online Bookings", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Calendar Sync", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Auto Pricing", basic: false, professional: true, premium: true, enterprise: true },
      { name: "Channel Manager", basic: false, professional: true, premium: true, enterprise: true },
      { name: "Multi-calendar", basic: false, professional: false, premium: true, enterprise: true },
    ],
  },
  {
    category: "Marketing & Visibility",
    items: [
      { name: "Featured Listings", basic: 0, professional: 2, premium: 5, enterprise: "All" },
      { name: "SEO Optimization", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Social Media Integration", basic: false, professional: true, premium: true, enterprise: true },
      { name: "Email Marketing", basic: false, professional: false, premium: true, enterprise: true },
      { name: "Promotion Tools", basic: false, professional: true, premium: true, enterprise: true },
    ],
  },
  {
    category: "Analytics & Reports",
    items: [
      { name: "Basic Analytics", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Advanced Analytics", basic: false, professional: true, premium: true, enterprise: true },
      { name: "Custom Reports", basic: false, professional: false, premium: true, enterprise: true },
      { name: "Revenue Forecasting", basic: false, professional: false, premium: true, enterprise: true },
      { name: "Competitor Analysis", basic: false, professional: false, premium: false, enterprise: true },
    ],
  },
  {
    category: "Support & Security",
    items: [
      { name: "Email Support", basic: true, professional: true, premium: true, enterprise: true },
      { name: "Chat Support", basic: false, professional: true, premium: true, enterprise: true },
      { name: "Phone Support", basic: false, professional: false, premium: true, enterprise: true },
      { name: "Dedicated Manager", basic: false, professional: false, premium: true, enterprise: true },
      { name: "SSL Security", basic: true, professional: true, premium: true, enterprise: true },
    ],
  },
];

export default function PackageFeatures() {
  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
          <p className="text-sm text-gray-500 mt-1">
            Compare features across all plans
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs">Included</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-gray-300"></div>
            <span className="text-xs">Not Included</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Features</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Basic</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Professional</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Premium</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {features.map((category, categoryIndex) => (
              <>
                <tr key={`category-${categoryIndex}`} className="bg-gray-50">
                  <td colSpan={5} className="py-3 px-4 font-medium text-gray-900">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item, itemIndex) => (
                  <tr key={`item-${categoryIndex}-${itemIndex}`} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{item.name}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof item.basic === 'boolean' ? (
                        item.basic ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{item.basic}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof item.professional === 'boolean' ? (
                        item.professional ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{item.professional}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof item.premium === 'boolean' ? (
                        item.premium ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{item.premium}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof item.enterprise === 'boolean' ? (
                        item.enterprise ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="font-medium">{item.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tips */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Choosing the Right Plan</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Basic Plan</div>
              <div className="text-xs text-gray-600">Perfect for individual owners with 1-3 properties</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Star className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Professional Plan</div>
              <div className="text-xs text-gray-600">Best for growing businesses with 4-10 properties</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Crown className="w-4 h-4 text-purple-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Premium Plan</div>
              <div className="text-xs text-gray-600">Ideal for established businesses with 11-25 properties</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Enterprise Plan</div>
              <div className="text-xs text-gray-600">For large property management companies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}