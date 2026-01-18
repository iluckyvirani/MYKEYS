"use client";

import { useState } from "react";
import { 
  Home, 
  Camera, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle,
  Building2,
  Castle,
  Bed,
  Bath,
  Maximize2
} from "lucide-react";

export default function PropertyRegistrationFlow() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, title: "Basic Info", icon: <Home className="w-5 h-5" /> },
    { id: 2, title: "Property Type", icon: <Building2 className="w-5 h-5" /> },
    { id: 3, title: "Details & Photos", icon: <Camera className="w-5 h-5" /> },
    { id: 4, title: "Pricing", icon: <DollarSign className="w-5 h-5" /> },
    { id: 5, title: "Availability", icon: <Calendar className="w-5 h-5" /> },
    { id: 6, title: "Review", icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const propertyTypes = [
    { 
      type: "sell", 
      title: "Sell", 
      description: "List for one-time purchase",
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600"
    },
    { 
      type: "short-rent", 
      title: "Short Rent", 
      description: "Nightly/weekly rentals",
      icon: <Calendar className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-600"
    },
    { 
      type: "long-rent", 
      title: "Long Rent", 
      description: "2+ months rentals",
      icon: <FileText className="w-6 h-6" />,
      color: "from-orange-500 to-amber-600"
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Easy Property Registration
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            List your property in minutes with our step-by-step process
          </p>
        </div>

        {/* Step Progress */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => (
              <div key={step.id} className="relative z-10">
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.id <= activeStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {step.id < activeStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                  <span className={`text-sm font-medium ${
                    step.id <= activeStep ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form Demo */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {steps.find(s => s.id === activeStep)?.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  Step {activeStep} of {steps.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Estimated time</div>
                <div className="text-lg font-bold text-emerald-600">3-5 minutes</div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    We'll automatically detect city and postcode
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bed className="w-4 h-4 inline mr-2" />
                      Bedrooms
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option>Select</option>
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Bath className="w-4 h-4 inline mr-2" />
                      Bathrooms
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                      <option>Select</option>
                      {[1,2,3,4,5].map(num => (
                        <option key={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Maximize2 className="w-4 h-4 inline mr-2" />
                      Square Feet
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 1200"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    What do you want to do with this property?
                  </h4>
                  <p className="text-gray-600 mb-6">
                    Choose one primary listing type. You can always add other types later.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {propertyTypes.map((pt) => (
                      <button
                        key={pt.type}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          activeStep === 2 
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50' 
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${pt.color} flex items-center justify-center mb-4 mx-auto`}>
                          <div className="text-white">
                            {pt.icon}
                          </div>
                        </div>
                        <h5 className="text-xl font-bold text-gray-900 mb-2">{pt.title}</h5>
                        <p className="text-gray-600">{pt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium">Pro Tip</p>
                      <p className="text-blue-700 text-sm mt-1">
                        For maximum exposure, list as Short Rent first. You'll get bookings quickly 
                        and can switch to Long Rent or Sale anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Add Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map((num) => (
                      <div key={num} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    Properties with 8+ photos get 3x more inquiries
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Property Description</h4>
                  <textarea
                    rows={4}
                    placeholder="Describe your property. What makes it special? Mention nearby attractions, amenities, and unique features."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['WiFi', 'Parking', 'Kitchen', 'Pool', 'Gym', 'Garden', 'AC', 'TV'].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-emerald-600" />
                        <span className="text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={() => setActiveStep(prev => Math.max(prev - 1, 1))}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={activeStep === 1}
              >
                Back
              </button>
              
              <button
                onClick={() => setActiveStep(prev => Math.min(prev + 1, steps.length))}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
              >
                {activeStep === steps.length ? 'Complete Listing' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}