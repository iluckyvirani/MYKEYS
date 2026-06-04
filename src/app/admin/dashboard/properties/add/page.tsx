"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { renderAmenityIcon } from "@/components/dashboard/AdminAmenityModal";
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
  AlertCircle,
  Loader,
  GripVertical,
  Star,
  PoundSterling,
  Search,
  User,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import LocationPickerMap, { LocationResult } from "@/components/common/LocationPickerMap";

// ─── Constants ──────────────────────────────────────────────────────────────

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "HOUSE", label: "House" },
  { value: "STUDIO", label: "Studio" },
  { value: "PENTHOUSE", label: "Penthouse" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "BUNGALOW", label: "Bungalow" },
  { value: "COMMERCIAL", label: "Commercial" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface AmenityOption {
  id: string;
  name: string;
  icon?: string;
}

interface OwnerOption {
  id: string;
  name: string;
  email: string;
  packageName?: string;
  hasFullAdminSupport: boolean;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminAddPropertyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragSrcIndex = useRef<number | null>(null);
  const submittingRef = useRef(false);

  // Steps: 0=owner selector, 1=listing type+basic info+map, 2=details+pricing, 3=amenities+photos
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Step 0 state
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<OwnerOption | null>(null); // null = admin's own listing

  // Step 1 state
  const [listingType, setListingType] = useState<"rent" | "buy">("rent");
  const [rentalType, setRentalType] = useState<"short" | "long">("short");
  const [amenities, setAmenities] = useState<AmenityOption[]>([]);

  const [formData, setFormData] = useState({
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
    price: "",
    priceType: "NIGHTLY",
    securityDeposit: "",
    cleaningFee: "",
    serviceFee: "",
    propertyPrice: "",
    propertyTax: "",
    hoaFee: "",
    leasehold: false,
    leaseYears: "",
    groundRent: "",
    beds: "",
    baths: "",
    sqft: "",
    guests: "",
    minStay: "1",
    maxStay: "30",
    checkInTime: "14:00",
    checkOutTime: "11:00",
    yearBuilt: "",
    selfCheckIn: false,
    parking: false,
    minTerm: "1",
    maxTerm: "24",
    availableFrom: "",
    billsIncluded: false,
    councilTaxBand: "",
    epcRating: "",
    amenities: [] as string[],
    images: [] as Array<{ url: string; name: string }>,
  });

  // ─── Fetch owners ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingOwners(true);
        const res = await api.get("/admin/owners?pageSize=200");
        if (res.data?.success && res.data?.data?.items) {
          const mapped: OwnerOption[] = res.data.data.items.map((o: any) => ({
            id: o.id,
            name: o.name || o.email,
            email: o.email,
            packageName: o.packageName || null,
            hasFullAdminSupport: o.hasFullAdminSupport === true,
          }));
          setOwners(mapped);
        }
      } catch {
        // ignore
      } finally {
        setLoadingOwners(false);
      }
    };
    load();
  }, []);

  // ─── Fetch amenities ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingAmenities(true);
        const res = await api.get("/amenities?pageSize=50");
        if (res.data?.data?.items) setAmenities(res.data.data.items);
      } catch {
        // ignore
      } finally {
        setLoadingAmenities(false);
      }
    };
    load();
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const toggleAmenity = (id: string) =>
    setFormData((p) => ({
      ...p,
      amenities: p.amenities.includes(id) ? p.amenities.filter((a) => a !== id) : [...p.amenities, id],
    }));

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploadingImages(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { setError(`${file.name} is not an image`); continue; }
      if (file.size > 10 * 1024 * 1024) { setError(`${file.name} is too large (max 10MB)`); continue; }
      try {
        const base64 = await fileToBase64(file);
        const res = await api.post("/upload", { image: base64, folder: "mykeys/properties" });
        setFormData((p) => ({ ...p, images: [...p.images, { url: res.data.data.url, name: file.name }] }));
      } catch {
        setError(`Failed to upload ${file.name}`);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadingImages(false);
  };

  const removeImage = (i: number) =>
    setFormData((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  const setCoverImage = (i: number) => {
    if (i === 0) return;
    setFormData((p) => {
      const imgs = [...p.images];
      const [picked] = imgs.splice(i, 1);
      return { ...p, images: [picked, ...imgs] };
    });
  };

  const handleDragStart = (i: number) => { dragSrcIndex.current = i; };
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i); };
  const handleDragEnd = () => { dragSrcIndex.current = null; setDragOverIndex(null); };
  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    if (src === null || src === dropIdx) { setDragOverIndex(null); return; }
    setFormData((p) => {
      const imgs = [...p.images];
      const [moved] = imgs.splice(src, 1);
      imgs.splice(dropIdx, 0, moved);
      return { ...p, images: imgs };
    });
    dragSrcIndex.current = null;
    setDragOverIndex(null);
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      if (uploadingImages) { setError("Please wait for images to finish uploading"); return; }
      if (!formData.title || !formData.address || !formData.propertyType) {
        setError("Please fill in all required fields");
        return;
      }
      if (listingType === "buy" && !formData.propertyPrice) { setError("Please enter property price"); return; }
      if (listingType === "rent" && !formData.price) { setError("Please enter rental price"); return; }
      if (formData.images.length < 1) { setImageError("Please upload at least one photo."); return; }
      setImageError(null);

      const uploadedImages = formData.images.map((img, i) => ({ url: img.url, isPrimary: i === 0 }));

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
        status: "DRAFT",
        ...(selectedOwner ? { ownerId: selectedOwner.id } : {}),
      };

      if (listingType === "rent") {
        payload.rentalType = rentalType === "short" ? "SHORT_TERM" : "LONG_TERM";
        payload.price = parseInt(formData.price);
        payload.priceType = rentalType === "short" ? "NIGHTLY" : "MONTHLY";
        payload.securityDeposit = formData.securityDeposit ? parseInt(formData.securityDeposit) : null;
        payload.cleaningFee = formData.cleaningFee ? parseInt(formData.cleaningFee) : null;
        payload.serviceFee = formData.serviceFee ? parseInt(formData.serviceFee) : null;
        if (rentalType === "short") {
          payload.minStay = parseInt(formData.minStay) || 1;
          payload.maxStay = formData.maxStay ? parseInt(formData.maxStay) : null;
          payload.checkInTime = formData.checkInTime;
          payload.checkOutTime = formData.checkOutTime;
          payload.yearBuilt = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
          payload.selfCheckIn = formData.selfCheckIn;
          payload.parking = formData.parking;
        } else {
          payload.minTerm = parseInt(formData.minTerm) || 1;
          payload.maxTerm = formData.maxTerm ? parseInt(formData.maxTerm) : null;
          payload.availableFrom = formData.availableFrom ? new Date(formData.availableFrom).toISOString() : null;
          payload.billsIncluded = formData.billsIncluded;
          payload.councilTaxBand = formData.councilTaxBand || null;
          payload.epcRating = formData.epcRating || null;
          payload.yearBuilt = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
          payload.parking = formData.parking;
        }
      } else {
        payload.propertyPrice = parseInt(formData.propertyPrice);
        payload.propertyTax = formData.propertyTax ? parseInt(formData.propertyTax) : null;
        payload.hoaFee = formData.hoaFee ? parseInt(formData.hoaFee) : null;
        payload.leasehold = formData.leasehold;
        payload.leaseYears = formData.leaseYears ? parseInt(formData.leaseYears) : null;
        payload.groundRent = formData.groundRent ? parseInt(formData.groundRent) : null;
        payload.yearBuilt = formData.yearBuilt ? parseInt(formData.yearBuilt) : null;
        payload.parking = formData.parking;
        payload.price = parseInt(formData.propertyPrice);
        payload.priceType = "TOTAL";
      }

      const res = await api.post("/admin/properties", payload);
      if (res.data?.success) {
        router.push("/admin/dashboard/properties");
      } else {
        setError(res.data?.message || "Failed to create property");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create property. Please try again.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  // ─── Step renderers ───────────────────────────────────────────────────────

  const filteredOwners = owners.filter(
    (o) =>
      o.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  const renderStep0 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Who is this property for?</h3>
        <p className="text-sm text-gray-500 mb-4">
          You can list this property under your own admin account, or assign it to an owner who has a Full Admin Support package.
        </p>

        {/* Admin's own listing */}
        <button
          type="button"
          onClick={() => setSelectedOwner(null)}
          className={`w-full p-4 rounded-[5px] border-2 text-left mb-4 transition-all ${
            selectedOwner === null
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedOwner === null ? "bg-green-100" : "bg-gray-100"}`}>
              <Building className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Admin's Own Listing</div>
              <div className="text-sm text-gray-500">Property will be listed under the admin account</div>
            </div>
            {selectedOwner === null && <Check className="w-5 h-5 text-green-600 ml-auto" />}
          </div>
        </button>

        {/* Owner search */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Or assign to an owner with Full Admin Support package</h4>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search owner by name or email…"
              value={ownerSearch}
              onChange={(e) => setOwnerSearch(e.target.value)}
              className="pl-9 rounded-[5px]"
            />
          </div>

          {loadingOwners ? (
            <div className="flex items-center gap-2 py-4 text-gray-500">
              <Loader className="w-4 h-4 animate-spin" /> Loading owners…
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-[5px] divide-y">
              {filteredOwners.filter((o) => o.hasFullAdminSupport).length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No owners with Full Admin Support found</div>
              ) : (
                filteredOwners
                  .filter((o) => o.hasFullAdminSupport)
                  .map((owner) => (
                    <button
                      key={owner.id}
                      type="button"
                      onClick={() => setSelectedOwner(owner)}
                      className={`w-full p-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        selectedOwner?.id === owner.id ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{owner.name}</div>
                        <div className="text-xs text-gray-500 truncate">{owner.email}</div>
                      </div>
                      {owner.packageName && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0">
                          {owner.packageName}
                        </span>
                      )}
                      {selectedOwner?.id === owner.id && <Check className="w-4 h-4 text-green-600 shrink-0" />}
                    </button>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOwner && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-[5px]">
          <p className="text-sm text-blue-700">
            Property will be listed under <span className="font-semibold">{selectedOwner.name}</span> ({selectedOwner.email})
          </p>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing Type</h3>
        <p className="text-sm text-gray-600 mb-4">Choose how to list this property</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => { setListingType("rent"); setRentalType("short"); }}
            className={`p-6 rounded-[5px] border-2 transition-all ${listingType === "rent" && rentalType === "short" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
              <Hotel className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Short Stay</h4>
            <p className="text-sm text-gray-600">Airbnb-style, per night bookings</p>
            <div className="mt-4 text-sm text-green-600 font-medium">Commission: 10-15%</div>
          </button>

          <button
            type="button"
            onClick={() => { setListingType("rent"); setRentalType("long"); }}
            className={`p-6 rounded-[5px] border-2 transition-all ${listingType === "rent" && rentalType === "long" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Long Term Rent</h4>
            <p className="text-sm text-gray-600">Monthly rentals, 2+ months minimum</p>
            <div className="mt-4 text-sm text-blue-600 font-medium">Commission: 5-8%</div>
          </button>

          <button
            type="button"
            onClick={() => setListingType("buy")}
            className={`p-6 rounded-[5px] border-2 transition-all ${listingType === "buy" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">For Sale</h4>
            <p className="text-sm text-gray-600">One-time property sale</p>
            <div className="mt-4 text-sm text-purple-600 font-medium">Commission: 1.5-3.5%</div>
          </button>
        </div>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Modern 3BHK Apartment with Pool" required />
          </div>
          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <select id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" required>
              <option value="">Select type</option>
              {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Complete Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} className="pl-10" placeholder="Street, City, State, Postal Code" required />
            </div>
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., London" required />
          </div>
          <div>
            <Label htmlFor="state">State / Region *</Label>
            <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g., Greater London" required />
          </div>
          <div>
            <Label htmlFor="zipCode">Postal Code</Label>
            <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="e.g., E14" />
          </div>
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} placeholder="e.g., 51.5074" />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} placeholder="e.g., -0.1278" />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1 block">Pick Location on Map</Label>
            <LocationPickerMap
              initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
              initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
              onLocationSelect={(loc: LocationResult) => {
                setFormData((p) => ({
                  ...p,
                  latitude: String(loc.lat),
                  longitude: String(loc.lng),
                  ...(loc.address ? { address: loc.address } : {}),
                  ...(loc.city ? { city: loc.city } : {}),
                  ...(loc.state ? { state: loc.state } : {}),
                  ...(loc.zipCode ? { zipCode: loc.zipCode } : {}),
                }));
              }}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Property Description *</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe the property's features, amenities, and what makes it special…" required />
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
              <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="beds" name="beds" type="number" value={formData.beds} onChange={handleInputChange} className="pl-10" min="0" required />
            </div>
          </div>
          <div>
            <Label htmlFor="baths">Bathrooms *</Label>
            <div className="relative">
              <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="baths" name="baths" type="number" value={formData.baths} onChange={handleInputChange} className="pl-10" min="0" required />
            </div>
          </div>
          <div>
            <Label htmlFor="sqft">Area (sq ft)</Label>
            <div className="relative">
              <Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="sqft" name="sqft" type="number" value={formData.sqft} onChange={handleInputChange} className="pl-10" min="0" />
            </div>
          </div>
          {listingType === "rent" && rentalType === "short" && (
            <div>
              <Label htmlFor="guests">Max Guests</Label>
              <Input id="guests" name="guests" type="number" value={formData.guests} onChange={handleInputChange} min="1" />
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {listingType === "buy" ? "Sale Information" : "Pricing Information"}
        </h3>

        {listingType === "buy" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="propertyPrice">Property Price *</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="propertyPrice" name="propertyPrice" type="number" value={formData.propertyPrice} onChange={handleInputChange} className="pl-10" placeholder="Total sale price" min="0" required />
              </div>
            </div>
            <div>
              <Label htmlFor="propertyTax">Annual Property Tax</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="propertyTax" name="propertyTax" type="number" value={formData.propertyTax} onChange={handleInputChange} className="pl-10" placeholder="Annual tax amount" min="0" />
              </div>
            </div>
            <div>
              <Label htmlFor="hoaFee">HOA / Service Charge (Monthly)</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="hoaFee" name="hoaFee" type="number" value={formData.hoaFee} onChange={handleInputChange} className="pl-10" placeholder="Monthly HOA fee" min="0" />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="leasehold" checked={formData.leasehold} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded" />
                <span className="ml-2 text-gray-700">Leasehold Property</span>
              </label>
            </div>
            {formData.leasehold && (
              <>
                <div>
                  <Label htmlFor="leaseYears">Remaining Lease (years)</Label>
                  <Input id="leaseYears" name="leaseYears" type="number" value={formData.leaseYears} onChange={handleInputChange} placeholder="e.g., 99" min="0" />
                </div>
                <div>
                  <Label htmlFor="groundRent">Ground Rent (Annual)</Label>
                  <div className="relative">
                    <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input id="groundRent" name="groundRent" type="number" value={formData.groundRent} onChange={handleInputChange} className="pl-10" placeholder="Annual ground rent" min="0" />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input id="yearBuilt" name="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleInputChange} placeholder="e.g., 2020" min="1800" max="2100" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="parking" checked={formData.parking} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded" />
                <span className="ml-2 text-gray-700">Parking Available</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="price">{rentalType === "short" ? "Price per Night *" : "Monthly Rent *"}</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} className="pl-10" min="0" required />
              </div>
            </div>
            {rentalType === "short" && (
              <>
                <div>
                  <Label htmlFor="cleaningFee">Cleaning Fee</Label>
                  <Input id="cleaningFee" name="cleaningFee" type="number" value={formData.cleaningFee} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input id="securityDeposit" name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="serviceFee">Service Fee</Label>
                  <Input id="serviceFee" name="serviceFee" type="number" value={formData.serviceFee} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minStay">Min Stay (nights)</Label>
                    <Input id="minStay" name="minStay" type="number" value={formData.minStay} onChange={handleInputChange} min="1" />
                  </div>
                  <div>
                    <Label htmlFor="maxStay">Max Stay (nights)</Label>
                    <Input id="maxStay" name="maxStay" type="number" value={formData.maxStay} onChange={handleInputChange} min="1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input id="checkInTime" name="checkInTime" type="time" value={formData.checkInTime} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="checkOutTime">Check-out Time</Label>
                    <Input id="checkOutTime" name="checkOutTime" type="time" value={formData.checkOutTime} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input id="yearBuilt" name="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleInputChange} placeholder="e.g., 2020" min="1800" max="2100" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="selfCheckIn" checked={formData.selfCheckIn} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded" />
                    <span className="ml-2 text-gray-700">Self Check-in</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="parking" checked={formData.parking} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded" />
                    <span className="ml-2 text-gray-700">Parking Available</span>
                  </label>
                </div>
              </>
            )}
            {rentalType === "long" && (
              <>
                <div>
                  <Label htmlFor="securityDeposit">Security Deposit</Label>
                  <Input id="securityDeposit" name="securityDeposit" type="number" value={formData.securityDeposit} onChange={handleInputChange} />
                </div>
                <div>
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input id="availableFrom" name="availableFrom" type="date" value={formData.availableFrom} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minTerm">Min Lease (months)</Label>
                    <Input id="minTerm" name="minTerm" type="number" value={formData.minTerm} onChange={handleInputChange} min="1" />
                  </div>
                  <div>
                    <Label htmlFor="maxTerm">Max Lease (months)</Label>
                    <Input id="maxTerm" name="maxTerm" type="number" value={formData.maxTerm} onChange={handleInputChange} min="1" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="billsIncluded" checked={formData.billsIncluded} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded" />
                    <span className="ml-2 text-gray-700">Bills Included</span>
                  </label>
                </div>
                <div>
                  <Label htmlFor="councilTaxBand">Council Tax Band</Label>
                  <Input id="councilTaxBand" name="councilTaxBand" value={formData.councilTaxBand} onChange={handleInputChange} placeholder="e.g., Band A" />
                </div>
                <div>
                  <Label htmlFor="epcRating">EPC Rating</Label>
                  <select id="epcRating" name="epcRating" value={formData.epcRating} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
                    <option value="">Select rating</option>
                    {["A", "B", "C", "D", "E", "F", "G"].map((r) => (
                      <option key={r} value={r}>{r}{r === "A" ? " (Most efficient)" : r === "G" ? " (Least efficient)" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input id="yearBuilt" name="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleInputChange} placeholder="e.g., 2020" min="1800" max="2100" />
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="parking" checked={formData.parking} onChange={handleInputChange} className="w-4 h-4 text-green-600 rounded" />
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
      {/* Amenities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Amenities</h3>
        <p className="text-sm text-gray-600 mb-6">Select amenities available in this property</p>
        {loadingAmenities ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-600">Loading amenities…</span>
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
                    isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className={`mb-1 ${isSelected ? "text-green-700" : "text-gray-500"}`}>
                    {renderAmenityIcon(amenity.icon || "Sparkles", "w-5 h-5")}
                  </span>
                  <span className={`text-sm font-medium text-center ${isSelected ? "text-green-700" : "text-gray-700"}`}>
                    {amenity.name}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-green-600 absolute top-2 right-2" />}
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

      {/* Photos */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Property Photos</h3>
        <p className="text-sm text-gray-500 mb-2">
          Upload high-quality photos. <strong>Drag to reorder</strong> — the first photo is the <strong>cover image</strong>.
        </p>

        {imageError && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-[5px] text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {imageError}
          </div>
        )}

        {formData.images.length > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-[5px] text-sm text-amber-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
            <span>The <strong>first photo</strong> is the cover image. Drag or click "Set as Cover" to change it.</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Upload tile */}
          <label className="aspect-video border-2 border-dashed border-gray-300 rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors">
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
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

          {/* Uploaded images */}
          {formData.images.map((image, index) => (
            <div
              key={image.url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-video rounded-[5px] overflow-hidden group bg-gray-100 cursor-grab active:cursor-grabbing transition-all ${
                dragOverIndex === index && dragSrcIndex.current !== index ? "ring-2 ring-green-500 scale-95 opacity-70" : ""
              }`}
            >
              <Image src={image.url} alt={`Photo ${index + 1}`} fill className="object-cover pointer-events-none" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 rounded p-1">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
              </div>
              {index === 0 ? (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full shadow">
                  <Star className="w-3 h-3 fill-white" /> Cover Photo
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCoverImage(index)}
                  className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 bg-white text-gray-900 text-xs font-semibold rounded-full shadow hover:bg-amber-50 hover:text-amber-700"
                >
                  Set as Cover
                </button>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 font-medium">{index + 1}</div>
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
            {formData.images.length < 5 ? `Add ${5 - formData.images.length} more for best results.` : "Great selection!"}
          </p>
        )}
      </div>
    </div>
  );

  // ─── Stepper config ───────────────────────────────────────────────────────

  const steps = [
    { label: "Owner" },
    { label: "Basic Info" },
    { label: "Details & Pricing" },
    { label: "Amenities & Photos" },
  ];

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <AdminDashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/dashboard/properties" className="text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 0 ? "Select Owner" : step === 1 ? "Basic Info & Location" : step === 2 ? "Details & Pricing" : "Amenities & Photos"}
              </h1>
            </div>
            <p className="text-gray-500 text-sm pl-7">
              {selectedOwner ? `Listing for: ${selectedOwner.name}` : "Admin's own listing"}
            </p>
          </div>
          <Link href="/admin/dashboard/properties">
            <Button variant="outline" className="rounded-[5px]">Cancel</Button>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-sm font-semibold ${
                  step === i ? "bg-green-600 border-green-600 text-white"
                  : step > i ? "bg-green-100 border-green-600 text-green-600"
                  : "bg-white border-gray-300 text-gray-500"
                }`}>
                  {step > i ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className={`text-xs font-medium ${step >= i ? "text-gray-900" : "text-gray-400"}`}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-3 ${step > i ? "bg-green-600" : "bg-gray-200"}`} />
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

          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation */}
          <div className="flex justify-between pt-8 mt-8 border-t">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep(step - 1); setError(null); setImageError(null); }}
                className="rounded-[5px]"
              >
                Previous
              </Button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => { setStep(step + 1); setError(null); setImageError(null); }}
                className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
              >
                Next Step <Plus className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || uploadingImages}
                className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-[5px] disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                ) : uploadingImages ? (
                  <><div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading Images…</>
                ) : (
                  <><Plus className="w-4 h-4 mr-2" />Create Property</>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </AdminDashboardLayout>
  );
}
