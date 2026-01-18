"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Maximize2,
  Upload, 
  X, 
  Check, 
  Calendar,
  Home,
  Hotel,
  TrendingUp,
  Wifi,
  Car,
  Wind,
  Utensils,
  Tv,
  Shield,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const propertyTypes = [
  { value: "apartment", label: "Apartment", icon: Home },
  { value: "villa", label: "Villa", icon: Building },
  { value: "house", label: "House", icon: Home },
  { value: "studio", label: "Studio", icon: Home },
  { value: "penthouse", label: "Penthouse", icon: Building },
  { value: "cottage", label: "Cottage", icon: Home },
  { value: "bungalow", label: "Bungalow", icon: Home },
  { value: "commercial", label: "Commercial", icon: Building },
];

const amenities = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "tv", label: "TV", icon: Tv },
  { id: "pool", label: "Swimming Pool", icon: Wind },
  { id: "gym", label: "Gym", icon: Wind },
  { id: "security", label: "Security", icon: Shield },
  { id: "elevator", label: "Elevator", icon: Wind },
  { id: "laundry", label: "Laundry", icon: Wind },
  { id: "balcony", label: "Balcony", icon: Wind },
  { id: "garden", label: "Garden", icon: Wind },
];

export default function AddPropertyPage() {
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"short" | "long">("short");
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    propertyType: "",
    address: "",
    
    // Pricing
    price: "",
    priceType: "nightly", // nightly, monthly, total
    securityDeposit: "",
    cleaningFee: "",
    serviceFee: "",
    
    // Details
    beds: "",
    baths: "",
    sqft: "",
    guests: "",
    minStay: "2",
    maxStay: "30",
    minLease: "12",
    maxLease: "24",
    
    // Availability
    availableFrom: "",
    
    // Features
    amenities: [] as string[],
    images: [] as string[],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In real app, upload to cloud storage
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Property submitted:", formData);
    alert("Property added successfully!");
    // In real app, submit to API
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing Type</h3>
        <p className="text-sm text-gray-600 mb-4">Choose how you want to list your property</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => { setListingType("rent"); setRentalType("short"); }}
            className={`p-6 rounded-[5px] border-2 transition-all ${
              listingType === "rent" && rentalType === "short"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
              <Hotel className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Short Stay</h4>
            <p className="text-sm text-gray-600">Airbnb-style, per night bookings</p>
            <div className="mt-4 text-sm text-green-600 font-medium">
              Commission: 10-15%
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setListingType("rent"); setRentalType("long"); }}
            className={`p-6 rounded-[5px] border-2 transition-all ${
              listingType === "rent" && rentalType === "long"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Long Term Rent</h4>
            <p className="text-sm text-gray-600">Monthly rentals, 2+ months minimum</p>
            <div className="mt-4 text-sm text-blue-600 font-medium">
              Commission: 5-8%
            </div>
          </button>

          <button
            type="button"
            onClick={() => setListingType("buy")}
            className={`p-6 rounded-[5px] border-2 transition-all ${
              listingType === "buy"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">For Sale</h4>
            <p className="text-sm text-gray-600">One-time property sale</p>
            <div className="mt-4 text-sm text-purple-600 font-medium">
              Commission: 1.5-3.5%
            </div>
          </button>
        </div>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Modern 3BHK Apartment with Pool"
              required
            />
          </div>

          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select type</option>
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Complete Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="pl-10"
                placeholder="Street, City, State, Postal Code"
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Property Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe your property's features, amenities, and what makes it special..."
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="beds">Bedrooms *</Label>
            <div className="relative">
              <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="beds"
                name="beds"
                type="number"
                value={formData.beds}
                onChange={handleInputChange}
                className="pl-10"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="baths">Bathrooms *</Label>
            <div className="relative">
              <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="baths"
                name="baths"
                type="number"
                value={formData.baths}
                onChange={handleInputChange}
                className="pl-10"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sqft">Area (sq ft) *</Label>
            <div className="relative">
              <Maximize2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="sqft"
                name="sqft"
                type="number"
                value={formData.sqft}
                onChange={handleInputChange}
                className="pl-10"
                min="0"
                required
              />
            </div>
          </div>

          {listingType === "rent" && rentalType === "short" && (
            <div>
              <Label htmlFor="guests">Max Guests</Label>
              <Input
                id="guests"
                name="guests"
                type="number"
                value={formData.guests}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="price">
              {listingType === "buy" ? "Total Price *" : 
               rentalType === "short" ? "Price per Night *" : 
               "Monthly Rent *"}
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                className="pl-10"
                min="0"
                required
              />
            </div>
          </div>

          {listingType === "rent" && rentalType === "short" && (
            <>
              <div>
                <Label htmlFor="cleaningFee">Cleaning Fee</Label>
                <Input
                  id="cleaningFee"
                  name="cleaningFee"
                  value={formData.cleaningFee}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="serviceFee">Service Fee</Label>
                <Input
                  id="serviceFee"
                  name="serviceFee"
                  value={formData.serviceFee}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minStay">Minimum Stay (nights)</Label>
                  <Input
                    id="minStay"
                    name="minStay"
                    type="number"
                    value={formData.minStay}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxStay">Maximum Stay (nights)</Label>
                  <Input
                    id="maxStay"
                    name="maxStay"
                    type="number"
                    value={formData.maxStay}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>
            </>
          )}

          {listingType === "rent" && rentalType === "long" && (
            <>
              <div>
                <Label htmlFor="securityDeposit">Security Deposit</Label>
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minLease">Minimum Lease (months)</Label>
                  <Input
                    id="minLease"
                    name="minLease"
                    type="number"
                    value={formData.minLease}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxLease">Maximum Lease (months)</Label>
                  <Input
                    id="maxLease"
                    name="maxLease"
                    type="number"
                    value={formData.maxLease}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  name="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Amenities</h3>
        <p className="text-sm text-gray-600 mb-6">Select amenities available in your property</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {amenities.map((amenity) => {
            const isSelected = formData.amenities.includes(amenity.id);
            const Icon = amenity.icon;
            
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`p-4 rounded-[5px] border-2 transition-all flex flex-col items-center ${
                  isSelected
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-green-600" : "text-gray-500"}`} />
                <span className={`text-sm font-medium ${isSelected ? "text-green-700" : "text-gray-700"}`}>
                  {amenity.label}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-green-600 absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
        <p className="text-sm text-gray-600 mb-6">Upload high-quality photos of your property (minimum 5)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Image Upload Box */}
          <label className="aspect-video border-2 border-dashed border-gray-300 rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Upload Photos</p>
            <p className="text-xs text-gray-500 mt-1">Click or drag & drop</p>
          </label>

          {/* Uploaded Images */}
          {formData.images.map((image, index) => (
            <div key={index} className="relative aspect-video rounded-[5px] overflow-hidden group">
              <Image
                src={image}
                alt={`Property ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm">Image {index + 1}</p>
              </div>
            </div>
          ))}
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Uploaded {formData.images.length} images. Add more to reach minimum 5.
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="houseRules">House Rules (for short stay)</Label>
            <Textarea
              id="houseRules"
              name="houseRules"
              rows={3}
              placeholder="List any specific rules for guests..."
            />
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <select
              id="cancellationPolicy"
              name="cancellationPolicy"
              className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="flexible">Flexible (Full refund 24h before check-in)</option>
              <option value="moderate">Moderate (Full refund 5 days before check-in)</option>
              <option value="strict">Strict (50% refund up to 1 week before)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout defaultRole="owner">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? "List Your Property" : 
               step === 2 ? "Property Details" : 
               "Finalize Listing"}
            </h1>
            <p className="text-gray-600 mt-2">
              Complete all steps to publish your property
            </p>
          </div>
          <Link href="/owner/dashboard/properties">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step === stepNumber
                    ? "bg-green-600 border-green-600 text-white"
                    : step > stepNumber
                    ? "bg-green-100 border-green-600 text-green-600"
                    : "bg-white border-gray-300 text-gray-500"
                }`}>
                  {step > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    step >= stepNumber ? "text-gray-900" : "text-gray-500"
                  }`}>
                    {stepNumber === 1 && "Basic Info"}
                    {stepNumber === 2 && "Details & Pricing"}
                    {stepNumber === 3 && "Features & Images"}
                  </div>
                </div>
                {stepNumber < 3 && (
                  <div className={`w-24 h-0.5 mx-4 ${
                    step > stepNumber ? "bg-green-600" : "bg-gray-300"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-[5px] border p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Previous Step
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Next Step
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8"
              >
                <Building className="w-4 h-4 mr-2" />
                Publish Property
              </Button>
            )}
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="mt-6 bg-gray-50 rounded-[5px] border p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Listing Preview</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Listing Type:</span>
              <span className="font-medium">
                {listingType === "buy" ? "For Sale" : 
                 rentalType === "short" ? "Short Stay" : "Long Term Rent"}
              </span>
            </div>
            {formData.title && (
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium truncate">{formData.title}</span>
              </div>
            )}
            {formData.price && (
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">
                  ₹{formData.price} {listingType === "rent" ? (rentalType === "short" ? "/night" : "/month") : "total"}
                </span>
              </div>
            )}
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}