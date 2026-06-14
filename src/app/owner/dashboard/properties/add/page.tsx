"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { renderAmenityIcon } from "@/components/dashboard/AdminAmenityModal";
import PropertyDocumentsTab from "@/components/owner/PropertyDocumentsTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Building, 
  MapPin, 
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
  Loader,
  GripVertical,
  Star,
  PoundSterling,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import LocationPickerMap, { LocationResult } from "@/components/common/LocationPickerMap";
import {
  formatCommissionPercent,
  useShortRentCommission,
} from "@/hooks/useShortRentCommission";

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
  icon?: string;
}

export default function AddPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragSrcIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  type RequiredField =
    | "title"
    | "propertyType"
    | "address"
    | "city"
    | "state"
    | "zipCode"
    | "description"
    | "beds"
    | "baths"
    | "price"
    | "propertyPrice";

  const STEP1_FIELDS: RequiredField[] = [
    "title",
    "propertyType",
    "address",
    "city",
    "state",
    "zipCode",
    "description",
  ];

  const getStep2Fields = (): RequiredField[] => {
    const fields: RequiredField[] = ["beds", "baths"];
    if (listingType === "buy") fields.push("propertyPrice");
    else fields.push("price");
    return fields;
  };

  const getFieldsForStep = (stepNum: number): RequiredField[] => {
    if (stepNum === 1) return STEP1_FIELDS;
    if (stepNum === 2) return getStep2Fields();
    return [];
  };

  const getFieldValue = (name: RequiredField): string => {
    return String(formData[name as keyof typeof formData] ?? "");
  };

  const getFieldErrorMessage = (name: RequiredField, value: string): string | undefined => {
    switch (name) {
      case "title":
        return value.trim() ? undefined : "Property title is required";
      case "propertyType":
        return value ? undefined : "Property type is required";
      case "address":
        return value.trim() ? undefined : "Complete address is required";
      case "city":
        return value.trim() ? undefined : "City is required";
      case "state":
        return value.trim() ? undefined : "State is required";
      case "zipCode":
        return value.trim() ? undefined : "Postal code is required";
      case "description":
        return value.trim() ? undefined : "Property description is required";
      case "beds":
        return value.trim() !== "" && !Number.isNaN(Number(value))
          ? undefined
          : "Bedrooms is required";
      case "baths":
        return value.trim() !== "" && !Number.isNaN(Number(value))
          ? undefined
          : "Bathrooms is required";
      case "price":
        if (listingType !== "rent") return undefined;
        return value.trim() !== "" && Number(value) > 0
          ? undefined
          : rentalType === "short"
          ? "Price per night is required"
          : "Monthly rent is required";
      case "propertyPrice":
        if (listingType !== "buy") return undefined;
        return value.trim() !== "" && Number(value) > 0
          ? undefined
          : "Property price is required";
      default:
        return undefined;
    }
  };

  const clearFieldError = (name: RequiredField) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateField = (name: RequiredField, value?: string): boolean => {
    const fieldValue = value ?? getFieldValue(name);
    const message = getFieldErrorMessage(name, fieldValue);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
    return !message;
  };

  const validateStep = (stepNum: number, markTouched = false): boolean => {
    const fields = getFieldsForStep(stepNum);
    if (markTouched) {
      setTouchedFields((prev) => {
        const next = { ...prev };
        fields.forEach((field) => {
          next[field] = true;
        });
        return next;
      });
    }

    let valid = true;
    setFieldErrors((prev) => {
      const next = { ...prev };
      fields.forEach((field) => {
        const message = getFieldErrorMessage(field, getFieldValue(field));
        if (message) {
          next[field] = message;
          valid = false;
        } else {
          delete next[field];
        }
      });
      return next;
    });
    return valid;
  };

  const isStepInvalid = (stepNum: number): boolean => {
    return getFieldsForStep(stepNum).some(
      (field) => Boolean(getFieldErrorMessage(field, getFieldValue(field)))
    );
  };

  const fieldErrorClass = (name: RequiredField) =>
    fieldErrors[name] ? "border-red-500 focus-visible:ring-red-500" : "";

  const renderFieldError = (name: RequiredField) =>
    fieldErrors[name] ? (
      <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600">
        {fieldErrors[name]}
      </p>
    ) : null;

  const handleFieldBlur = (name: RequiredField) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  // Step 4 — Documents: holds the created property ID after step 3 saves
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null);
  const [allRequiredDocsUploaded, setAllRequiredDocsUploaded] = useState(false);
  const [listingType, setListingType] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"short" | "long">("short");
  const [amenities, setAmenities] = useState<AmenityOption[]>([]);
  const shortRentCommission = useShortRentCommission();
  
  const [formData, setFormData] = useState({
    // Basic Info
    title: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    state: "",
    country: "United Kingdom",
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
    images: [] as Array<{ url: string; name: string }>,
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
        // Don't pollute the global form error banner with amenities load failures
      } finally {
        setLoadingAmenities(false);
      }
    };

    fetchAmenities();
  }, []);

  useEffect(() => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (listingType === "buy") delete next.price;
      else delete next.propertyPrice;
      return next;
    });
  }, [listingType, rentalType]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (touchedFields[name]) {
        validateField(name as RequiredField, value);
      }
    }
  };

  const handleNextStep = () => {
    if (!validateStep(step, true)) {
      return;
    }
    setStep(step + 1);
    setError(null);
    setImageError(null);
  };

  const isCurrentStepInvalid = step < 3 && isStepInvalid(step);

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      setUploadingImages(true);
      const newFiles = Array.from(files);
      
      // Upload each image to Cloudinary
      for (const file of newFiles) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} is too large (max 10MB)`);
          continue;
        }

        try {
          // Convert to base64
          const base64 = await fileToBase64(file);

          // Upload to Cloudinary
          const uploadResponse = await api.post('/upload', {
            image: base64,
            folder: 'mykeys/properties'
          });

          const { url } = uploadResponse.data.data;

          // Add to form data
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, { url, name: file.name }]
          }));
        } catch (err: any) {
          console.error(`Error uploading ${file.name}:`, err);
          setError(`Failed to upload ${file.name}`);
        }
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error handling image upload:', err);
      setError('Failed to process images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Move image at `from` to position 0 (set as cover)
  const setCoverImage = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const imgs = [...prev.images];
      const [picked] = imgs.splice(index, 1);
      return { ...prev, images: [picked, ...imgs] };
    });
  };

  // Drag-and-drop reorder
  const handleDragStart = (index: number) => {
    dragSrcIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    if (src === null || src === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    setFormData(prev => {
      const imgs = [...prev.images];
      const [moved] = imgs.splice(src, 1);
      imgs.splice(dropIndex, 0, moved);
      return { ...prev, images: imgs };
    });
    dragSrcIndex.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragSrcIndex.current = null;
    setDragOverIndex(null);
  };

  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // prevent double-submit
    submittingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);

      // Don't submit while images are uploading
      if (uploadingImages) {
        setError("Please wait for images to finish uploading");
        return;
      }
      
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
        setImageError("Please upload at least one photo before publishing.");
        return;
      }
      setImageError(null);

      // Prepare images array with URLs already uploaded to Cloudinary
      const uploadedImages = formData.images.map((img, index) => ({
        url: img.url,
        isPrimary: index === 0
      }));

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
        status: "DRAFT"
      };

      if (listingType === "rent") {
        payload.rentalType = rentalType === "short" ? "SHORT_TERM" : "LONG_TERM";
        payload.price = parseInt(formData.price);
        payload.priceType = rentalType === "short" ? "NIGHTLY" : "MONTHLY";
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
        const newPropertyId = response.data?.data?.id;
        setSavedPropertyId(newPropertyId);
        setStep(4);
      } else {
        setError(response.data?.message || "Failed to create property");
      }
    } catch (err: any) {
      console.error("Error creating property:", err);
      setError(err.response?.data?.message || "Failed to create property. Please try again.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
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
            {shortRentCommission !== null && (
              <p className="mt-3 pt-3 border-t border-green-200 text-sm font-medium text-green-700">
                Platform commission: {formatCommissionPercent(shortRentCommission)}%
              </p>
            )}
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
              onBlur={() => handleFieldBlur("title")}
              className={fieldErrorClass("title")}
              placeholder="e.g., Modern 3BHK Apartment with Pool"
              required
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
            />
            {renderFieldError("title")}
          </div>

          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("propertyType")}
              className={`w-full px-3 py-2 border rounded-[5px] focus:ring-2 focus:border-transparent outline-none ${
                fieldErrors.propertyType
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-green-500"
              }`}
              required
              aria-invalid={Boolean(fieldErrors.propertyType)}
              aria-describedby={fieldErrors.propertyType ? "propertyType-error" : undefined}
            >
              <option value="">Select type</option>
              {propertyTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {renderFieldError("propertyType")}
          </div>

          <div className="md:col-span-2">
            <Label className="mb-1 block">Property location</Label>
            <LocationPickerMap
              initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
              initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
              onLocationSelect={(loc: LocationResult) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: String(loc.lat),
                  longitude: String(loc.lng),
                  ...(loc.address ? { address: loc.address } : {}),
                  ...(loc.city ? { city: loc.city } : {}),
                  ...(loc.state ? { state: loc.state } : {}),
                  ...(loc.zipCode ? { zipCode: loc.zipCode } : {}),
                }));
                if (loc.address?.trim()) clearFieldError("address");
                if (loc.city?.trim()) clearFieldError("city");
                if (loc.state?.trim()) clearFieldError("state");
                if (loc.zipCode?.trim()) clearFieldError("zipCode");
              }}
            />
          </div>

          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-3">
              Address details — filled automatically when you pick a location on the map. You can edit anything below.
            </p>
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
                onBlur={() => handleFieldBlur("address")}
                className={`pl-10 ${fieldErrorClass("address")}`}
                placeholder="Auto-filled from map, or type manually"
                required
                aria-invalid={Boolean(fieldErrors.address)}
                aria-describedby={fieldErrors.address ? "address-error" : undefined}
              />
            </div>
            {renderFieldError("address")}
          </div>

          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("city")}
              className={fieldErrorClass("city")}
              placeholder="e.g., London"
              required
              aria-invalid={Boolean(fieldErrors.city)}
              aria-describedby={fieldErrors.city ? "city-error" : undefined}
            />
            {renderFieldError("city")}
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("state")}
              className={fieldErrorClass("state")}
              placeholder="e.g., Greater London"
              required
              aria-invalid={Boolean(fieldErrors.state)}
              aria-describedby={fieldErrors.state ? "state-error" : undefined}
            />
            {renderFieldError("state")}
          </div>

          <div>
            <Label htmlFor="zipCode">Postal Code *</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("zipCode")}
              className={fieldErrorClass("zipCode")}
              placeholder="e.g., E14"
              required
              aria-invalid={Boolean(fieldErrors.zipCode)}
              aria-describedby={fieldErrors.zipCode ? "zipCode-error" : undefined}
            />
            {renderFieldError("zipCode")}
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
              placeholder="Filled from map"
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
              placeholder="Filled from map"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Property Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("description")}
              className={fieldErrorClass("description")}
              rows={4}
              placeholder="Describe your property's features, amenities, and what makes it special..."
              required
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={fieldErrors.description ? "description-error" : undefined}
            />
            {renderFieldError("description")}
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
                onBlur={() => handleFieldBlur("beds")}
                className={`pl-10 ${fieldErrorClass("beds")}`}
                min="0"
                required
                aria-invalid={Boolean(fieldErrors.beds)}
                aria-describedby={fieldErrors.beds ? "beds-error" : undefined}
              />
            </div>
            {renderFieldError("beds")}
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
                onBlur={() => handleFieldBlur("baths")}
                className={`pl-10 ${fieldErrorClass("baths")}`}
                min="0"
                required
                aria-invalid={Boolean(fieldErrors.baths)}
                aria-describedby={fieldErrors.baths ? "baths-error" : undefined}
              />
            </div>
            {renderFieldError("baths")}
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
                <PoundSterling  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="propertyPrice"
                  name="propertyPrice"
                  type="number"
                  value={formData.propertyPrice}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("propertyPrice")}
                  className={`pl-10 ${fieldErrorClass("propertyPrice")}`}
                  placeholder="Total sale price"
                  min="0"
                  required
                  aria-invalid={Boolean(fieldErrors.propertyPrice)}
                  aria-describedby={fieldErrors.propertyPrice ? "propertyPrice-error" : undefined}
                />
              </div>
              {renderFieldError("propertyPrice")}
            </div>

            <div>
              <Label htmlFor="propertyTax">Annual Property Tax</Label>
              <div className="relative">
                <PoundSterling  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <PoundSterling  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    <PoundSterling  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                <PoundSterling  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur("price")}
                  className={`pl-10 ${fieldErrorClass("price")}`}
                  min="0"
                  required
                  aria-invalid={Boolean(fieldErrors.price)}
                  aria-describedby={fieldErrors.price ? "price-error" : undefined}
                />
              </div>
              {renderFieldError("price")}
            </div>

            {rentalType === "short" && (
              <>
                {shortRentCommission !== null && (
                  <div className="md:col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-[5px] text-sm text-amber-900">
                    <p>
                      <strong>Platform commission:</strong>{" "}
                      {formatCommissionPercent(shortRentCommission)}% of each booking total.
                    </p>
                    {formData.price && Number(formData.price) > 0 && (
                      <p className="text-xs mt-1 text-amber-800">
                        Example: {formatCommissionPercent(shortRentCommission)}% on a £
                        {formData.price} booking → you receive approx. £
                        {(Number(formData.price) * (1 - shortRentCommission / 100)).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

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
                  <span className={`mb-1 ${isSelected ? "text-green-700" : "text-gray-500"}`}>
                    {renderAmenityIcon(amenity.icon || 'Sparkles', 'w-5 h-5')}
                  </span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Property Photos</h3>
        <p className="text-sm text-gray-500 mb-2">
          Upload high-quality photos. <strong>Drag to reorder</strong> — the first photo is your <strong>cover image</strong>.
          You can also click <strong>Set as Cover</strong> on any photo.
        </p>

        {imageError && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-[5px] text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {imageError}
          </div>
        )}

        {/* Cover image tip */}
        {formData.images.length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-[5px] text-sm text-amber-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span>The <strong>first photo</strong> is your cover image shown to guests. Drag or click "Set as Cover" to change it.</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Upload tile */}
          <label
            className="aspect-video border-2 border-dashed border-gray-300 rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
            {uploadingImages ? (
              <>
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-2" />
                <p className="text-sm font-medium text-gray-700">Uploading…</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">Add Photos</p>
                <p className="text-xs text-gray-400 mt-1">Click or drag & drop</p>
              </>
            )}
          </label>

          {/* Uploaded images — draggable */}
          {formData.images.map((image, index) => (
            <div
              key={image.url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video rounded-[5px] overflow-hidden group bg-gray-100 cursor-grab active:cursor-grabbing transition-all ${
                dragOverIndex === index && dragSrcIndex.current !== index
                  ? "ring-2 ring-green-500 scale-95 opacity-70"
                  : ""
              }`}
            >
              <Image
                src={image.url}
                alt={`Property photo ${index + 1}`}
                fill
                className="object-cover pointer-events-none"
              />

              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

              {/* Drag handle */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 rounded p-1">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Cover badge */}
              {index === 0 ? (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full shadow">
                  <Star className="w-3 h-3 fill-white" />
                  Cover Photo
                </div>
              ) : (
                /* Set as cover button — visible on hover */
                <button
                  type="button"
                  onClick={() => setCoverImage(index)}
                  className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 bg-white text-gray-900 text-xs font-semibold rounded-full shadow hover:bg-amber-50 hover:text-amber-700"
                >
                  Set as Cover
                </button>
              )}

              {/* Index number */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 font-medium">
                {index + 1}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute bottom-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {formData.images.length > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            {formData.images.length} photo{formData.images.length !== 1 ? "s" : ""} uploaded.{" "}
            {formData.images.length < 5
              ? `Add ${5 - formData.images.length} more for best results.`
              : "Great selection — ready to publish!"}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Property Documents</h3>
        <p className="text-sm text-gray-500">
          Upload required documents for your property. These are reviewed by our admin team.
          You can also skip and upload later from the property edit page.
        </p>
      </div>

      {savedPropertyId && (
        <PropertyDocumentsTab
          propertyId={savedPropertyId}
          onRequiredComplete={setAllRequiredDocsUploaded}
        />
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-[5px]">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Your property has been saved as a draft.</span>{" "}
          {allRequiredDocsUploaded
            ? <>Click <span className="font-semibold">Finish</span> to go to your properties list.</>
            : <>Upload all <span className="font-semibold">required</span> documents above to enable the Finish button.</>
          }
        </p>
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
               step === 3 ? "Features & Images" :
               "Property Documents"}
            </h1>
            <p className="text-gray-600 mt-2">
              Complete all steps to publish your property
            </p>
          </div>
          <Link href="/owner/dashboard/properties">
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
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
                    {stepNumber === 4 && "Documents"}
                  </div>
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepNumber ? "bg-green-600" : "bg-gray-300"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {step === 4 ? (
        <div className="bg-white rounded-[5px] border p-8">
          {renderStep4()}
          <div className="flex justify-end pt-8 mt-8 border-t">
            <Button
              type="button"
              onClick={() => router.push("/owner/dashboard/properties")}
              disabled={!allRequiredDocsUploaded}
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-2" />
              Finish
            </Button>
          </div>
        </div>
      ) : (
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
                onClick={() => { setStep(step - 1); setError(null); setImageError(null); }}
                className="cursor-pointer"
              >
                Previous Step
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isCurrentStepInvalid}
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next Step
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || uploadingImages}
                className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : uploadingImages ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading Images...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Save & Continue
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

      </form>
      )}
    </DashboardLayout>
  );
}