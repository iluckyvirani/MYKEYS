"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Building, Plus, Filter, Search, Eye, Edit, MoreVertical, TrendingUp, Calendar, Home, Hotel, TrendingDown, Delete } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

// Mock properties data
const mockProperties = [
  {
    id: "PROP001",
    title: "Seaside Luxury Villa",
    address: "Beach Road, Goa, India",
    listingType: "rent", // rent or buy
    rentalType: "short", // short or long
    price: 45000,
    priceType: "nightly", // nightly, monthly, total
    status: "active", // active, inactive, pending, maintenance
    rating: 4.8,
    reviews: 124,
    propertyType: "villa",
    beds: 4,
    baths: 3,
    sqft: 2800,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070",
    occupancy: 85,
    bookings: 12,
    revenue: 540000,
    lastBooking: "2024-01-05",
    amenities: ["Pool", "Beach View", "WiFi", "AC"],
    createdAt: "2023-11-15",
  },
  {
    id: "PROP002",
    title: "Modern 2BHK Apartment",
    address: "Koramangala, Bangalore, India",
    listingType: "rent",
    rentalType: "long",
    price: 35000,
    priceType: "monthly",
    status: "active",
    rating: 4.5,
    reviews: 89,
    propertyType: "apartment",
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070",
    occupancy: 92,
    bookings: 8,
    revenue: 200000,
    lastBooking: "2024-01-10",
    amenities: ["Fully Furnished", "Gym", "Security"],
    createdAt: "2023-12-01",
  },
  {
    id: "PROP003",
    title: "Mountain View Cottage",
    address: "Shimla, Himachal Pradesh",
    listingType: "rent",
    rentalType: "short",
    price: 18000,
    priceType: "nightly",
    status: "maintenance",
    rating: 4.9,
    reviews: 67,
    propertyType: "cottage",
    beds: 2,
    baths: 1,
    sqft: 1100,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2065",
    occupancy: 45,
    bookings: 5,
    revenue: 90000,
    lastBooking: "2023-12-28",
    amenities: ["Fireplace", "Mountain View", "Kitchen"],
    createdAt: "2023-10-20",
  },
  {
    id: "PROP004",
    title: "Luxury Penthouse for Sale",
    address: "Bandra, Mumbai, India",
    listingType: "buy",
    rentalType: null,
    price: 85000000,
    priceType: "total",
    status: "active",
    rating: 4.7,
    reviews: 45,
    propertyType: "penthouse",
    beds: 3,
    baths: 3,
    sqft: 3200,
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2070",
    occupancy: 0,
    bookings: 0,
    revenue: 0,
    lastBooking: null,
    amenities: ["Private Pool", "Gym", "City View"],
    createdAt: "2023-12-25",
  },
  {
    id: "PROP005",
    title: "Beachfront Bungalow",
    address: "Kovalam, Kerala",
    listingType: "rent",
    rentalType: "short",
    price: 32000,
    priceType: "nightly",
    status: "inactive",
    rating: 4.6,
    reviews: 92,
    propertyType: "bungalow",
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070",
    occupancy: 0,
    bookings: 0,
    revenue: 0,
    lastBooking: null,
    amenities: ["Private Beach", "Garden", "Chef"],
    createdAt: "2023-09-15",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "active":
      return { 
        color: "bg-green-100 text-green-800 border-green-200", 
        label: "Active",
        icon: "●"
      };
    case "inactive":
      return { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        label: "Inactive",
        icon: "○"
      };
    case "maintenance":
      return { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        label: "Maintenance",
        icon: "⚒"
      };
    case "pending":
      return { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        label: "Pending",
        icon: "⏳"
      };
    default:
      return { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        label: "Unknown",
        icon: "?"
      };
  }
};

