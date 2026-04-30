"use client";

import { 
  Plus, 
  Target, 
  Image, 
  Video, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Add type definitions
interface FormData {
  campaignName: string;
  property: string;
  platform: string;
  adType: string;
  targetAudience: string[]; // Explicitly type as string array
  budget: number;
  duration: number;
  objective: string;
}

const propertyOptions = [
  { id: "PROP001", name: "Seaside Luxury Villa" },
  { id: "PROP002", name: "Modern 2BHK Apartment" },
  { id: "PROP003", name: "Mountain View Cottage" },
  { id: "PROP004", name: "Luxury Penthouse" },
  { id: "PROP005", name: "Beachfront Bungalow" },
];

const platformOptions = [
  { id: "facebook", name: "Facebook", icon: TrendingUp },
  { id: "instagram", name: "Instagram", icon: Sparkles },
  { id: "google", name: "Google", icon: Target },
];

const adTypeOptions = [
  { id: "image", name: "Image Ad", icon: Image },
  { id: "video", name: "Video Ad", icon: Video },
  { id: "carousel", name: "Carousel", icon: Image },
  { id: "collection", name: "Collection", icon: Image },
];

const targetAudienceOptions = [
  { id: "families", name: "Families", count: "45K" },
  { id: "couples", name: "Couples", count: "38K" },
  { id: "professionals", name: "Professionals", count: "52K" },
  { id: "vacationers", name: "Vacationers", count: "67K" },
  { id: "business", name: "Business Travelers", count: "28K" },
];

export default function CreateAdCampaign() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({ // Add type annotation
    campaignName: "",
    property: "",
    platform: "",
    adType: "",
    targetAudience: [], // Now properly typed as string[]
    budget: 10000,
    duration: 30,
    objective: "bookings",
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTargetAudienceToggle = (audienceId: string) => {
    setFormData(prev => {
      const current = prev.targetAudience;
      if (current.includes(audienceId)) {
        return { ...prev, targetAudience: current.filter(id => id !== audienceId) };
      } else {
        return { ...prev, targetAudience: [...current, audienceId] };
      }
    });
  };

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    alert("Campaign created successfully!");
    setFormData({
      campaignName: "",
      property: "",
      platform: "",
      adType: "",
      targetAudience: [],
      budget: 10000,
      duration: 30,
      objective: "bookings",
    });
    setStep(1);
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Create Campaign</h3>
          <p className="text-sm text-gray-500 mt-1">
            Quick setup for new ad campaigns
          </p>
        </div>
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus className="w-5 h-5 text-green-600" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step >= stepNumber 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-600"
              }
            `}>
              {stepNumber}
            </div>
            {stepNumber < 4 && (
              <div className={`
                w-16 h-1 mx-2
                ${step > stepNumber ? "bg-green-600" : "bg-gray-200"}
              `}></div>
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., Summer Promotion - Seaside Villa"
                value={formData.campaignName}
                onChange={(e) => handleInputChange("campaignName", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Property
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={formData.property}
                onChange={(e) => handleInputChange("property", e.target.value)}
              >
                <option value="">Choose a property</option>
                {propertyOptions.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Objective
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`p-3 border rounded-[5px] text-center ${
                    formData.objective === "awareness"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleInputChange("objective", "awareness")}
                >
                  <div className="font-medium">Awareness</div>
                  <div className="text-xs text-gray-500">Increase visibility</div>
                </button>
                <button
                  type="button"
                  className={`p-3 border rounded-[5px] text-center ${
                    formData.objective === "bookings"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => handleInputChange("objective", "bookings")}
                >
                  <div className="font-medium">Bookings</div>
                  <div className="text-xs text-gray-500">Drive reservations</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Platform
              </label>
              <div className="grid grid-cols-3 gap-3">
                {platformOptions.map((platform) => {
                  const PlatformIcon = platform.icon;
                  
                  return (
                    <button
                      type="button"
                      key={platform.id}
                      className={`p-3 border rounded-[5px] text-center ${
                        formData.platform === platform.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleInputChange("platform", platform.id)}
                    >
                      <PlatformIcon className="w-5 h-5 mx-auto mb-2" />
                      <div className="font-medium">{platform.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {adTypeOptions.map((type) => {
                  const TypeIcon = type.icon;
                  
                  return (
                    <button
                      type="button"
                      key={type.id}
                      className={`p-3 border rounded-[5px] text-center ${
                        formData.adType === type.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => handleInputChange("adType", type.id)}
                    >
                      <TypeIcon className="w-5 h-5 mx-auto mb-2" />
                      <div className="font-medium">{type.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <div className="space-y-2">
                {targetAudienceOptions.map((audience) => (
                  <button
                    type="button"
                    key={audience.id}
                    className={`w-full flex items-center justify-between p-3 border rounded-[5px] ${
                      formData.targetAudience.includes(audience.id)
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => handleTargetAudienceToggle(audience.id)}
                  >
                    <div className="font-medium">{audience.name}</div>
                    <div className="text-sm text-gray-500">{audience.count} users</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget & Duration
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Budget</span>
                  </div>
                  <div className="text-2xl font-bold">£{formData.budget.toLocaleString()}</div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="5000"
                    value={formData.budget}
                    onChange={(e) => handleInputChange("budget", parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <div className="text-2xl font-bold">{formData.duration} days</div>
                  <input
                    type="range"
                    min="7"
                    max="90"
                    step="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 font-medium mb-2">Campaign Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign Name:</span>
                  <span className="font-medium">{formData.campaignName || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium capitalize">{formData.platform || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium">£{formData.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formData.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Audience:</span>
                  <span className="font-medium">{formData.targetAudience.length} selected</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 font-medium mb-2">Estimated Results</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Impressions</div>
                  <div className="font-bold">~{((formData.budget / 14.77) * 1000).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Estimated Clicks</div>
                  <div className="font-bold">~{Math.round(formData.budget / 14.77)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Cost per Click</div>
                  <div className="font-bold">£14.77</div>
                </div>
                <div>
                  <div className="text-gray-600">Potential Bookings</div>
                  <div className="font-bold">~{Math.round((formData.budget / 14.77) * 0.125)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        {step > 1 && (
          <Button variant="outline" onClick={handlePreviousStep}>
            Previous
          </Button>
        )}
        {step < 4 ? (
          <Button
            className="bg-green-600 hover:bg-green-700 ml-auto"
            onClick={handleNextStep}
            disabled={step === 1 && (!formData.campaignName || !formData.property)}
          >
            Next Step
          </Button>
        ) : (
          <Button
            className="bg-green-600 hover:bg-green-700 ml-auto"
            onClick={handleSubmit}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        )}
      </div>
    </div>
  );
}