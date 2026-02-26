"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Eye, Trash2, Edit, MapPin } from "lucide-react";

interface Property {
  id: string;
  title: string;
  owner: string;
  location: string;
  type: string;
  price: number;
  status: "active" | "inactive" | "pending";
  bookings: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all");

  useEffect(() => {
    const mockProperties: Property[] = [
      {
        id: "1",
        title: "2BHK Apartment",
        owner: "Rajesh Kumar",
        location: "Bangalore",
        type: "Apartment",
        price: 25000,
        status: "active",
        bookings: 12,
      },
      {
        id: "2",
        title: "Villa with Garden",
        owner: "Suresh Sharma",
        location: "Mumbai",
        type: "Villa",
        price: 50000,
        status: "active",
        bookings: 8,
      },
      {
        id: "3",
        title: "Studio Flat",
        owner: "Rajesh Kumar",
        location: "Delhi",
        type: "Studio",
        price: 15000,
        status: "pending",
        bookings: 0,
      },
    ];
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
          <p className="text-gray-600 mt-1">Manage all properties listed on the platform</p>
        </div>

        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading properties...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </div>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        property.status === "active"
                          ? "bg-green-100 text-green-800"
                          : property.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 py-3 border-t border-b text-center">
                    <div>
                      <p className="text-gray-600 text-xs">Type</p>
                      <p className="text-sm font-semibold text-gray-900">{property.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Price/Night</p>
                      <p className="text-sm font-semibold text-gray-900">₹{property.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Bookings</p>
                      <p className="text-sm font-semibold text-gray-900">{property.bookings}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
