"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Building,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  TrendingUp,
  Calendar,
  Home,
  Hotel,
  Loader,
  AlertCircle,
  MapPin,
  Package,
  Star,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { OwnerPackageWithUsage } from "@/types/package";

interface OwnerProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  listingType: "rent" | "buy";
  rentalType: "short" | "long" | null;
  price: number;
  priceType: "nightly" | "monthly" | "total";
  status: "active" | "inactive" | "maintenance" | "pending" | "draft" | "sold" | "rented";
  rating: number;
  reviews: number;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  guests: number;
  minStay: number | null;
  maxStay: number | null;
  image: string;
  bookings: number;
  revenue: number;
  lastBooking: string | null;
  amenities: string[];
  createdAt: string | null;
  isFeatured: boolean;
}

const getStatusConfig = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
        icon: "●",
      };
    case "inactive":
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Inactive",
        icon: "○",
      };
    case "maintenance":
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Maintenance",
        icon: "⚒",
      };
    case "pending":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Pending",
        icon: "⏳",
      };
    case "draft":
      return {
        color: "bg-gray-100 text-gray-600 border-gray-200",
        label: "Draft",
        icon: "✎",
      };
    case "sold":
      return {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Sold",
        icon: "✓",
      };
    case "rented":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Rented",
        icon: "✓",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Unknown",
        icon: "?",
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
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const normalizeProperty = (item: any): OwnerProperty => {
  const full = item?.fullData ?? item ?? {};
  const listingTypeRaw = String(full.listingType ?? item?.listingType ?? "RENT").toUpperCase();
  const rentalTypeRaw = String(full.rentalType ?? item?.rentalType ?? "").toUpperCase();
  const priceTypeRaw = String(full.priceType ?? item?.priceType ?? "").toUpperCase();
  const statusRaw = String(full.status ?? item?.status ?? "ACTIVE").toLowerCase();
  const images = Array.isArray(full.images) ? full.images : [];
  const primaryImage = images.find((img: any) => img?.isPrimary)?.url || images[0]?.url || "";

  return {
    id: String(full.id ?? item?.id ?? ""),
    title: String(full.title ?? "Untitled Property"),
    address: String(full.address ?? ""),
    city: String(full.city ?? ""),
    state: String(full.state ?? ""),
    zipCode: String(full.zipCode ?? ""),
    country: String(full.country ?? ""),
    listingType: listingTypeRaw === "BUY" ? "buy" : "rent",
    rentalType: listingTypeRaw === "BUY" ? null : rentalTypeRaw === "SHORT_TERM" ? "short" : rentalTypeRaw === "LONG_TERM" ? "long" : null,
    price: Number(full.propertyPrice ?? full.price ?? 0),
    priceType: listingTypeRaw === "BUY" ? "total" : priceTypeRaw === "NIGHTLY" ? "nightly" : "monthly",
    status: (statusRaw as any) || "draft",
    rating: Number(item?.rating ?? full.averageRating ?? 0),
    reviews: Number(item?.reviews ?? full.reviewCount ?? 0),
    propertyType: String(full.propertyType ?? "property"),
    beds: Number(full.bedrooms ?? full.beds ?? 0),
    baths: Number(full.bathrooms ?? full.baths ?? 0),
    sqft: Number(full.sqft ?? 0),
    guests: Number(full.guests ?? 0),
    minStay: full.minStay != null ? Number(full.minStay) : null,
    maxStay: full.maxStay != null ? Number(full.maxStay) : null,
    image: primaryImage,
    bookings: Number(item?.bookings ?? 0),
    revenue: Number(item?.revenue ?? 0),
    lastBooking: full.lastBooking ?? null,
    amenities: Array.isArray(full.amenities)
      ? full.amenities.map((a: any) => (typeof a === "string" ? a : a?.name || ""))
      : [],
    createdAt: full.createdAt ?? null,
    isFeatured: Boolean(full.isFeatured ?? false),
  };
};

