"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { ServiceListingsTable } from "@/components/dashboard/admin/categories/ServiceListingsTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    icon?: string;
    status: "active" | "inactive";
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    serviceCount: number;
}

export default function CategoryDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = params.id as string;

    const [category, setCategory] = useState<ServiceCategory | null>(null);
    const [serviceListings, setServiceListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingListings, setLoadingListings] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCategoryDetails();
    }, [categoryId]);

    const fetchCategoryDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/categories/${categoryId}`);
            if (response.data?.success && response.data?.data) {
                const cat = response.data.data;
                setCategory({
                    id: cat.id,
                    name: cat.name,
                    description: cat.description || "",
                    icon: cat.icon,
                    status: cat.status as "active" | "inactive",
                    sortOrder: cat.sortOrder || 0,
                    createdAt: cat.createdAt,
                    updatedAt: cat.updatedAt,
                    serviceCount: cat.serviceCount || 0,
                });
                // Fetch service listings for this category
                fetchServiceListings(cat.name);
            }
        } catch (err) {
            console.error("Error fetching category details:", err);
            router.push("/admin/dashboard/categories");
        } finally {
            setLoading(false);
        }
    };

    const fetchServiceListings = async (categoryName: string) => {
        setLoadingListings(true);
        try {
            const response = await api.get(`/admin/services?category=${categoryName}&pageSize=100`);
            if (response.data?.success && response.data?.data) {
                const listings = (response.data.data.items || response.data.data).map((listing: any) => ({
                    id: listing.id,
                    title: listing.title,
                    description: listing.description || "",
                    category: listing.category,
                    basePrice: listing.basePrice || 0,
                    duration: listing.duration || 0,
                    isActive: listing.isActive ?? true,
                    providerName: listing.providerName || "Unknown Provider",
                    providerId: listing.serviceProviderId,
                    createdAt: listing.createdAt,
                }));
                setServiceListings(listings);
            }
        } catch (err) {
            console.error("Error fetching service listings:", err);
            setServiceListings([]);
        } finally {
            setLoadingListings(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/admin/categories/${categoryId}`);
            router.push("/admin/dashboard/categories");
        } catch (err) {
            console.error("Error deleting category:", err);
            alert("Failed to delete category");
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <AdminDashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            </AdminDashboardLayout>
        );
    }

    if (!category) {
        return (
            <AdminDashboardLayout>
                <div className="text-center py-12">
                    <p className="text-gray-600">Category not found</p>
                </div>
            </AdminDashboardLayout>
        );
    }

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/admin/dashboard/categories")}
                    className="rounded-[5px]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </Button>
                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-4">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                            <p className="text-gray-600 mt-1">Category Details & Service Listings</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/admin/dashboard/categories/${categoryId}/edit`)}
                            className="rounded-[5px]"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirm(true)}
                            className="text-red-600 hover:bg-red-50 rounded-[5px]"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Category Information */}
                <Card className="p-6 rounded-[5px]">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Category Information</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-[5px]">
                                <p className="text-sm text-gray-600 font-semibold">Name</p>
                                <p className="font-semibold mt-1 text-gray-900">{category.name}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-[5px]">
                                <p className="text-sm text-gray-600 font-semibold">Description</p>
                                <p className="font-semibold mt-1 text-gray-900">
                                    {category.description || "No description"}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-[5px]">
                                <p className="text-sm text-gray-600 font-semibold">Status</p>
                                <div className="mt-2">
                                    <Badge
                                        variant={category.status === "active" ? "default" : "secondary"}
                                        className={`${category.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {category.status === "active" ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-[5px]">
                                <p className="text-sm text-gray-600 font-semibold">Total Services</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {category.serviceCount}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-[5px]">
                                <p className="text-sm text-gray-600 font-semibold">Created Date</p>
                                <p className="font-semibold mt-1 text-gray-900">
                                    {new Date(category.createdAt).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-[5px]">
                                <p className="text-sm text-gray-600 font-semibold">Last Updated</p>
                                <p className="font-semibold mt-1 text-gray-900">
                                    {new Date(category.updatedAt).toLocaleDateString("en-GB", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Service Listings */}
                <Card className="p-6 rounded-[5px]">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Service Listings ({serviceListings.length})
                    </h2>
                    <ServiceListingsTable listings={serviceListings} loading={loadingListings} />
                </Card>

                {/* Delete Confirmation Dialog */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <Card className="w-full max-w-sm rounded-[5px]">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">
                                    Delete Category
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this category? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setDeleteConfirm(false)}
                                        disabled={deleting}
                                        className="rounded-[5px]"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="bg-red-600 hover:bg-red-700 rounded-[5px]"
                                    >
                                        {deleting ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </AdminDashboardLayout>
    );
}
