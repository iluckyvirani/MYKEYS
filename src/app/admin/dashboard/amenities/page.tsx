"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  icon: string;
  propertiesUsing: number;
  status: "active" | "inactive";
}

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([
    { id: "1", name: "WiFi", icon: "📶", propertiesUsing: 245, status: "active" },
    { id: "2", name: "Swimming Pool", icon: "🏊", propertiesUsing: 87, status: "active" },
    { id: "3", name: "Air Conditioning", icon: "❄️", propertiesUsing: 312, status: "active" },
    { id: "4", name: "Kitchen", icon: "🍳", propertiesUsing: 420, status: "active" },
    { id: "5", name: "Gym", icon: "💪", propertiesUsing: 156, status: "active" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAmenities = amenities.filter((amenity) =>
    amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Amenities Management</h1>
            <p className="text-gray-600 mt-1">Manage property amenities</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Amenity
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search amenities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAmenities.map((amenity) => (
              <div key={amenity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{amenity.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{amenity.name}</h3>
                      <p className="text-sm text-gray-600">{amenity.propertiesUsing} properties</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Active
                  </span>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
