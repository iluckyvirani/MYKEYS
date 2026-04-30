"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, MessageSquare, Zap } from "lucide-react";
import { ServiceProvider, ServiceCategory } from "@/types/service";

interface ServiceProviderListProps {
  category?: ServiceCategory;
  onSelectProvider?: (provider: ServiceProvider) => void;
}

// Mock data - replace with API response
const mockProviders: ServiceProvider[] = [
  {
    id: "1",
    userId: "user-1",
    name: "Raj Kumar",
    email: "raj@service.com",
    phone: "+91-9876543210",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    category: "plumbing",
    subcategories: [
      { id: "pipe-repair", name: "Pipe Repair", category: "plumbing" },
      { id: "tap-repair", name: "Tap Repair", category: "plumbing" },
    ],
    serviceAreas: ["Downtown", "Suburbs", "North District"],
    rating: 4.8,
    totalReviews: 342,
    instantBookingEnabled: true,
    instantBookingPrice: 500,
    documentVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user-2",
    name: "Priya Sharma",
    email: "priya@service.com",
    phone: "+91-9876543211",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    category: "cleaning",
    subcategories: [
      { id: "home-cleaning", name: "Home Cleaning", category: "cleaning" },
      { id: "office-cleaning", name: "Office Cleaning", category: "cleaning" },
    ],
    serviceAreas: ["Downtown", "East Side", "Central"],
    rating: 4.9,
    totalReviews: 567,
    instantBookingEnabled: true,
    instantBookingPrice: 300,
    documentVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    userId: "user-3",
    name: "Vikram Singh",
    email: "vikram@service.com",
    phone: "+91-9876543212",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    category: "ac-repair",
    subcategories: [
      { id: "installation", name: "Installation", category: "ac-repair" },
      { id: "repair", name: "Repair", category: "ac-repair" },
    ],
    serviceAreas: ["North District", "West Side", "Suburbs"],
    rating: 4.7,
    totalReviews: 289,
    instantBookingEnabled: false,
    documentVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    userId: "user-4",
    name: "Anjali Verma",
    email: "anjali@service.com",
    phone: "+91-9876543213",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    category: "electrical",
    subcategories: [
      { id: "wiring", name: "Wiring", category: "electrical" },
      { id: "switch-repair", name: "Switch Repair", category: "electrical" },
    ],
    serviceAreas: ["Downtown", "Central", "East Side"],
    rating: 4.6,
    totalReviews: 198,
    instantBookingEnabled: true,
    instantBookingPrice: 600,
    documentVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function ServiceProviderList({
  category,
  onSelectProvider,
}: ServiceProviderListProps) {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  const filteredProviders = category
    ? mockProviders.filter((p) => p.category === category)
    : mockProviders;

  const handleSelectProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    onSelectProvider?.(provider);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {category ? "Available Service Professionals" : "Top-Rated Professionals"}
          </h2>
          <p className="text-xl text-gray-600">
            Book from our verified and highly-rated service professionals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider, idx) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-green-600">
                {/* Header with Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-cyan-100 overflow-hidden">
                  <img
                    src={provider.profileImage}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                  {provider.instantBookingEnabled && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-white flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Instant
                    </Badge>
                  )}
                  {provider.documentVerified && (
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white">
                      Verified
                    </Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-2xl">{provider.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-gray-600 mt-2">
                    <Phone className="w-4 h-4" />
                    {provider.phone}
                  </CardDescription>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-lg">{provider.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ({provider.totalReviews} reviews)
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Service Areas */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                      <MapPin className="w-4 h-4" />
                      Service Areas
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {provider.serviceAreas.map((area, idx) => (
                        <Badge key={idx} variant="outline" className="bg-green-50">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Available Today</span>
                  </div>

                  {/* Instant Booking Info */}
                  {provider.instantBookingEnabled && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">
                        Instant Booking: £{provider.instantBookingPrice}
                      </p>
                    </div>
                  )}

                    <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleSelectProvider(provider)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-xl text-gray-600">
              No service professionals available in this category yet.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
