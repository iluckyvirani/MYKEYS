"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileUp, AlertCircle, Upload } from "lucide-react";
import { SERVICE_CATEGORIES, ServiceCategory } from "@/types/service";

interface ServiceRegistrationFormProps {
  onSubmit?: (data: any) => void;
}

export default function ServiceRegistrationForm({ onSubmit }: ServiceRegistrationFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceAreas: [] as string[],
    instantBooking: false,
    instantPrice: "",
    documents: [] as File[],
    experience: "",
    bio: "",
  });

  const serviceAreas = [
    "Downtown",
    "Suburbs",
    "North District",
    "East Side",
    "West Side",
    "Central",
    "South End",
  ];

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategories([]);
  };

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter((a) => a !== area)
        : [...prev.serviceAreas, area],
    }));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(e.target.files!)],
      }));
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 1) return selectedCategory && selectedSubcategories.length > 0;
    if (step === 2) return formData.serviceAreas.length > 0;
    if (step === 3) return formData.fullName && formData.email && formData.phone;
    if (step === 4) return formData.documents.length > 0;
    return false;
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      category: selectedCategory,
      subcategories: selectedSubcategories,
    };
    onSubmit?.(data);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Become a Service Professional
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our platform and reach thousands of customers looking for your services
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: "Category" },
              { num: 2, label: "Areas" },
              { num: 3, label: "Details" },
              { num: 4, label: "Documents" },
            ].map((item) => (
              <motion.div key={item.num} className="flex-1">
                <div className="flex items-center">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step > item.num
                        ? "bg-green-600 text-white"
                        : step === item.num
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                    animate={{ scale: step === item.num ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {step > item.num ? <CheckCircle className="w-6 h-6" /> : item.num}
                  </motion.div>
                  {item.num < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        step > item.num ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <p className="text-center text-sm font-medium text-gray-600 mt-2">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service Category</h2>
                <p className="text-gray-600">Choose the primary category you specialize in</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(SERVICE_CATEGORIES).map(([key, category]) => (
                  <motion.div
                    key={key}
                    onClick={() => handleCategorySelect(key as ServiceCategory)}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCategory === key
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-400"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 mt-2">{category.label}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Subcategories */}
              {selectedCategory && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Select your specializations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SERVICE_CATEGORIES[selectedCategory].subcategories.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(sub.id)}
                          onChange={() => handleSubcategoryToggle(sub.id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Step 2: Service Areas */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Areas</h2>
                <p className="text-gray-600">Select all areas where you can provide services</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceAreas.map((area) => (
                  <label
                    key={area}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.serviceAreas.includes(area)
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas.includes(area)}
                      onChange={() => handleAreaToggle(area)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Personal Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-gray-600">Provide your contact details and experience</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91-9876543210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="5"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <textarea
                    id="bio"
                    placeholder="Tell customers about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none h-24"
                  />
                </div>

                {/* Instant Booking Section */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.instantBooking}
                      onChange={(e) => handleInputChange("instantBooking", e.target.checked)}
                      className="w-5 h-5 text-yellow-600 rounded"
                    />
                    <span className="font-semibold text-gray-900">
                      Enable Instant Booking
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 ml-8">
                    Allow customers to book your service immediately
                  </p>

                  {formData.instantBooking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ml-8 mt-2"
                    >
                      <Label htmlFor="instantPrice">Instant Booking Rate (₹)</Label>
                      <Input
                        id="instantPrice"
                        type="number"
                        placeholder="500"
                        value={formData.instantPrice}
                        onChange={(e) => handleInputChange("instantPrice", e.target.value)}
                        className="mt-2"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Document Verification */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h2>
                <p className="text-gray-600">Upload documents for verification to build trust with customers</p>
              </div>

              <Card className="border-2 border-dashed">
                <CardContent className="pt-6">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-12 h-12 text-blue-600 mb-4" />
                    <span className="text-lg font-semibold text-gray-900 mb-1">
                      Upload Documents
                    </span>
                    <span className="text-sm text-gray-600 mb-4">
                      ID, License, Certificates, etc.
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  <Badge className="bg-green-100 text-green-800">Browse Files</Badge>
                  </label>
                </CardContent>
              </Card>

              {formData.documents.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <h4 className="font-semibold text-gray-900">Uploaded Documents</h4>
                  {formData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">{doc.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Your documents are secure</p>
                  <p>
                    All documents are verified and stored securely. Only approved documents
                    will be shown on your profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={() => setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 | 4 : prev))}
            variant="outline"
            disabled={step === 1}
            className="flex-1"
          >
            Previous
          </Button>

          <Button
            onClick={() => {
              if (step === 4) {
                handleSubmit();
              } else {
                setStep((prev) => (prev < 4 ? (prev + 1) as 1 | 2 | 3 | 4 : prev));
              }
            }}
            disabled={!canProceed()}
            className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer text-white"
          >
            {step === 4 ? "Complete Registration" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
