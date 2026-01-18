"use client";

import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock, 
  DollarSign,
  Sparkles,
  Calendar,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const suggestions = [
  {
    id: 1,
    title: "Boost Weekend Bookings",
    description: "Target weekend travelers with special offers for Friday-Sunday stays",
    impact: "high",
    estimatedIncrease: "+25%",
    cost: 15000,
    duration: "14 days",
    audience: "Weekend travelers, Couples",
    properties: ["Seaside Villa", "Mountain Cottage"],
    platform: "instagram",
  },
  {
    id: 2,
    title: "Long-term Rental Promotion",
    description: "Promote monthly discounts for professionals relocating for work",
    impact: "medium",
    estimatedIncrease: "+18%",
    cost: 20000,
    duration: "30 days",
    audience: "Professionals, Remote workers",
    properties: ["Modern Apartment", "Luxury Penthouse"],
    platform: "linkedin",
  },
  {
    id: 3,
    title: "Seasonal Summer Campaign",
    description: "Capitalize on summer vacation season with beach property promotions",
    impact: "high",
    estimatedIncrease: "+35%",
    cost: 30000,
    duration: "60 days",
    audience: "Families, Vacationers",
    properties: ["Seaside Villa", "Beachfront Bungalow"],
    platform: "facebook",
  },
  {
    id: 4,
    title: "Retargeting Campaign",
    description: "Re-engage users who visited property pages but didn't book",
    impact: "medium",
    estimatedIncrease: "+15%",
    cost: 12000,
    duration: "21 days",
    audience: "Previous visitors",
    properties: ["All Properties"],
    platform: "google",
  },
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "facebook":
      return "bg-blue-100 text-blue-800";
    case "instagram":
      return "bg-pink-100 text-pink-800";
    case "linkedin":
      return "bg-blue-50 text-blue-700";
    case "google":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AdSuggestions() {
  const applySuggestion = (id: number) => {
    alert(`Applying suggestion #${id}... Redirecting to campaign creation.`);
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered recommendations to boost your performance
          </p>
        </div>
        <div className="p-2 bg-purple-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
              </div>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                onClick={() => applySuggestion(suggestion.id)}
              >
                Apply
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Est. Increase:</span>
                <span className="font-medium text-green-600">{suggestion.estimatedIncrease}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium">{formatCurrency(suggestion.cost)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{suggestion.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600">Audience:</span>
                <span className="font-medium truncate">{suggestion.audience}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${getPlatformColor(suggestion.platform)}`}>
                  {suggestion.platform.charAt(0).toUpperCase() + suggestion.platform.slice(1)}
                </span>
                <span className="text-xs text-gray-500">
                  {suggestion.properties.length} propert{suggestion.properties.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI Recommended
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Tips */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Quick Tips</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Optimize Ad Timing</div>
              <div className="text-xs text-gray-600">
                Post ads on weekends for 35% higher engagement
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Seasonal Planning</div>
              <div className="text-xs text-gray-600">
                Start summer campaigns 60 days in advance for best results
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-purple-600 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Budget Allocation</div>
              <div className="text-xs text-gray-600">
                Allocate 60% budget to top-performing platforms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}