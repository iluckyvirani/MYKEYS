"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceListing {
  id: string;
  name: string;
  category: string;
  provider: string;
  basePrice: number;
  description: string;
  status: "active" | "inactive";
  rating: number;
  reviews: number;
  bookings: number;
}

export default function ServiceListingsPage() {
  const [listings, setListings] = useState<ServiceListing[]>([
    {
      id: "1",
      name: "Home Cleaning Service",
      category: "Cleaning",
      provider: "CleanPro Services",
      basePrice: 500,
      description: "Professional home cleaning with eco-friendly products",
      status: "active",
      rating: 4.8,
      reviews: 245,
      bookings: 1203,
    },
    {
      id: "2",
      name: "Plumbing Repair",
      category: "Maintenance",
      provider: "Expert Plumbers Co.",
      basePrice: 800,
      description: "24/7 emergency plumbing services and repairs",
      status: "active",
      rating: 4.6,
      reviews: 189,
      bookings: 876,
    },
    {
      id: "3",
      name: "Electrical Installation",
      category: "Electrical",
      provider: "Spark Electric Solutions",
      basePrice: 1200,
      description: "Complete electrical installation and maintenance",
      status: "active",
      rating: 4.9,
      reviews: 312,
      bookings: 1567,
    },
    {
      id: "4",
      name: "Painting Service",
      category: "Interior Design",
      provider: "Paint Masters",
      basePrice: 1500,
      description: "Interior and exterior painting with premium finishes",
      status: "inactive",
      rating: 4.7,
      reviews: 178,
      bookings: 654,
    },
    {
      id: "5",
      name: "Gardening & Landscaping",
      category: "Gardening",
      provider: "Green Gardens",
      basePrice: 2000,
      description: "Professional gardening and landscape design services",
      status: "active",
      rating: 4.5,
      reviews: 156,
      bookings: 432,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);

  const filteredListings = listings.filter((listing) =>
    listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service listing?")) {
      setListings(listings.filter((l) => l.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setListings(
      listings.map((l) =>
        l.id === id ? { ...l, status: l.status === "active" ? "inactive" : "active" } : l
      )
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return "text-green-600";
    if (rating >= 4.3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              Service Listings
            </h1>
            <p className="text-gray-600 mt-1">Manage and approve service provider listings</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by service name, provider, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="border-2 hover:border-green-500 transition-all p-6"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{listing.name}</h3>
                    <p className="text-sm text-gray-600">{listing.provider}</p>
                  </div>
                  {listing.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>

                {/* Category & Description */}
                <div className="mb-4 pb-4 border-b">
                  <Badge className="bg-blue-100 text-blue-800 mb-2">{listing.category}</Badge>
                  <p className="text-sm text-gray-600">{listing.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded text-center">
                    <p className="text-gray-600 text-xs">Price</p>
                    <p className="font-bold text-gray-900">₹{listing.basePrice}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded text-center">
                    <p className="text-gray-600 text-xs">Bookings</p>
                    <p className="font-bold text-gray-900">{listing.bookings}</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded text-center">
                    <p className="text-gray-600 text-xs">Rating</p>
                    <p className={`font-bold ${getRatingColor(listing.rating)}`}>
                      ⭐ {listing.rating}
                    </p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="mb-4 pb-4 border-b text-sm">
                  <span className="text-gray-600">{listing.reviews} customer reviews</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setSelectedListing(listing)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleToggleStatus(listing.id)}
                  >
                    {listing.status === "active" ? (
                      <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Disable
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(listing.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Listing Details Modal */}
        {selectedListing && (
          <Card className="border-2 border-green-600 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedListing.name}</h2>
                <p className="text-gray-600 text-sm mt-1">by {selectedListing.provider}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedListing(null)}>
                ✕
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Service Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Service Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-semibold">{selectedListing.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Base Price</p>
                    <p className="font-semibold text-lg text-green-600">₹{selectedListing.basePrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge className={selectedListing.status === "active" ? "bg-green-100 text-green-800 mt-1" : "bg-red-100 text-red-800 mt-1"}>
                      {selectedListing.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Provider Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Provider Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-semibold">{selectedListing.provider}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Bookings</p>
                    <p className="font-semibold">{selectedListing.bookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reviews</p>
                    <p className="font-semibold">{selectedListing.reviews}</p>
                  </div>
                </div>
              </div>

              {/* Rating & Performance */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Performance</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Average Rating</p>
                    <p className={`font-bold text-lg ${getRatingColor(selectedListing.rating)}`}>
                      ⭐ {selectedListing.rating} / 5.0
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Based on</p>
                    <p className="font-semibold">{selectedListing.reviews} reviews</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700"><strong>Description:</strong></p>
              <p className="text-gray-600 mt-2">{selectedListing.description}</p>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