export default function OwnerPropertiesPage() {
  const [properties, setProperties] = useState<OwnerProperty[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ownerPkg, setOwnerPkg] = useState<OwnerPackageWithUsage | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/owner/properties");
      const rawItems: any[] = Array.isArray(response?.data?.data) ? response.data.data : [];

      setProperties(rawItems.map(normalizeProperty));
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err?.response?.data?.message || "Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
    api.get("/owner/packages").then((res) => setOwnerPkg(res.data?.data ?? null)).catch(() => {});
  }, [fetchProperties]);

  const filteredProperties = useMemo(() => {
    return properties
      .filter((property) => {
        if (filter === "all") return true;
        if (filter === "active") return property.status === "active";
        if (filter === "inactive") return property.status === "inactive";
        if (filter === "short") return property.rentalType === "short";
        if (filter === "long") return property.rentalType === "long";
        if (filter === "buy") return property.listingType === "buy";
        if (filter === "maintenance") return property.status === "maintenance";
        return true;
      })
      .filter(
        (property) =>
          property.title.toLowerCase().includes(search.toLowerCase()) ||
          property.address.toLowerCase().includes(search.toLowerCase()) ||
          property.propertyType.toLowerCase().includes(search.toLowerCase())
      );
  }, [properties, filter, search]);

  const togglePropertyStatus = async (id: string) => {
    const current = properties.find((p) => p.id === id);
    if (!current) return;
    const nextStatus = current.status === "active" ? "inactive" : "active";

    try {
      setUpdatingStatusId(id);
      await api.patch(`/owner/properties/${id}/status`, { status: nextStatus.toUpperCase() });
      setProperties((prev) =>
        prev.map((prop) => (prop.id === id ? { ...prop, status: nextStatus } : prop))
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update property status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const activeCount = properties.filter((p) => p.status === "active").length;
  const totalRevenue = properties.reduce((sum, p) => sum + p.revenue, 0);
  const totalBookings = properties.reduce((sum, p) => sum + p.bookings, 0);
  const avgRating = properties.length > 0 ? (properties.reduce((sum, p) => sum + p.rating, 0) / properties.length).toFixed(1) : "0.0";

  // A property is "gated" if it needs a package to be published (LONG_RENT or BUY)
  const isGated = (p: OwnerProperty) => p.listingType === "buy" || p.rentalType === "long";
  const hasPackage = ownerPkg !== null;
  const packageFull = hasPackage && ownerPkg!.propertiesLimit > 0 && ownerPkg!.propertiesUsed >= ownerPkg!.propertiesLimit;
  const featuredLimit = ownerPkg?.featuredLimit ?? 0;
  const featuredUsed  = ownerPkg?.featuredUsed  ?? 0;
  const canFeatureMore = featuredLimit > 0 && featuredUsed < featuredLimit;

  const toggleFeatured = async (id: string) => {
    const current = properties.find((p) => p.id === id);
    if (!current) return;
    const next = !current.isFeatured;
    try {
      setUpdatingFeaturedId(id);
      await api.patch(`/owner/properties/${id}/featured`, { isFeatured: next });
      setProperties((prev) =>
        prev.map((prop) => (prop.id === id ? { ...prop, isFeatured: next } : prop))
      );
      // Refresh package usage counts
      api.get("/owner/packages").then((res) => setOwnerPkg(res.data?.data ?? null)).catch(() => {});
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update featured status");
    } finally {
      setUpdatingFeaturedId(null);
    }
  };

  return (
    <DashboardLayout defaultRole="owner">
      {/* Package banner for owners with gated listings but no package */}
      {!hasPackage && properties.some(isGated) && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[5px] p-4 text-amber-900">
          <Package className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">Package required for Long Rent &amp; Buy listings</p>
            <p className="text-sm mt-0.5">You have Long Rent or Buy listings that need an active package to be published.</p>
          </div>
          <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
            <Link href="/owner/packages"><Package className="w-4 h-4 mr-1" /> Buy a Package</Link>
          </Button>
        </div>
      )}
      {hasPackage && packageFull && properties.some((p) => isGated(p) && p.status !== "active") && (
        <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-[5px] p-4 text-blue-900">
          <Package className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
          <div className="flex-1">
            <p className="font-semibold">Listing limit reached</p>
            <p className="text-sm mt-0.5">Your current package is full ({ownerPkg!.propertiesUsed}/{ownerPkg!.propertiesLimit} listings used). Upgrade to publish more properties.</p>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/owner/packages">Upgrade</Link>
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Properties</h1>
            <p className="text-gray-600 mt-2">View, edit, and manage all your property listings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
            <div className="mt-2 text-sm text-gray-500">This month</div>
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
            <div className="mt-2 text-sm text-gray-500">Last 30 days</div>
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
            <div className="mt-2 text-sm text-gray-500">Based on {properties.reduce((sum, p) => sum + p.reviews, 0)} reviews</div>
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

            <select className="border rounded-[5px] px-3 py-2.5 text-sm bg-white" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Properties</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="short">Short Stay</option>
              <option value="long">Long Term</option>
              <option value="buy">For Sale</option>
              <option value="maintenance">Maintenance</option>
            </select>
{/* 
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button> */}
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["all", "active", "short", "long", "buy", "maintenance"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1.5 text-sm rounded-[5px] border ${
                filter === filterType ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
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

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-[5px] flex items-start gap-2 text-red-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-[5px] border p-12 text-center">
          <Loader className="w-7 h-7 text-green-600 animate-spin mx-auto" />
          <p className="text-gray-500 mt-3">Loading properties...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-[5px] border p-12 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-6">{search ? "Try a different search term" : "Get started by adding your first property"}</p>
          <Button asChild className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Link href="/owner/dashboard/properties/add">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Link>
          </Button>
        </div>
      ) : viewMode === "grid" ? (
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
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  {property.image ? (
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}

                  <div className="absolute top-3 left-3 space-y-2">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${listingBadge.color}`}>
                      <ListingIcon className="w-3 h-3 inline mr-1" />
                      {listingBadge.text}
                    </div>
                  </div>

                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {property.city}, {property.state}
                          {property.zipCode ? ` ${property.zipCode}` : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">{property.address}</p>
                    </div>
                    <div className="flex items-center gap-2 pl-3">
                      <span className="text-yellow-600 font-medium">★ {property.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({property.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-3">
                      <div><span className="font-medium">{property.beds}</span> beds</div>
                      <div><span className="font-medium">{property.baths}</span> baths</div>
                      <div><span className="font-medium">{property.sqft.toLocaleString()}</span> sqft</div>
                      {property.rentalType === "short" && <div><span className="font-medium">{property.guests}</span> guests</div>}
                    </div>
                    <div className="text-sm font-medium capitalize">{property.propertyType}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(property.price)}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          {property.priceType === "nightly" ? "/night" : property.priceType === "monthly" ? "/month" : "total"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{property.bookings} bookings</div>
                    </div>

                    {property.rentalType === "short" && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Monthly Revenue</span>
                          <span className="font-bold text-gray-900">{formatCurrency(property.revenue)}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {property.country}
                      {property.rentalType === "short" && property.minStay != null && ` • Min stay ${property.minStay} night${property.minStay > 1 ? "s" : ""}`}
                    </div>
                  </div>

                  {/* Featured badge on card */}
                  {property.isFeatured && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-medium mb-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Featured
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/owner/dashboard/properties/${property.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-[5px] cursor-pointer">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/owner/dashboard/properties/${property.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full rounded-[5px] cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    {isGated(property) && !hasPackage ? (
                      <Button asChild size="sm" className="flex-1 rounded-[5px] bg-amber-500 hover:bg-amber-600 text-white text-xs">
                        <Link href="/owner/packages"><Package className="w-3 h-3 mr-1" />Get Package</Link>
                      </Button>
                    ) : isGated(property) && packageFull && property.status !== "active" ? (
                      <Button asChild size="sm" variant="outline" className="flex-1 rounded-[5px] text-xs">
                        <Link href="/owner/packages">Upgrade</Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-[5px] cursor-pointer"
                        disabled={updatingStatusId === property.id}
                        onClick={() => togglePropertyStatus(property.id)}
                      >
                        {property.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    )}
                  </div>

                  {/* Featured toggle — only visible when package supports it */}
                  {featuredLimit > 0 && (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={`w-full rounded-[5px] text-xs gap-1.5 ${
                          property.isFeatured
                            ? "text-amber-600 hover:text-amber-700"
                            : canFeatureMore
                            ? "text-gray-500 hover:text-amber-600"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        disabled={updatingFeaturedId === property.id || (!property.isFeatured && !canFeatureMore)}
                        onClick={() => toggleFeatured(property.id)}
                        title={
                          property.isFeatured
                            ? "Remove from featured"
                            : !canFeatureMore
                            ? `Featured limit reached (${featuredUsed}/${featuredLimit})`
                            : `Feature this property (${featuredUsed}/${featuredLimit} used)`
                        }
                      >
                        <Star className={`w-3.5 h-3.5 ${property.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                        {property.isFeatured ? "Remove Featured" : `Feature (${featuredUsed}/${featuredLimit})`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[5px] border overflow-x-auto">
          <table className="w-full min-w-225">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Property</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Details</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Featured</th>
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
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {property.image ? (
                            <img src={property.image} alt={property.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">-</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500 capitalize">{property.propertyType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div>{property.city}, {property.state}</div>
                      <div className="text-xs text-gray-500">{property.zipCode || "-"}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {property.beds} bed • {property.baths} bath • {property.sqft} sqft
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${listingBadge.color}`}>{listingBadge.text}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
                    </td>
                    <td className="py-4 px-4">
                      {property.rentalType === "short" ? (
                        <>
                          <div className="font-bold text-gray-900">{formatCurrency(property.revenue)}</div>
                          <div className="text-xs text-gray-500">monthly</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {featuredLimit > 0 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            property.isFeatured ? "text-amber-500" : canFeatureMore ? "text-gray-400 hover:text-amber-500" : "text-gray-200 cursor-not-allowed"
                          }`}
                          disabled={updatingFeaturedId === property.id || (!property.isFeatured && !canFeatureMore)}
                          onClick={() => toggleFeatured(property.id)}
                          title={property.isFeatured ? "Remove featured" : !canFeatureMore ? `Limit reached (${featuredUsed}/${featuredLimit})` : `Feature property`}
                        >
                          <Star className={`w-4 h-4 ${property.isFeatured ? "fill-amber-400" : ""}`} />
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
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
                        {isGated(property) && !hasPackage ? (
                            <Button asChild size="sm" className="h-8 px-2 bg-amber-500 hover:bg-amber-600 text-white text-xs">
                              <Link href="/owner/packages"><Package className="w-3 h-3 mr-1" />Get Package</Link>
                            </Button>
                          ) : isGated(property) && packageFull && property.status !== "active" ? (
                            <Button asChild size="sm" variant="outline" className="h-8 px-2 text-xs">
                              <Link href="/owner/packages">Upgrade</Link>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingStatusId === property.id}
                              className="h-8 px-2"
                              onClick={() => togglePropertyStatus(property.id)}
                            >
                              {property.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredProperties.length > 0 && (
        <div className="mt-6 bg-white rounded-[5px] border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {filteredProperties.length} of {properties.length} properties • {filteredProperties.filter((p) => p.status === "active").length} active
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(filteredProperties.reduce((sum, p) => sum + p.revenue, 0))}</div>
                <div className="text-xs text-gray-500">Total Monthly Revenue</div>
              </div>
              <Button variant="outline" size="sm">Export Data</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

