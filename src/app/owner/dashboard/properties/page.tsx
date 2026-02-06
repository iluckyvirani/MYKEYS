"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Building, Plus, Filter, Search, Eye, Edit, MoreVertical, TrendingUp, Calendar, Home, Hotel, TrendingDown, Delete } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

const getStatusConfig = (status: string) => {
  const statusMap: Record<string, any> = {
    ACTIVE: { 
      color: "bg-green-100 text-green-800 border-green-200", 
      label: "Active",
      icon: "●"
    },
    INACTIVE: { 
      color: "bg-gray-100 text-gray-800 border-gray-200", 
      label: "Inactive",
      icon: "○"
    },
    MAINTENANCE: { 
      color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      label: "Maintenance",
      icon: "⚒"
    },
    PENDING_REVIEW: { 
      color: "bg-blue-100 text-blue-800 border-blue-200", 
      label: "Pending",
      icon: "⏳"
    },
    DRAFT: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      label: "Draft",
      icon: "📝"
    }
  };
  return statusMap[status] || statusMap.INACTIVE;
};

const getListingTypeBadge = (listingType: string, rentalType?: string | null) => {
  if (listingType === "BUY") {
    return {
      text: "For Sale",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: TrendingUp,
    };
  }
  if (rentalType === "SHORT_TERM") {
    return {
      text: "Short Stay",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: Hotel,
    };
  }
  if (rentalType === "LONG_TERM") {
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
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, ACTIVE, INACTIVE, SHORT_TERM, LONG_TERM, BUY
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/properties?pageSize=100");
      
      if (response.data?.success && response.data.data?.items) {
        setProperties(response.data.data.items);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to fetch properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    if (filter === "all") return true;
    if (filter === "ACTIVE") return property.status === "ACTIVE";
    if (filter === "INACTIVE") return property.status === "INACTIVE";
    if (filter === "SHORT_TERM") return property.rentalType === "SHORT_TERM";
    if (filter === "LONG_TERM") return property.rentalType === "LONG_TERM";
    if (filter === "BUY") return property.listingType === "BUY";
    return true;
  }).filter(property => 
    property.title.toLowerCase().includes(search.toLowerCase()) ||
    property.address.toLowerCase().includes(search.toLowerCase())
  );

  const togglePropertyStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await api.patch(`/properties/${id}`, { status: newStatus });
      
      if (response.data?.success) {
        setProperties(properties.map(prop => 
          prop.id === id 
            ? { ...prop, status: newStatus }
            : prop
        ));
      }
    } catch (err) {
      console.error("Error updating property status:", err);
      alert("Failed to update property status");
    }
  };

  const deleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await api.delete(`/properties/${id}`);
      
      if (response.data?.success) {
        setProperties(properties.filter(prop => prop.id !== id));
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property");
    }
  };

  const activeCount = properties.filter(p => p.status === "ACTIVE").length;
  const totalRevenue = properties.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalBookings = properties.length;
  const avgRating = properties.length > 0 
    ? (properties.reduce((sum, p) => sum + (p.averageRating || 0), 0) / properties.length).toFixed(1)
    : "0.0";

  if (error) {
    return (
      <DashboardLayout defaultRole="owner">
        <div className="bg-red-50 border border-red-200 rounded-[5px] p-4 text-red-700">
          <h3 className="font-semibold">Error</h3>
          <p>{error}</p>
          <Button size="sm" onClick={fetchProperties} className="mt-2">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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
                <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Properties listed
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
              Calculated from properties
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
              Based on reviews
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
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SHORT_TERM">Short Stay</option>
              <option value="LONG_TERM">Long Term</option>
              <option value="BUY">For Sale</option>
            </select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["all", "ACTIVE", "SHORT_TERM", "LONG_TERM", "BUY"].map((filterType) => (
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
              {filterType === "ACTIVE" && "Active"}
              {filterType === "SHORT_TERM" && "Short Stay"}
              {filterType === "LONG_TERM" && "Long Rent"}
              {filterType === "BUY" && "For Sale"}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid/List */}
      {loading ? (
        <div className="bg-white rounded-[5px] border p-12 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
          <p className="text-gray-500 mt-4">Loading your properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-[5px] border p-12 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">
            {search ? "Try a different search term" : "Get started by adding your first property"}
          </p>
          <Button 
            asChild 
            className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                  {property.images?.[0]?.url ? (
                    <Image
                      src={property.images[0].url}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Building className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
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
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
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
                      <span className="text-yellow-600 font-medium">★ {property.averageRating || "0"}</span>
                      <span className="text-xs text-gray-500">({property.reviewCount || 0})</span>
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="font-medium">{property.bedrooms}</span> beds
                      </div>
                      <div>
                        <span className="font-medium">{property.bathrooms}</span> baths
                      </div>
                      <div>
                        <span className="font-medium">{(property.sqft || 0).toLocaleString()}</span> sqft
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
                          {property.priceType === "NIGHTLY" ? "/night" : 
                           property.priceType === "MONTHLY" ? "/month" : 
                           "total"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${property.occupancy >= 80 ? "text-green-600" : property.occupancy >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {property.occupancy || 0}% occupancy
                        </div>
                        <div className="text-xs text-gray-500">Listed property</div>
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="font-bold text-gray-900">{formatCurrency(property.revenue || 0)}</span>
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
                      onClick={() => togglePropertyStatus(property.id, property.status)}
                    >
                      {property.status === "ACTIVE" ? "Deactivate" : "Activate"}
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
                          {property.images?.[0]?.url ? (
                            <Image
                              src={property.images[0].url}
                              alt={property.title}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
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
                            style={{ width: `${property.occupancy || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{property.occupancy || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{formatCurrency(property.revenue || 0)}</div>
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
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
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
              {filteredProperties.filter(p => p.status === "ACTIVE").length} active • 
              {filteredProperties.filter(p => (p.occupancy || 0) >= 80).length} high occupancy
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(filteredProperties.reduce((sum, p) => sum + (p.revenue || 0), 0))}
                </div>
                <div className="text-xs text-gray-500">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

    