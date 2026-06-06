"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminPropertyFilterModal from "@/components/dashboard/AdminPropertyFilterModal";
import { AdminPropertyStatusModal } from "@/components/dashboard/AdminPropertyStatusModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  Grid,
  List as ListIcon,
  X,
  Home,
  Loader,
  Plus,
  MapPin,
  Building,
  Calendar,
  TrendingUp,
  Hotel,
  Star,
  Eye,
  Edit,
  Trash2,
  Bed,
  Bath,
  Maximize2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getPropertyPriceDisplay } from "@/lib/properties/propertyDisplay";

interface Property {
  id: string;
  title: string;
  owner: string;
  ownerId: string;
  ownerEmail: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  listingType: string;
  rentalType?: string;
  price: number;
  priceType?: string | null;
  propertyPrice?: number | null;
  status: string;
  bookings: number;
  bedrooms: number;
  bathrooms: number;
  sqft?: number;
  images?: Array<{ url: string; isPrimary: boolean }>;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

const getStatusConfig = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "active": return { color: "bg-green-100 text-green-800 border-green-200", label: "Active", dot: "●" };
    case "inactive": return { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Inactive", dot: "○" };
    case "pending_review":
    case "pending": return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending", dot: "⏳" };
    case "draft": return { color: "bg-gray-100 text-gray-500 border-gray-200", label: "Draft", dot: "✎" };
    case "sold": return { color: "bg-purple-100 text-purple-800 border-purple-200", label: "Sold", dot: "✓" };
    case "rented": return { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Rented", dot: "✓" };
    default: return { color: "bg-gray-100 text-gray-700 border-gray-200", label: status, dot: "?" };
  }
};

const getListingBadge = (listingType: string, rentalType?: string) => {
  const lt = (listingType || "").toUpperCase();
  const rt = (rentalType || "").toUpperCase();
  if (lt === "BUY") return { text: "For Sale", color: "bg-purple-100 text-purple-800 border-purple-200", Icon: TrendingUp };
  if (rt === "SHORT_TERM") return { text: "Short Stay", color: "bg-green-100 text-green-800 border-green-200", Icon: Hotel };
  if (rt === "LONG_TERM") return { text: "Long Term", color: "bg-blue-100 text-blue-800 border-blue-200", Icon: Calendar };
  return { text: "For Rent", color: "bg-gray-100 text-gray-700 border-gray-200", Icon: Home };
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n || 0);

const getPrimaryImage = (images?: Array<{ url: string; isPrimary: boolean }>) =>
  images?.find((i) => i.isPrimary)?.url || images?.[0]?.url || "";

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ status: "ALL", type: "ALL" });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalRevenue: 0, averageRating: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ pageSize: "100" });
      if (searchTerm) params.append("search", searchTerm);
      if (appliedFilters.status !== "ALL") params.append("status", appliedFilters.status);
      if (appliedFilters.type !== "ALL") params.append("propertyType", appliedFilters.type);

      const response = await api.get(`/admin/properties?${params}`);
      if (response.data?.success && response.data?.data?.items) {
        const items: Property[] = response.data.data.items.map((p: any) => {
          const full = p.fullData ?? p;
          return {
          id: p.id,
          title: p.title,
          owner: p.ownerName || "Unknown",
          ownerId: p.ownerId || "",
          ownerEmail: p.ownerEmail || "",
          address: p.address || full.address || "",
          city: p.city || full.city || "",
          state: p.state || full.state || "",
          zipCode: p.zipCode || full.zipCode || "",
          propertyType: p.propertyType || full.propertyType || "Property",
          listingType: p.listingType || full.listingType || "RENT",
          rentalType: p.rentalType ?? full.rentalType ?? null,
          price: p.price ?? full.price ?? 0,
          priceType: p.priceType ?? full.priceType ?? null,
          propertyPrice: p.propertyPrice ?? full.propertyPrice ?? null,
          status: (p.status || full.status || "DRAFT").toLowerCase(),
          bookings: p.bookingsCount || full.bookingsCount || 0,
          bedrooms: p.bedrooms ?? full.bedrooms ?? 0,
          bathrooms: p.bathrooms ?? full.bathrooms ?? 0,
          sqft: p.sqft ?? full.sqft ?? 0,
          images: p.images || full.images || [],
          rating: p.avgRating || 0,
          reviewCount: p.reviewsCount || 0,
          createdAt: p.createdAt || full.createdAt || "",
        };
        });
        setProperties(items);
        const active = items.filter((p) => p.status === "active").length;
        const inactive = items.filter((p) => p.status === "inactive").length;
        const avgRating = items.length ? items.reduce((s, p) => s + p.rating, 0) / items.length : 0;
        setStats({
          total: items.length,
          active,
          inactive,
          totalRevenue: items.reduce((s, p) => s + p.price * p.bookings, 0),
          averageRating: Math.round(avgRating * 10) / 10,
        });
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, appliedFilters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);
  useEffect(() => {
    const t = setTimeout(fetchProperties, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleStatusUpdate = async (propertyId: string, status: string, notes?: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch("/admin/properties", { propertyId, status, notes });
      await fetchProperties();
      setStatusModalOpen(false);
      setEditingProperty(null);
    } catch (error) {
      console.error("Error updating property status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/properties/${propertyId}`);
    } catch {
      // ignore – remove from UI anyway
    } finally {
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setDeleteConfirm(null);
      setDeleting(false);
    }
  };

  const removeFilter = (key: string) => setAppliedFilters((p) => ({ ...p, [key]: "ALL" }));

  const renderGridCard = (property: Property) => {
    const status = getStatusConfig(property.status);
    const listing = getListingBadge(property.listingType, property.rentalType);
    const ListingIcon = listing.Icon;
    const image = getPrimaryImage(property.images);
    const { amount, suffix } = getPropertyPriceDisplay(property);

    return (
      <div
        key={property.id}
        className="bg-white rounded-[5px] border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Building className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-3 left-3 space-y-1.5">
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
              {status.dot} {status.label}
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${listing.color} flex items-center gap-1`}>
              <ListingIcon className="w-3 h-3" />
              {listing.text}
            </div>
          </div>
          {/* Owner badge top-right */}
          <div className="absolute top-3 right-3 max-w-27.5 truncate bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {property.owner}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-gray-900 truncate flex-1 min-w-0">{property.title}</h4>
            <div className="flex items-center gap-1 pl-2 shrink-0">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{property.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({property.reviewCount})</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1 mb-3 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {property.city}{property.state ? `, ${property.state}` : ""}{property.zipCode ? ` ${property.zipCode}` : ""}
            </span>
          </div>

          {/* Beds/baths/sqft */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{property.bedrooms}</div>
            <div className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms}</div>
            {property.sqft ? (
              <div className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" />{property.sqft.toLocaleString()}</div>
            ) : null}
            <div className="ml-auto text-xs text-gray-400 capitalize">{(property.propertyType || "").toLowerCase()}</div>
          </div>

          {/* Price + bookings */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</span>
              <span className="text-sm text-gray-500 ml-1">{suffix}</span>
            </div>
            <div className="text-xs text-gray-500">{property.bookings} bookings</div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <Link href={`/admin/dashboard/properties/${property.id}`}>
              <Button variant="outline" size="sm" className="w-full rounded-[5px]">
                <Eye className="w-3.5 h-3.5 mr-1" /> View
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-[5px]"
              onClick={() => { setEditingProperty(property); setStatusModalOpen(true); }}
            >
              <Edit className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-[5px] text-red-600 hover:text-red-700 hover:border-red-300"
              onClick={() => setDeleteConfirm(property.id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderListRow = (property: Property) => {
    const status = getStatusConfig(property.status);
    const listing = getListingBadge(property.listingType, property.rentalType ?? undefined);
    const image = getPrimaryImage(property.images);
    const { amount, suffix } = getPropertyPriceDisplay(property);
    return (
      <tr key={property.id} className="border-b hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {image ? (
                <img src={image} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-6 h-6 text-gray-300 m-3" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 truncate max-w-48">{property.title}</div>
              <div className="text-xs text-gray-500 capitalize">{(property.propertyType || "").toLowerCase()}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-sm text-gray-600">
          <div>{property.city}{property.state ? `, ${property.state}` : ""}</div>
          <div className="text-xs text-gray-400">{property.zipCode}</div>
        </td>
        <td className="py-3 px-4 text-sm text-gray-600">{property.owner}</td>
        <td className="py-3 px-4 text-sm text-gray-600">{property.bedrooms}bd · {property.bathrooms}ba</td>
        <td className="py-3 px-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${listing.color}`}>{listing.text}</span>
        </td>
        <td className="py-3 px-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>{status.label}</span>
        </td>
        <td className="py-3 px-4 font-medium text-gray-900">
          {formatCurrency(amount)}
          <span className="text-xs text-gray-500 font-normal">{suffix}</span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            <Link href={`/admin/dashboard/properties/${property.id}`}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => { setEditingProperty(property); setStatusModalOpen(true); }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              onClick={() => setDeleteConfirm(property.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">Manage all properties on the platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/properties/add">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </Link>
            <Button variant="outline" className="rounded-[5px]">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: "Total Properties", value: stats.total, color: "text-gray-900" },
            { label: "Active", value: stats.active, color: "text-green-600" },
            { label: "Inactive", value: stats.inactive, color: "text-gray-700" },
            { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), color: "text-blue-600" },
            { label: "Avg Rating", value: stats.averageRating || "—", color: "text-yellow-600" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-5 rounded-[5px]">
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </Card>
          ))}
        </div>

        {/* Search & Filter */}
        <Card className="p-4 rounded-[5px]">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, location, or owner…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[5px]"
              />
            </div>
            <Button variant="outline" onClick={() => setFilterModalOpen(true)} className="rounded-[5px]">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-[5px] ${viewMode === "grid" ? "bg-gray-100" : ""}`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-[5px] ${viewMode === "list" ? "bg-gray-100" : ""}`}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>

          {(appliedFilters.status !== "ALL" || appliedFilters.type !== "ALL") && (
            <div className="flex flex-wrap gap-2">
              {appliedFilters.status !== "ALL" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {appliedFilters.status}{" "}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("status")} />
                </Badge>
              )}
              {appliedFilters.type !== "ALL" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {appliedFilters.type}{" "}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter("type")} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAppliedFilters({ status: "ALL", type: "ALL" })}
                className="text-red-600 text-sm h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card>

        {/* Properties */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader className="w-8 h-8 text-green-600 animate-spin" />
            <p className="text-gray-500 mt-3">Loading properties…</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white border rounded-[5px]">
            <Home className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800">No properties found</h3>
            <p className="text-gray-500 mt-1 mb-5">Add the first property to get started</p>
            <Link href="/admin/dashboard/properties/add">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]">
                <Plus className="w-4 h-4 mr-2" /> Add Property
              </Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map(renderGridCard)}
          </div>
        ) : (
          <div className="bg-white rounded-[5px] border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Property", "Location", "Owner", "Beds/Baths", "Listing Type", "Status", "Price", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{properties.map(renderListRow)}</tbody>
            </table>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm rounded-[5px] p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Property</h2>
              <p className="text-gray-600 mb-6">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} className="rounded-[5px]">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="rounded-[5px]">
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AdminPropertyFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={appliedFilters}
        onApplyFilters={(f) => setAppliedFilters(f)}
        onResetFilters={() => setAppliedFilters({ status: "ALL", type: "ALL" })}
      />

      <AdminPropertyStatusModal
        isOpen={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setEditingProperty(null); }}
        onSave={handleStatusUpdate}
        property={
          editingProperty
            ? {
                id: editingProperty.id,
                title: editingProperty.title,
                location: editingProperty.city,
                status: editingProperty.status.toUpperCase(),
                ownerName: editingProperty.owner,
              }
            : null
        }
        loading={updatingStatus}
      />
    </AdminDashboardLayout>
  );
}
