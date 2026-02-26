"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Eye, Trash2, Edit } from "lucide-react";

interface ServiceProvider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  serviceType: string;
  bookings: number;
  rating: number;
  status: "active" | "inactive";
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const mockProviders: ServiceProvider[] = [
      {
        id: "1",
        firstName: "Amit",
        lastName: "Patel",
        email: "amit@example.com",
        serviceType: "Plumbing",
        bookings: 45,
        rating: 4.8,
        status: "active",
      },
      {
        id: "2",
        firstName: "Pradeep",
        lastName: "Singh",
        email: "pradeep@example.com",
        serviceType: "Electrical",
        bookings: 32,
        rating: 4.6,
        status: "active",
      },
      {
        id: "3",
        firstName: "Rohan",
        lastName: "Kumar",
        email: "rohan@example.com",
        serviceType: "Cleaning",
        bookings: 28,
        rating: 4.7,
        status: "active",
      },
    ];
    setProviders(mockProviders);
    setLoading(false);
  }, []);

  const filteredProviders = providers.filter((provider) =>
    provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-1">Manage service providers and their performance</p>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading providers...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Service Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Bookings</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {provider.firstName} {provider.lastName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{provider.serviceType}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{provider.bookings}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-yellow-600">★ {provider.rating}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {provider.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
