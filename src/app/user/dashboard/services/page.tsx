"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ServiceFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Wrench,
  MapPin,
  Star,
  Filter,
  Search,
  MessageCircle,
  Calendar,
  Zap,
  ArrowRight,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ServiceCategoryAPI {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Provider {
  id: string;
  name: string;
  category: string;
  subcategories: any[];
  rating: number;
  reviews: number;
  completedBookings: number;
  location: string;
  avatar: string;
  bio: string;
  serviceAreas: string[];
  instantBooking: boolean;
  instantPrice: number | null;
  services: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    basePrice: number;
    rating: number;
    reviews: number;
    image: string | null;
  }[];
}


export default function UserServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceCategoryAPI[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryAPI | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedProviderView, setSelectedProviderView] = useState<Provider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedListing, setSelectedListing] = useState<Provider['services'][0] | null>(null);
  const [wantInstant, setWantInstant] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ category?: string; bookingType?: string }>({});
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/services/categories');
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch providers when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchProviders(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchProviders = async (category: ServiceCategoryAPI) => {
    setLoading(true);
    try {
      const res = await api.get(`/services?categoryId=${category.id}`);
      if (res.data?.data) {
        setProviders(res.data.data);
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !appliedFilters.category || c.name === appliedFilters.category;
    return matchesSearch && matchesCategory;
  });

  const handleBookService = (provider: Provider, listing: Provider['services'][0] | null) => {
    setSelectedProvider(provider);
    setSelectedListing(listing);
    setWantInstant(false);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedProvider) return;

    // Validate scheduled booking fields
    if (!wantInstant && (!scheduleDate || !scheduleTime)) {
      toast({ title: "Date & time required", description: "Please select a date and time for your booking.", variant: "destructive" });
      return;
    }

    if (!bookingLocation.trim()) {
      toast({ title: "Location required", description: "Please enter the service location.", variant: "destructive" });
      return;
    }

    setBookingLoading(true);
    try {
      const basePrice = selectedListing?.basePrice || 0;
      const instantFee = wantInstant && selectedProvider.instantPrice ? selectedProvider.instantPrice : 0;
      const subtotal = basePrice + instantFee;
      const serviceTax = subtotal * 0.1;
      const totalAmount = subtotal + serviceTax;
      const finalAmount = totalAmount > 0 ? Math.round(totalAmount) : 1;

      const bookingData = {
        providerId: selectedProvider.id,
        serviceListingId: selectedListing?.id || null,
        service: selectedListing?.name || selectedCategory?.name || 'Service',
        category: selectedProvider.category,
        bookingType: wantInstant ? "instant" : "scheduled",
        description: bookingDescription || (subtotal === 0 ? "Price to be discussed with provider" : undefined),
        scheduledDate: !wantInstant ? scheduleDate : undefined,
        scheduledTime: !wantInstant ? scheduleTime : undefined,
        location: bookingLocation,
        totalAmount: finalAmount,
      };

      const response = await api.post('/services/book', bookingData);

      if (response.data?.success) {
        toast({ title: "Booking confirmed!", description: "Redirecting to your bookings..." });
        setShowBookingModal(false);
        setScheduleDate("");
        setScheduleTime("");
        setBookingLocation("");
        setBookingDescription("");
        setWantInstant(false);
        setSelectedProvider(null);
        setSelectedListing(null);
        setTimeout(() => {
          router.push('/user/dashboard/service-bookings');
        }, 1200);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create booking';
      toast({ title: "Booking failed", description: errorMsg, variant: "destructive" });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Go Back Button */}
      {(selectedCategory || selectedProviderView) && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => {
              if (selectedProviderView) {
                setSelectedProviderView(null);
              } else {
                setSelectedCategory(null);
                setSearchQuery("");
              }
            }}
            className="rounded-[5px] flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {selectedProviderView ? `Back to ${selectedCategory?.name} Providers` : 'Go Back'}
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900  ">Book Services</h1>
            <p className="text-gray-600 mt-2">
              Find trusted service providers near you
            </p>
          </div>
        </div>
      </div>

      {/* 3-step flow: categories → providers → provider listings */}
      {!selectedCategory ? (
        <>
          {/* Search & Filter */}
          <div className="bg-white rounded-[5px] p-5 mb-5 border">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search services (Plumbing, Cleaning, etc.)"
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none relative"
                  onClick={() => setFilterModalOpen(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                  {(appliedFilters.category || appliedFilters.bookingType) && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                      {[appliedFilters.category, appliedFilters.bookingType].filter(Boolean).length}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Applied Filter Chips */}
            {(appliedFilters.category || appliedFilters.bookingType) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                {appliedFilters.category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm">
                    {appliedFilters.category}
                    <button onClick={() => setAppliedFilters(p => ({ ...p, category: undefined }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {appliedFilters.bookingType && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm">
                    {appliedFilters.bookingType === "instant" ? "Instant Available" : "Schedule Only"}
                    <button onClick={() => setAppliedFilters(p => ({ ...p, bookingType: undefined }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setAppliedFilters({})}
                  className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Categories Grid */}
          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="ml-3 text-gray-600">Loading categories...</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className="bg-white rounded-[5px] border p-6 hover:shadow-lg transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    {category.icon ? (
                      <span className="text-2xl">{category.icon}</span>
                    ) : (
                      <Wrench className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">Service Category</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description || "Find expert providers near you"}</p>
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                  Find Providers <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
          )}
        </>
      ) : selectedProviderView ? (
        /* Step 3: Service listings of selected provider */
        <>
          <div className="mb-6">
            <div className="flex items-center gap-4 bg-white rounded-[5px] border p-4">
              <Image
                src={selectedProviderView.avatar}
                alt={selectedProviderView.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{selectedProviderView.name}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {selectedProviderView.rating.toFixed(1)} ({selectedProviderView.reviews} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedProviderView.location || 'Location not specified'}
                  </span>
                </div>
                {selectedProviderView.bio && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{selectedProviderView.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Instant fee info */}
          {selectedProviderView.instantBooking && selectedProviderView.instantPrice && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-[5px] flex items-center gap-2 text-sm text-amber-800">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Instant service available — add <strong>₹{selectedProviderView.instantPrice}</strong> when booking any service for immediate response.</span>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Services</h3>
          {selectedProviderView.services.length === 0 ? (
            <div className="bg-white rounded-[5px] border p-10 text-center">
              <p className="text-gray-500">This provider hasn't listed any services yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProviderView.services.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-[5px] border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {listing.image && (
                    <div className="h-36 bg-gray-200 overflow-hidden">
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{listing.name}</h4>
                      <p className="text-lg font-bold text-green-600 ml-2">₹{listing.basePrice}</p>
                    </div>
                    {listing.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                    )}
                    {listing.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {listing.rating.toFixed(1)} ({listing.reviews} reviews)
                      </div>
                    )}
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleBookService(selectedProviderView, listing)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book this Service
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Step 2: Providers for selected category */
        <>
          {/* Provider List Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory?.name} Providers
                </h2>
                <p className="text-gray-600 mt-1">{providers?.length ?? 0} providers available</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="ml-3 text-gray-600">Finding service providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-[5px] border p-12 text-center">
              <p className="text-gray-600">No service providers found for {selectedCategory?.name}.</p>
              <Button
                onClick={() => setSelectedCategory(null)}
                variant="outline"
                className="mt-4"
              >
                Browse Other Services
              </Button>
            </div>
          ) : (
          <div className="space-y-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-[5px] border p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Provider Info */}
                  <div className="shrink-0">
                    <Image
                      src={provider.avatar}
                      alt={provider.name}
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {provider.location || 'Location not specified'}
                        </div>
                        {provider.bio && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{provider.bio}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{provider.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({provider.reviews})</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{provider.completedBookings} completed</div>
                        {provider.instantBooking && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            Instant Available
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Service count summary */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <span>{provider.services.length} service{provider.services.length !== 1 ? 's' : ''} available</span>
                      {provider.serviceAreas.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {provider.serviceAreas.slice(0, 2).join(', ')}{provider.serviceAreas.length > 2 ? ` +${provider.serviceAreas.length - 2} more` : ''}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setSelectedProviderView(provider)}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        View Services
                      </Button>
                      <Button variant="ghost" size="sm" title="Contact Provider">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </>
      )}

      {/* Service Filter Modal */}
      <ServiceFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={(filters) => setAppliedFilters(filters)}
      />

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[5px] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Service</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedCategory?.name}</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provider Summary */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-5">
              <div className="flex items-start gap-3">
                <Image
                  src={selectedProvider.avatar}
                  alt={selectedProvider.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{selectedProvider.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {selectedProvider.rating.toFixed(1)} ({selectedProvider.reviews} reviews)
                    </span>
                    {selectedProvider.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedProvider.location}
                      </span>
                    )}
                    <span className="text-gray-500">{selectedProvider.completedBookings} completed</span>
                  </div>
                  {selectedProvider.serviceAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedProvider.serviceAreas.slice(0, 4).map((area) => (
                        <span key={area} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">{area}</span>
                      ))}
                      {selectedProvider.serviceAreas.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">+{selectedProvider.serviceAreas.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Service */}
            {selectedListing && (
              <div className="border rounded-lg p-4 mb-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Selected Service</p>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedListing.name}</p>
                    {selectedListing.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedListing.description}</p>
                    )}
                    {selectedListing.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {selectedListing.rating.toFixed(1)} ({selectedListing.reviews} reviews)
                      </div>
                    )}
                  </div>
                  <span className="text-lg font-bold text-green-600 whitespace-nowrap">₹{selectedListing.basePrice}</span>
                </div>
              </div>
            )}

            {/* Instant Service Add-on */}
            {selectedProvider.instantBooking && selectedProvider.instantPrice && (
              <div
                className={`border rounded-lg p-4 mb-5 cursor-pointer transition-all ${
                  wantInstant ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-amber-300"
                }`}
                onClick={() => setWantInstant(!wantInstant)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    wantInstant ? "border-amber-500 bg-amber-500" : "border-gray-300"
                  }`}>
                    {wantInstant && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Add Instant Service</p>
                    <p className="text-xs text-gray-500">Get immediate response — provider will attend to you right away</p>
                  </div>
                  <span className="font-semibold text-amber-600 text-sm whitespace-nowrap">+₹{selectedProvider.instantPrice}</span>
                </div>
              </div>
            )}

            {/* Schedule Date & Time (hidden when instant) */}
            {!wantInstant && (
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {wantInstant && (
              <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                <Zap className="w-4 h-4 shrink-0" />
                Instant booking — the provider will contact you immediately. No date/time needed.
              </div>
            )}

            {/* Service Location */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-900 mb-2">Service Location <span className="text-red-500">*</span></label>
              <textarea
                value={bookingLocation}
                onChange={(e) => setBookingLocation(e.target.value)}
                placeholder="Enter your complete address where service is needed"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Additional Notes */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-900 mb-2">Additional Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                placeholder="Any specific requirements, problem description, or special instructions"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Price Breakdown</p>
              {(() => {
                const basePrice = selectedListing?.basePrice || 0;
                const instantFee = wantInstant && selectedProvider.instantPrice ? selectedProvider.instantPrice : 0;
                const subtotal = basePrice + instantFee;
                const serviceTax = subtotal * 0.1;
                const total = subtotal + serviceTax;

                if (subtotal === 0) {
                  return (
                    <div className="text-center py-1">
                      <p className="text-sm text-gray-600">Pricing will be discussed with the provider</p>
                      <p className="text-xs text-gray-500 mt-1">You can mention your budget in additional notes</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {basePrice > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee ({selectedListing?.name || 'Base'})</span>
                        <span className="font-medium">₹{basePrice}</span>
                      </div>
                    )}
                    {instantFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-700 flex items-center gap-1"><Zap className="w-3 h-3" />Instant service fee</span>
                        <span className="font-medium text-amber-700">₹{instantFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (10%)</span>
                      <span className="font-medium">₹{serviceTax.toFixed(0)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="font-bold text-green-600 text-xl">₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBookingModal(false)}
                variant="outline"
                className="flex-1 cursor-pointer"
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitBooking}
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer disabled:opacity-50"
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
