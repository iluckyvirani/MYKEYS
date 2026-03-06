// app/service/dashboard/services/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, Star, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/lib/api";
import AddServiceDialog from "@/components/services/AddServiceDialog";
import { useToast } from "@/hooks/use-toast";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  rating: number;
  reviews: number;
  status: "active" | "inactive";
  image: string;
}

export default function ServiceManagementPage() {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/service/services");
      const data = res.data?.data;
      if (data) {
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.delete(`/service/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
        variant: "default",
      });
    } catch (err: any) {
      console.error("Failed to delete service:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-600 mt-2">
            Manage your services, pricing, and availability.
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-6">
              Add your first service to start receiving bookings from customers
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Service
            </Button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Service Image */}
            <div className="h-40 bg-gray-200 overflow-hidden">
              <img
                src={service.image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400"}
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400";
                }}
              />
            </div>

            {/* Service Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {service.name}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(
                    service.status
                  )}`}
                >
                  {service.status.charAt(0).toUpperCase() +
                    service.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {service.description || "No description provided"}
              </p>

              {/* Rating and Price */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {service.rating || 0}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({service.reviews || 0})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <DollarSign className="w-4 h-4" />
                  {service.basePrice}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/service/dashboard/services/${service.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </Link>
                <Link href={`/service/dashboard/services/${service.id}/edit`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchServices}
      />
    </DashboardLayout>
  );
}
