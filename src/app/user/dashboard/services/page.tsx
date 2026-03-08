"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ServiceFilterModal } from "@/components/dashboard/UserDashboard/FilterModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Wrench,
  ChefHat,
  Clock,
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

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  types: ("instant" | "schedule")[];
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

const services: Service[] = [
  {
    id: "1",
    name: "Plumbing",
    category: "Maintenance",
    description: "Pipe repairs, leaks, installations",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
  {
    id: "2",
    name: "Cleaning",
    category: "Cleaning",
    description: "Deep cleaning and maintenance",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
  {
    id: "3",
    name: "Electrical",
    category: "Maintenance",
    description: "Electrical repairs and installations",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
  {
    id: "4",
    name: "AC Repair",
    category: "HVAC",
    description: "AC installation, repair, and servicing",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
  {
    id: "5",
    name: "Painting",
    category: "Home Improvement",
    description: "Interior and exterior painting",
    icon: Wrench,
    types: ["schedule"],
  },
  {
    id: "6",
    name: "Carpentry",
    category: "Home Improvement",
    description: "Furniture and woodwork",
    icon: Wrench,
    types: ["schedule"],
  },
];

export default function UserServicesPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedListing, setSelectedListing] = useState<Provider['services'][0] | null>(null);
  const [bookingType, setBookingType] = useState<"instant" | "schedule">("instant");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{ category?: string; bookingType?: string }>({});
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingDescription, setBookingDescription] = useState("");

  // Fetch providers when a service is selected
  useEffect(() => {
    if (selectedService) {
      fetchProviders(selectedService.id);
    }
  }, [selectedService]);

  const fetchProviders = async (categoryId: string) => {
    setLoading(true);
    try {
      // Map frontend category names to backend enum values
      const categoryMap: Record<string, string> = {
        '1': 'plumbing',
        '2': 'cleaning',
        '3': 'electrical',
        '4': 'ac-repair',
        '5': 'painting',
        '6': 'carpentry',
      };
      
      const category = categoryMap[categoryId] || 'plumbing';
      const res = await api.get(`/services?category=${category}`);
      
      if (res.data?.data) {
        setProviders(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !appliedFilters.category || s.category === appliedFilters.category;
    const matchesBookingType = !appliedFilters.bookingType || s.types.includes(appliedFilters.bookingType as "instant" | "schedule");
    return matchesSearch && matchesCategory && matchesBookingType;
  });

  const handleBookService = (provider: Provider, listing: Provider['services'][0] | null, type: "instant" | "schedule") => {
    setSelectedProvider(provider);
    setSelectedListing(listing);
    setBookingType(type);
    
    // If no listing but schedule type, create a default base price from instantPrice or 0
    if (!listing && type === "schedule" && !provider.services.length) {
      // Provider has no services set up, use a request-based approach
      console.log("Provider has no service listings, using request-based booking");
    }
    
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedProvider) return;

    // Validate scheduled booking fields
    if (bookingType === "schedule" && (!scheduleDate || !scheduleTime)) {
      alert("Please select date and time for scheduled booking");
      return;
    }

    if (!bookingLocation.trim()) {
      alert("Please enter service location");
      return;
    }

    setBookingLoading(true);
    try {
      // Calculate total amount
      const basePrice = bookingType === "instant" && selectedProvider.instantPrice
        ? selectedProvider.instantPrice
        : selectedListing?.basePrice || 0;
      
      const serviceTax = basePrice * 0.1;
      const totalAmount = basePrice + serviceTax;

      // If total is 0, set a nominal amount (will be updated by provider)
      const finalAmount = totalAmount > 0 ? Math.round(totalAmount) : 1;

      // Prepare booking data
      const bookingData = {
        providerId: selectedProvider.id,
        serviceListingId: selectedListing?.id || null,
        service: selectedListing?.name || selectedService?.name || 'Service',
        category: selectedProvider.category,
        bookingType: bookingType === "instant" ? "instant" : "scheduled",
        description: bookingDescription || (totalAmount === 0 ? "Price to be discussed with provider" : undefined),
        scheduledDate: bookingType === "schedule" ? scheduleDate : undefined,
        scheduledTime: bookingType === "schedule" ? scheduleTime : undefined,
        location: bookingLocation,
        totalAmount: finalAmount,
      };

      const response = await api.post('/services/book', bookingData);

      if (response.data?.success) {
        alert('Booking created successfully! Redirecting to your bookings...');
        setShowBookingModal(false);
        // Reset form
        setScheduleDate("");
        setScheduleTime("");
        setBookingLocation("");
        setBookingDescription("");
        setSelectedProvider(null);
        setSelectedListing(null);
        // Redirect to bookings page
        setTimeout(() => {
          router.push('/user/dashboard/service-bookings');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create booking';
      alert(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <DashboardLayout defaultRole="user">
      {/* Go Back Button - Show when service is selected */}
      {selectedService && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedService(null);
              setSearchQuery("");
            }}
            className="rounded-[5px] flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Go Back
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

      {/* Service Selection or Provider List */}
      {!selectedService ? (
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

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-white rounded-[5px] border p-6 hover:shadow-lg transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <ServiceIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-xs text-gray-500">{service.category}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                    Find Providers <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Provider List Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedService.name} Providers
                </h2>
                <p className="text-gray-600 mt-1">{providers.length} providers available</p>
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
              <p className="text-gray-600">No service providers found for {selectedService.name}.</p>
              <Button
                onClick={() => setSelectedService(null)}
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

                    {/* Services Offered */}
                    {provider.services.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Services Offered:</p>
                        <div className="space-y-3">
                          {provider.services.map((service) => (
                            <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{service.name}</h4>
                                {service.description && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{service.description}</p>
                                )}
                                {service.rating > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {service.rating.toFixed(1)} ({service.reviews})
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-semibold text-gray-900">₹{service.basePrice}</p>
                                <p className="text-xs text-gray-500">base price</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instant Booking Price */}
                    {provider.instantBooking && provider.instantPrice && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Instant Booking Available</span>
                          </div>
                          <span className="font-semibold text-green-900">₹{provider.instantPrice}</span>
                        </div>
                      </div>
                    )}

                    {/* Service Areas */}
                    {provider.serviceAreas.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-1">Service Areas:</p>
                        <div className="flex flex-wrap gap-2">
                          {provider.serviceAreas.map((area, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {provider.instantBooking && provider.instantPrice ? (
                        <Button
                          onClick={() => handleBookService(provider, null, "instant")}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          Book Instant (₹{provider.instantPrice})
                        </Button>
                      ) : null}
                      
                      <Button
                        onClick={() => handleBookService(
                          provider, 
                          provider.services.length > 0 ? provider.services[0] : null, 
                          "schedule"
                        )}
                        variant={provider.instantBooking ? "outline" : "default"}
                        className={`flex items-center gap-2 cursor-pointer ${!provider.instantBooking ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                      >
                        <Calendar className="w-4 h-4" />
                        {provider.services.length > 0 && provider.services[0].basePrice 
                          ? `Schedule (₹${provider.services[0].basePrice}+)` 
                          : 'Schedule Service'}
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
          <div className="bg-white rounded-[5px] max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Book {selectedService?.name}
            </h2>

            {/* Provider Summary */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedProvider.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {selectedProvider.rating.toFixed(1)} ({selectedProvider.reviews} reviews)
              </div>
              {selectedListing && (
                <div className="text-sm text-gray-700 mt-2">
                  <p className="font-medium">{selectedListing.name}</p>
                  {selectedListing.description && (
                    <p className="text-xs text-gray-600 mt-1">{selectedListing.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Booking Type Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Select Service Type</p>
              <div className="space-y-2">
                {selectedProvider.instantBooking && selectedProvider.instantPrice && (
                  <button
                    onClick={() => setBookingType("instant")}
                    className={`w-full p-3 border rounded-lg text-left transition-all ${
                      bookingType === "instant"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Instant Service</p>
                        <p className="text-xs text-gray-600">Available now</p>
                      </div>
                      <span className="font-semibold text-green-600">₹{selectedProvider.instantPrice}</span>
                    </div>
                  </button>
                )}
                <button
                  onClick={() => setBookingType("schedule")}
                  className={`w-full p-3 border rounded-lg text-left transition-all ${
                    bookingType === "schedule"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Schedule Service</p>
                      <p className="text-xs text-gray-600">Choose date & time</p>
                    </div>
                    {selectedListing?.basePrice ? (
                      <span className="font-semibold text-blue-600">₹{selectedListing.basePrice}</span>
                    ) : (
                      <span className="text-xs text-gray-500">Price TBD</span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Schedule Inputs */}
            {bookingType === "schedule" && (
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Select Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            )}

            {/* Location Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Service Location
              </label>
              <textarea
                value={bookingLocation}
                onChange={(e) => setBookingLocation(e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                placeholder="Any specific requirements or instructions"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              {(() => {
                const basePrice = bookingType === "instant" && selectedProvider.instantPrice
                  ? selectedProvider.instantPrice
                  : selectedListing?.basePrice || 0;
                const serviceTax = basePrice * 0.1;
                const total = basePrice + serviceTax;

                // If no price is set, show estimation message
                if (basePrice === 0) {
                  return (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600">
                        Pricing will be discussed with the provider
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        You can provide your budget in the description above
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-medium">₹{basePrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Tax (10%)</span>
                      <span className="font-medium">₹{serviceTax.toFixed(0)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-green-600 text-lg">₹{total.toFixed(0)}</span>
                    </div>
                  </>
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
