"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search, Eye, Trash2, Edit, CheckCircle } from "lucide-react";

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  properties: number;
  revenue: number;
  status: "active" | "inactive" | "suspended";
  joinedDate: string;
}

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const mockOwners: Owner[] = [
      {
        id: "1",
        firstName: "Rajesh",
        lastName: "Kumar",
        email: "rajesh@example.com",
        phone: "+91-9876543210",
        properties: 5,
        revenue: 125000,
        status: "active",
        joinedDate: "2025-01-15",
      },
      {
        id: "2",
        firstName: "Suresh",
        lastName: "Sharma",
        email: "suresh@example.com",
        phone: "+91-9876543211",
        properties: 3,
        revenue: 75000,
        status: "active",
        joinedDate: "2025-01-20",
      },
      {
        id: "3",
        firstName: "Vikram",
        lastName: "Reddy",
        email: "vikram@example.com",
        phone: "+91-9876543214",
        properties: 2,
        revenue: 45000,
        status: "suspended",
        joinedDate: "2025-01-01",
      },
    ];
    setOwners(mockOwners);
    setLoading(false);
  }, []);

  const filteredOwners = owners.filter((owner) =>
    owner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Management</h1>
          <p className="text-gray-600 mt-1">Manage property owners and their listings</p>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading owners...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Owner Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Properties</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Revenue</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwners.map((owner) => (
                    <tr key={owner.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {owner.firstName} {owner.lastName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{owner.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{owner.properties}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ₹{(owner.revenue / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          owner.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {owner.status === "active" && <CheckCircle className="w-3 h-3" />}
                          {owner.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="w-4 h-4 text-red-600" />
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
