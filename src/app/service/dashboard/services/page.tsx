// app/service/dashboard/services/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Star, PoundSterling, Wrench, Loader2, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import AddServiceDialog from "@/components/services/AddServiceDialog";
import ServiceReviewsModal from "@/components/services/ServiceReviewsModal";
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
  const [providerName, setProviderName] = useState("");
  const [providerAvatar, setProviderAvatar] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

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
      toast({ title: "Error", description: err.response?.data?.message || "Failed to fetch services", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // Pull provider name/avatar from localStorage for the card
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const d = u?.data ?? u;
        const first = d?.firstName || "";
        const last = d?.lastName || "";
        setProviderName(`${first} ${last}`.trim() || "You");
        setProviderAvatar(d?.avatar || "");
      }
    } catch {}
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/service/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      toast({ title: "Deleted", description: "Service removed successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete service", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage what you offer, set your prices, and control availability.
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      ) : services.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No services added yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Add the services you offer so clients can find and book you.
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Service
          </Button>
        </div>
      ) : (
        /* Service Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">

              {/* Cover image */}
              <div className="relative h-44 bg-gray-100 shrink-0">
                <img
                  src={service.image && !service.image.includes("/api/placeholder")
                    ? service.image
                    : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80"}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80";
                  }}
                />
                {/* Status badge */}
                <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  service.status === "active"
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }`}>
                  {service.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Provider badge â€” shows who provides this service */}
              <div className="px-4 pt-3 flex items-center gap-2">
                {providerAvatar ? (
                  <img src={providerAvatar} alt={providerName} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                    {providerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-gray-500 font-medium">{providerName}</span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-gray-900 mb-1 leading-tight">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{service.description}</p>
                )}

                {/* Rating + Price */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-800">{(service.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-400">({service.reviews || 0})</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-green-600 font-bold text-base">
                    <PoundSterling className="w-4 h-4" />
                    {Number(service.basePrice).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5"
                    onClick={() => { setEditingService(service); setShowAddDialog(true); }}>
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline"
                    className="gap-1.5 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                    onClick={() => setShowReviewsModal(true)}
                    disabled={!service.reviews}>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {service.reviews || 0}
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDeleteConfirm(service)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <AddServiceDialog
        open={showAddDialog}
        onOpenChange={(open) => { setShowAddDialog(open); if (!open) setEditingService(null); }}
        onSuccess={fetchServices}
        serviceToEdit={editingService}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Delete Service</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-gray-600 text-sm mb-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-gray-900">{deleteConfirm?.name}</span>?
          </p>
          <p className="text-gray-500 text-xs">This action cannot be undone.</p>
          <DialogFooter className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reviews Modal — shows all provider reviews */}
      <ServiceReviewsModal
        open={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        title="Customer Reviews"
        fetchUrl="/service/reviews"
      />
    </DashboardLayout>
  );
}

