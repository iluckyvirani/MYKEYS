"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Eye, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PackageData {
  id: string;
  name: string;
  tier: string;
  price: number;
  duration: string;
  propertyLimit: number;
  featuredLimit: number;
  storageLimit: number;
  dailyLeadsLimit: number;
  isActive: boolean;
  subscribers: number;
  supportLevel: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([
    {
      id: "1",
      name: "Starter Pack",
      tier: "BASIC",
      price: 299,
      duration: "monthly",
      propertyLimit: 3,
      featuredLimit: 1,
      storageLimit: 10,
      dailyLeadsLimit: 5,
      isActive: true,
      subscribers: 245,
      supportLevel: "standard",
    },
    {
      id: "2",
      name: "Professional Pack",
      tier: "STANDARD",
      price: 699,
      duration: "monthly",
      propertyLimit: 10,
      featuredLimit: 5,
      storageLimit: 50,
      dailyLeadsLimit: 20,
      isActive: true,
      subscribers: 487,
      supportLevel: "priority",
    },
    {
      id: "3",
      name: "Enterprise Pack",
      tier: "PREMIUM",
      price: 1499,
      duration: "monthly",
      propertyLimit: 50,
      featuredLimit: 20,
      storageLimit: 200,
      dailyLeadsLimit: 100,
      isActive: true,
      subscribers: 156,
      supportLevel: "vip",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BASIC":
        return "bg-blue-100 text-blue-800";
      case "STANDARD":
        return "bg-purple-100 text-purple-800";
      case "PREMIUM":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      setPackages(packages.filter((pkg) => pkg.id !== id));
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-green-600" />
              Package Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage subscription packages for property owners</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Package
          </Button>
        </div>

        {/* Search */}
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search packages by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="border-2 hover:border-green-500 transition-all">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                      <Badge className={`mt-2 ${getTierColor(pkg.tier)}`}>{pkg.tier}</Badge>
                    </div>
                    {pkg.isActive && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                    {!pkg.isActive && (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-green-600">₹{pkg.price}</p>
                    <p className="text-gray-600 text-sm">per {pkg.duration}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Properties:</span>
                      <span className="font-semibold">{pkg.propertyLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Featured:</span>
                      <span className="font-semibold">{pkg.featuredLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-semibold">{pkg.storageLimit}GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Leads:</span>
                      <span className="font-semibold">{pkg.dailyLeadsLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Support:</span>
                      <span className="font-semibold capitalize">{pkg.supportLevel}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-600">Current Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{pkg.subscribers}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Package Details Modal Alternative */}
        {selectedPackage && (
          <Card className="border-2 border-green-600 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedPackage.name} Details</h2>
              <Button
                variant="ghost"
                onClick={() => setSelectedPackage(null)}
              >
                ✕
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-700 mb-4">Package Information</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-600">Tier:</span> <span className="font-semibold">{selectedPackage.tier}</span></p>
                  <p className="text-sm"><span className="text-gray-600">Price:</span> <span className="font-semibold">₹{selectedPackage.price}/{selectedPackage.duration}</span></p>
                  <p className="text-sm"><span className="text-gray-600">Status:</span> <span className="font-semibold">{selectedPackage.isActive ? "Active" : "Inactive"}</span></p>
                  <p className="text-sm"><span className="text-gray-600">Subscribers:</span> <span className="font-semibold">{selectedPackage.subscribers}</span></p>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-4">Limits & Features</h3>
                <div className="space-y-2">
                  <p className="text-sm"><span className="text-gray-600">Properties:</span> <span className="font-semibold">{selectedPackage.propertyLimit}</span></p>
                  <p className="text-sm"><span className="text-gray-600">Featured:</span> <span className="font-semibold">{selectedPackage.featuredLimit}</span></p>
                  <p className="text-sm"><span className="text-gray-600">Storage:</span> <span className="font-semibold">{selectedPackage.storageLimit}GB</span></p>
                  <p className="text-sm"><span className="text-gray-600">Daily Leads:</span> <span className="font-semibold">{selectedPackage.dailyLeadsLimit}</span></p>
                  <p className="text-sm"><span className="text-gray-600">Support Level:</span> <span className="font-semibold capitalize">{selectedPackage.supportLevel}</span></p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
