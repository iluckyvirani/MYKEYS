"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  services: number;
  status: "active" | "inactive";
  createdDate: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([
    { id: "1", name: "Plumbing", description: "All plumbing services", services: 12, status: "active", createdDate: "2025-01-10" },
    { id: "2", name: "Electrical", description: "Electrical repair and installation", services: 8, status: "active", createdDate: "2025-01-12" },
    { id: "3", name: "Cleaning", description: "Home and office cleaning", services: 15, status: "active", createdDate: "2025-01-15" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
            <p className="text-gray-600 mt-1">Manage service categories</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    {category.status}
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-600">{category.services} services</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
