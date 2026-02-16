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
  Plus,
  Image as ImageIcon,
  AlertCircle,
  Loader
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment", icon: Home },
  { value: "VILLA", label: "Villa", icon: Building },
  { value: "HOUSE", label: "House", icon: Home },
  { value: "STUDIO", label: "Studio", icon: Home },
  { value: "PENTHOUSE", label: "Penthouse", icon: Building },
  { value: "COTTAGE", label: "Cottage", icon: Home },
  { value: "BUNGALOW", label: "Bungalow", icon: Home },
  { value: "COMMERCIAL", label: "Commercial", icon: Building },
];

interface AmenityOption {
  id: string;
  name: string;
}

export default function AddPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listingType, setListingType] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"short" | "long">("short");
  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    latitude: "",
    longitude: "",
    
    // Pricing - RENT
    price: "",
    priceType: "NIGHTLY",
    securityDeposit: "",
    cleaningFee: "",
    serviceFee: "",
    
    // Pricing - BUY
    propertyPrice: "",
    propertyTax: "",
    hoaFee: "",
    leasehold: false,
    leaseYears: "",
    groundRent: "",
    
    // Details
    beds: "",
    baths: "",
    sqft: "",
    guests: "",
    
    // Short Stay
    minStay: "1",
    maxStay: "30",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    yearBuilt: "",
    selfCheckIn: false,
    parking: false,
    
    // Long Term
    minTerm: "1",
    maxTerm: "24",
    availableFrom: "",
    billsIncluded: false,
    councilTaxBand: "",
    epcRating: "",
    
    // Features
    amenities: [] as string[],
    images: [] as File[],
  });

  // Fetch amenities on component mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoadingAmenities(true);
        const response = await api.get("/amenities?pageSize=50");
        if (response.data?.data?.items) {
          setAmenities(response.data?.data?.items);
        }
      } catch (err) {
        console.error("Error fetching amenities:", err);
        setError("Failed to load amenities");
      } finally {
        setLoadingAmenities(false);
      }
    };

    fetchAmenities();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      const newFiles = Array.from(files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.title || !formData.address || !formData.propertyType) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate pricing
      if (listingType === "buy" && !formData.propertyPrice) {
        setError("Please enter property price");
        return;
      }

      if (listingType === "rent" && !formData.price) {
        setError("Please enter rental price");
        return;
      }

      // Validate images
      if (formData.images.length < 1) {
        setError("Please upload at least one property image");
        return;
      }

      // Convert images to base64 or handle upload
      const imagePromises = formData.images.map(file => {
        return new Promise<{ url: string; caption?: string; isPrimary?: boolean }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              url: reader.result as string,
              isPrimary: formData.images[0] === file
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedImages = await Promise.all(imagePromises);

      // Prepare API payload
      const payload: any = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        propertyType: formData.propertyType,
        listingType: listingType === "buy" ? "BUY" : "RENT",
        bedrooms: formData.beds ? parseInt(formData.beds) : 0,
        bathrooms: formData.baths ? parseInt(formData.baths) : 0,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        guests: formData.guests ? parseInt(formData.guests) : 2,
        amenities: formData.amenities,
        images: uploadedImages,
        status: "ACTIVE"
      };

      if (listingType === "rent") {
        payload.rentalType = rentalType === "short" ? "SHORT_TERM" : "LONG_TERM";
        payload.price = parseInt(formData.price);
        payload.priceType = formData.priceType;
        payload.securityDeposit = formData.securityDeposit ? parseInt(formData.securityDeposit) : null;
        payload.cleaningFee = formData.cleaningFee ? parseInt(formData.cleaningFee) : null;
        payload.serviceFee = formData.serviceFee ? parseInt(formData.serviceFee) : null;

        if (rentalType === "short") {
          payload.minStay = formData.minStay ? parseInt(formData.minStay) : 1;
          payload.maxStay = formData.maxStay ? parseInt(formData.maxStay) : null;
          payload.checkInTime = formData.checkInTime;
          payload.checkOutTime = formData.checkOutTime;
          payload.yearBuilt = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
          payload.selfCheckIn = formData.selfCheckIn;
          payload.parking = formData.parking;
        } else {
          payload.minTerm = formData.minTerm ? parseInt(formData.minTerm) : 1;
          payload.maxTerm = formData.maxTerm ? parseInt(formData.maxTerm) : null;
          payload.availableFrom = formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null;
          payload.billsIncluded = formData.billsIncluded;
          payload.councilTaxBand = formData.councilTaxBand || null;
          payload.epcRating = formData.epcRating || null;
          payload.yearBuilt = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
          payload.parking = formData.parking;
        }
      } else {
        // BUY listing
        payload.propertyPrice = parseInt(formData.propertyPrice);
        payload.propertyTax = formData.propertyTax ? parseInt(formData.propertyTax) : null;
        payload.hoaFee = formData.hoaFee ? parseInt(formData.hoaFee) : null;
        payload.leasehold = formData.leasehold;
        payload.leaseYears = formData.leaseYears ? parseInt(formData.leaseYears) : null;
        payload.groundRent = formData.groundRent ? parseInt(formData.groundRent) : null;
        payload.yearBuilt = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
        payload.parking = formData.parking;
        // For BUY, set a dummy price for the database (required field)
        payload.price = parseInt(formData.propertyPrice);
        payload.priceType = "TOTAL";
      }

      const response = await api.post("/properties", payload);
      
      if (response.data?.success) {
        router.push("/owner/dashboard/properties");
      } else {
        setError(response.data?.message || "Failed to create property");
      }
    } catch (err: any) {
      console.error("Error creating property:", err);
      setError(err.response?.data?.message || "Failed to create property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing Type</h3>
        <p className="text-sm text-gray-600 mb-4">Choose how you want to list your property</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => { 
              setListingType("rent"); 
              setRentalType("short"); 
            }}
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
            onClick={() => { 
              setListingType("rent"); 
              setRentalType("long"); 
            }}
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

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Mumbai"
              required
            />
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="e.g., Maharashtra"
              required
            />
          </div>

          <div>
            <Label htmlFor="zipCode">Postal Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="e.g., 400001"
            />
          </div>

          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="e.g., 19.0760"
            />
          </div>

          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="e.g., 72.8777"
            />
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
            <Label htmlFor="sqft">Area (sq ft)</Label>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {listingType === "buy" ? "Sale Information" : "Pricing Information"}
        </h3>
        
        {listingType === "buy" ? (
          // Buy Listing Pricing
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="propertyPrice">Property Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="propertyPrice"
                  name="propertyPrice"
                  type="number"
                  value={formData.propertyPrice}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Total sale price"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="propertyTax">Annual Property Tax</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="propertyTax"
                  name="propertyTax"
                  type="number"
                  value={formData.propertyTax}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Annual tax amount"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hoaFee">HOA / Service Charge (Monthly)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="hoaFee"
                  name="hoaFee"
                  type="number"
                  value={formData.hoaFee}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Monthly HOA fee"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="leasehold"
                  checked={formData.leasehold}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="ml-2 text-gray-700">Leasehold Property</span>
              </label>
            </div>

            {formData.leasehold && (
              <>
                <div>
                  <Label htmlFor="leaseYears">Remaining Lease (years)</Label>
                  <Input
                    id="leaseYears"
                    name="leaseYears"
                    type="number"
                    value={formData.leaseYears}
                    onChange={handleInputChange}
                    placeholder="e.g., 99"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="groundRent">Ground Rent (Annual)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="groundRent"
                      name="groundRent"
                      type="number"
                      value={formData.groundRent}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="Annual ground rent"
                      min="0"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                name="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={handleInputChange}
                placeholder="e.g., 2020"
                min="1800"
                max="2100"
              />
            </div>

            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="parking"
                  checked={formData.parking}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="ml-2 text-gray-700">Parking Available</span>
              </label>
            </div>
          </div>
        ) : (
          // Rent Listing Pricing
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="price">
                {rentalType === "short" ? "Price per Night *" : "Monthly Rent *"}
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

            {rentalType === "short" && (
              <>
                <div>
                  <Label htmlFor="cleaningFee">Cleaning Fee</Label>
                  <Input
                    id="cleaningFee"
                    name="cleaningFee"
                    type="number"
                    value={formData.cleaningFee}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input
                    id="securityDeposit"
                    name="securityDeposit"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="serviceFee">Service Fee</Label>
                  <Input
                    id="serviceFee"
                    name="serviceFee"
                    type="number"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input
                      id="checkInTime"
                      name="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkOutTime">Check-out Time</Label>
                    <Input
                      id="checkOutTime"
                      name="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1800"
                    max="2100"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="selfCheckIn"
                      checked={formData.selfCheckIn}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Self Check-in Available</span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Parking Available</span>
                  </label>
                </div>
              </>
            )}

            {rentalType === "long" && (
              <>
                <div>
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input
                    id="securityDeposit"
                    name="securityDeposit"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minTerm">Minimum Lease (months)</Label>
                    <Input
                      id="minTerm"
                      name="minTerm"
                      type="number"
                      value={formData.minTerm}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTerm">Maximum Lease (months)</Label>
                    <Input
                      id="maxTerm"
                      name="maxTerm"
                      type="number"
                      value={formData.maxTerm}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="billsIncluded"
                      checked={formData.billsIncluded}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Bills Included</span>
                  </label>
                </div>

                <div>
                  <Label htmlFor="councilTaxBand">Council Tax Band</Label>
                  <Input
                    id="councilTaxBand"
                    name="councilTaxBand"
                    value={formData.councilTaxBand}
                    onChange={handleInputChange}
                    placeholder="e.g., Band A, Band B"
                  />
                </div>

                <div>
                  <Label htmlFor="epcRating">EPC Rating</Label>
                  <select
                    id="epcRating"
                    name="epcRating"
                    value={formData.epcRating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select rating</option>
                    <option value="A">A (Most efficient)</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G (Least efficient)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={handleInputChange}
                    placeholder="e.g., 2020"
                    min="1800"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">Parking Available</span>
                  </label>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Amenities</h3>
        <p className="text-sm text-gray-600 mb-6">Select amenities available in your property</p>
        
        {loadingAmenities ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-600">Loading amenities...</span>
          </div>
        ) : amenities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenities.map((amenity) => {
              const isSelected = formData.amenities.includes(amenity.id);
              
              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-4 rounded-[5px] border-2 transition-all flex flex-col items-center relative ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`text-sm font-medium text-center ${isSelected ? "text-green-700" : "text-gray-700"}`}>
                    {amenity.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-green-600 absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-[5px] border">
            <p className="text-gray-600">No amenities available</p>
          </div>
        )}
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>
        <p className="text-sm text-gray-600 mb-6">Upload high-quality photos of your property (minimum 1)</p>
        
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
            <div key={index} className="relative aspect-video rounded-[5px] overflow-hidden group bg-gray-100">
              <Image
                src={URL.createObjectURL(image)}
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
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 to-transparent p-3">
                <p className="text-white text-sm truncate">{image.name}</p>
              </div>
            </div>
          ))}
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Uploaded {formData.images.length} image{formData.images.length > 1 ? 's' : ''}. {formData.images.length < 5 ? `Add ${5 - formData.images.length} more for best results.` : 'Ready to publish!'}
          </div>
        )}
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
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          
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
                disabled={loading}
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Building className="w-4 h-4 mr-2" />
                    Publish Property
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </form>
    </DashboardLayout>
  );
}