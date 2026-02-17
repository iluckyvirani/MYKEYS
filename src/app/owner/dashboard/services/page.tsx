"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wrench,
  ChefHat,
  MapPin,
  Star,
  Filter,
  Search,
  MessageCircle,
  Calendar,
  Zap,
  ArrowRight,
  Home,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
  serviceId: string;
  rating: number;
  reviews: number;
  distance: string;
  basePrice: number;
  pricePerHour: number;
  image: string;
  availability: string;
  type: "instant" | "schedule";
  comments: Array<{ author: string; rating: number; text: string }>;
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
    name: "Electrician",
    category: "Maintenance",
    description: "Electrical repairs and installations",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
  {
    id: "3",
    name: "Cleaning",
    category: "Cleaning",
    description: "Deep cleaning and maintenance",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
  {
    id: "4",
    name: "Pest Control",
    category: "Maintenance",
    description: "Pest and termite control",
    icon: Wrench,
    types: ["schedule"],
  },
  {
    id: "5",
    name: "Painting",
    category: "Maintenance",
    description: "Interior and exterior painting",
    icon: Wrench,
    types: ["schedule"],
  },
  {
    id: "6",
    name: "Maintenance",
    category: "Maintenance",
    description: "General maintenance and repairs",
    icon: Wrench,
    types: ["instant", "schedule"],
  },
];

const providers: Provider[] = [
  {
    id: "p1",
    name: "John's Plumbing Services",
    serviceId: "1",
    rating: 4.8,
    reviews: 156,
    distance: "2.5 km away",
    basePrice: 500,
    pricePerHour: 300,
    image: "/api/placeholder/100/100",
    availability: "Available now",
    type: "instant",
    comments: [
      { author: "Property Owner", rating: 5, text: "Professional service, fixed issue quickly." },
      { author: "Building Manager", rating: 5, text: "Reliable and efficient." },
    ],
  },
  {
    id: "p2",
    name: "Prime Electricians",
    serviceId: "2",
    rating: 4.7,
    reviews: 112,
    distance: "3.1 km away",
    basePrice: 600,
    pricePerHour: 400,
    image: "/api/placeholder/100/100",
    availability: "Available in 2 hours",
    type: "instant",
    comments: [
      { author: "Owner", rating: 5, text: "Great work on property rewiring." },
    ],
  },
  {
    id: "p3",
    name: "Clean & Fresh Services",
    serviceId: "3",
    rating: 4.9,
    reviews: 198,
    distance: "1.8 km away",
    basePrice: 2000,
    pricePerHour: 1000,
    image: "/api/placeholder/100/100",
    availability: "Can come today",
    type: "instant",
    comments: [
      { author: "Property Manager", rating: 5, text: "Deep cleaning done perfectly." },
      { author: "Owner", rating: 5, text: "Team is punctual and thorough." },
    ],
  },
];

export default function OwnerServicesPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<"instant" | "schedule">("instant");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const serviceProviders = selectedService
    ? providers.filter(p => p.serviceId === selectedService.id)
    : [];

  const properties = [
    { id: "prop1", name: "Seaside Villa - Goa" },
    { id: "prop2", name: "Urban Apartment - Mumbai" },
    { id: "prop3", name: "Mountain Cottage - Shimla" },
  ];

  const handleBookService = (provider: Provider, type: "instant" | "schedule") => {
    if (!selectedProperty) {
      alert("Please select a property first");
      return;
    }
    setSelectedProvider(provider);
    setBookingType(type);
    setShowBookingModal(true);
  };

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Services for Your Properties</h1>
            <p className="text-gray-600 mt-2">
              Hire trusted service providers for maintenance and repairs
            </p>
          </div>
        </div>
      </div>

      {/* Property Selection */}
      {!selectedService && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-[5px] p-6">
          <p className="text-sm font-medium text-gray-900 mb-4">Select a Property</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop) => (
              <button
                key={prop.id}
                onClick={() => setSelectedProperty(prop.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedProperty === prop.id
                    ? "border-green-600 bg-green-50"
                    : "border-blue-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{prop.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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
                    placeholder="Search services (Plumbing, Electrical, etc.)"
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <select className="border rounded-[5px] px-4 py-2 text-sm w-full md:w-auto">
                  <option>All Services</option>
                  <option>Instant Available</option>
                  <option>Schedule Available</option>
                  <option>Maintenance</option>
                  <option>Repairs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="bg-white rounded-[5px] border p-6 hover:shadow-lg transition-all text-left group"
                  disabled={!selectedProperty}
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
                  <div className="flex items-center gap-2 text-green-600 font-medium text-sm cursor-pointer">
                    Find Providers <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedService(null);
                setSearchQuery("");
              }}
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 mb-4"
            >
              ← Back to Services
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedService.name} Providers
                </h2>
                <p className="text-gray-600 mt-1">{serviceProviders.length} providers available</p>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="space-y-6">
            {serviceProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-[5px] border p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Provider Info */}
                  <div className="flex-shrink-0">
                    <Image
                      src={provider.image}
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
                          {provider.distance}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">{provider.rating}</span>
                          <span className="text-sm text-gray-500">({provider.reviews})</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          {provider.type === "instant" ? "Instant Available" : "Schedule"}
                        </Badge>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600">Base Price</p>
                        <p className="font-semibold text-gray-900">₹{provider.basePrice}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200" />
                      <div>
                        <p className="text-xs text-gray-600">Per Hour</p>
                        <p className="font-semibold text-gray-900">₹{provider.pricePerHour}/hr</p>
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Reviews from Property Owners</p>
                      <div className="space-y-2">
                        {provider.comments.map((comment, idx) => (
                          <div key={idx} className="text-sm bg-green-50 p-3 rounded border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{comment.author}</span>
                              {Array.from({ length: comment.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {provider.type === "instant" && (
                        <Button
                          onClick={() => handleBookService(provider, "instant")}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4" />
                          Book Instant
                        </Button>
                      )}
                      <Button
                        onClick={() => handleBookService(provider, "schedule")}
                        variant="outline"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[5px] max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Book {selectedService?.name}
            </h2>

            {/* Provider Summary */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedProvider.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {selectedProvider.rating} ({selectedProvider.reviews} reviews)
              </div>
              <p className="text-sm font-medium text-gray-900">
                Property: {properties.find(p => p.id === selectedProperty)?.name}
              </p>
            </div>

            {/* Booking Type Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-900 mb-3">Select Service Type</p>
              <div className="space-y-2">
                {selectedProvider.type === "instant" && (
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
                      <div>
                        <p className="font-medium text-gray-900">Instant Service</p>
                        <p className="text-xs text-gray-600">Available now</p>
                      </div>
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
                    <div>
                      <p className="font-medium text-gray-900">Schedule Service</p>
                      <p className="text-xs text-gray-600">Choose date & time</p>
                    </div>
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

            {/* Pricing Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium">₹{selectedProvider.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Tax (10%)</span>
                <span className="font-medium">₹{(selectedProvider.basePrice * 0.1).toFixed(0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-green-600">
                  ₹{(selectedProvider.basePrice * 1.1).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowBookingModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