const getListingTypeBadge = (listingType: string, rentalType?: string | null) => {
  if (listingType === "buy") {
    return {
      text: "For Sale",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: TrendingUp,
    };
  }
  if (rentalType === "short") {
    return {
      text: "Short Stay",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: Hotel,
    };
  }
  if (rentalType === "long") {
    return {
      text: "Long Term",
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Calendar,
    };
  }
  return {
    text: "For Rent",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Home,
  };
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString()}`;
};

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState(mockProperties);
  const [filter, setFilter] = useState("all"); // all, active, inactive, short, long, buy
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProperties = properties.filter(property => {
    if (filter === "all") return true;
    if (filter === "active") return property.status === "active";
    if (filter === "inactive") return property.status === "inactive";
    if (filter === "short") return property.rentalType === "short";
    if (filter === "long") return property.rentalType === "long";
    if (filter === "buy") return property.listingType === "buy";
    return true;
  }).filter(property => 
    property.title.toLowerCase().includes(search.toLowerCase()) ||
    property.address.toLowerCase().includes(search.toLowerCase())
  );

  const togglePropertyStatus = (id: string) => {
    setProperties(properties.map(prop => 
      prop.id === id 
        ? { ...prop, status: prop.status === "active" ? "inactive" : "active" }
        : prop
    ));
  };

  const deleteProperty = (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter(prop => prop.id !== id));
    }
  };

  const activeCount = properties.filter(p => p.status === "active").length;
  const totalRevenue = properties.reduce((sum, p) => sum + p.revenue, 0);
  const totalBookings = properties.reduce((sum, p) => sum + p.bookings, 0);
  const avgRating = properties.length > 0 
    ? (properties.reduce((sum, p) => sum + p.rating, 0) / properties.length).toFixed(1)
    : "0.0";

  return (
    <DashboardLayout defaultRole="owner">
      {/* Header */}
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Properties</h1>
            <p className="text-gray-600 mt-2">
              View, edit, and manage all your property listings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              asChild 
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Link href="/owner/dashboard/properties/add">
                <Plus className="w-4 h-4 mr-2" />
                Add New Property
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeCount} active</span>
              <span className="text-gray-500 ml-2">• {properties.length - activeCount} others</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              This month
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Last 30 days
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-lg font-bold">★</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Based on {properties.reduce((sum, p) => sum + p.reviews, 0)} reviews
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-[5px] border p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties by title, address, or type..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm ${viewMode === "grid" ? "bg-white shadow" : ""}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm ${viewMode === "list" ? "bg-white shadow" : ""}`}
              >
                List
              </button>
            </div>

            <select 
              className="border rounded-[5px] px-3 py-2.5 text-sm bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Properties</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="short">Short Stay</option>
              <option value="long">Long Term</option>
              <option value="buy">For Sale</option>
            </select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["all", "active", "short", "long", "buy", "maintenance"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 text-sm rounded-[5px] border ${
                filter === filterType
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {filterType === "all" && "All"}
              {filterType === "active" && "Active"}
              {filterType === "short" && "Short Stay"}
              {filterType === "long" && "Long Rent"}
              {filterType === "buy" && "For Sale"}
              {filterType === "maintenance" && "Maintenance"}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-[5px] border p-12 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            {search ? "Try a different search term" : "Get started by adding your first property"}
          </p>
          <Button 
            asChild 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Link href="/owner/dashboard/properties/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Link>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => {
            const statusConfig = getStatusConfig(property.status);
            const listingBadge = getListingTypeBadge(property.listingType, property.rentalType);
            const ListingIcon = listingBadge.icon;

            return (
              <div
                key={property.id}
                className="bg-white rounded-[5px] border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Property Image */}
                <div className="relative h-50 overflow-hidden bg-gray-100">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status and Type Badges */}
                  <div className="absolute top-3 left-3 space-y-2">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${listingBadge.color}`}>
                      <ListingIcon className="w-3 h-3 inline mr-1" />
                      {listingBadge.text}
                    </div>
                  </div>

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-2 w-full">
                      <Link 
                        href={`/owner/dashboard/properties/${property.id}`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full bg-white hover:bg-gray-100 text-gray-800">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link 
                        href={`/owner/dashboard/properties/${property.id}/edit`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full bg-white hover:bg-gray-100 text-gray-800">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                      <p className="text-sm text-gray-500 truncate mt-1">{property.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-medium">★ {property.rating}</span>
                      <span className="text-xs text-gray-500">({property.reviews})</span>
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-medium">{property.beds}</span> beds
                      </div>
                      <div>
                        <span className="font-medium">{property.baths}</span> baths
                      </div>
                      <div>
                        <span className="font-medium">{property.sqft.toLocaleString()}</span> sqft
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {property.propertyType}
                    </div>
                  </div>

                  {/* Price and Occupancy */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(property.price)}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {property.priceType === "nightly" ? "/night" : 
                           property.priceType === "monthly" ? "/month" : 
                           "total"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${property.occupancy >= 80 ? "text-green-600" : property.occupancy >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {property.occupancy}% occupancy
                        </div>
                        <div className="text-xs text-gray-500">{property.bookings} bookings</div>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Revenue</span>
                        <span className="font-bold text-gray-900">{formatCurrency(property.revenue)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link 
                      href={`/owner/dashboard/properties/${property.id}`}
                      className="flex-1"
                    >
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full rounded-[5px]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 rounded-[5px]"
                      onClick={() => togglePropertyStatus(property.id)}
                    >
                      {property.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-[5px] border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Property</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Occupancy</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property) => {
                const statusConfig = getStatusConfig(property.status);
                const listingBadge = getListingTypeBadge(property.listingType, property.rentalType);

                return (
                  <tr key={property.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={property.image}
                            alt={property.title}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500">{property.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${listingBadge.color}`}>
                        {listingBadge.text}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              property.occupancy >= 80 ? "bg-green-500" : 
                              property.occupancy >= 50 ? "bg-yellow-500" : 
                              "bg-red-500"
                            }`}
                            style={{ width: `${property.occupancy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{property.occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{formatCurrency(property.revenue)}</div>
                      <div className="text-xs text-gray-500">monthly</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/owner/dashboard/properties/${property.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/owner/dashboard/properties/${property.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => deleteProperty(property.id)}
                        >
                          <Delete className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      {filteredProperties.length > 0 && (
        <div className="mt-6 bg-white rounded-[5px] border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {properties.length} properties • 
              {filteredProperties.filter(p => p.status === "active").length} active • 
              {filteredProperties.filter(p => p.occupancy >= 80).length} high occupancy
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(filteredProperties.reduce((sum, p) => sum + p.revenue, 0))}
                </div>
                <div className="text-xs text-gray-500">Total Monthly Revenue</div>
              </div>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}