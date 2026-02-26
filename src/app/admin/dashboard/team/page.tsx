"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Eye, Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUBADMIN";
  permissions: string[];
  status: "active" | "inactive";
  joinDate: string;
  lastActive: string;
}

const allPermissions = [
  { id: "manage_users", label: "Manage Users", category: "Users" },
  { id: "manage_owners", label: "Manage Property Owners", category: "Users" },
  { id: "manage_properties", label: "Manage Properties", category: "Properties" },
  { id: "manage_listings", label: "Manage Listings", category: "Properties" },
  { id: "manage_bookings", label: "Manage Bookings", category: "Bookings" },
  { id: "manage_payments", label: "Manage Payments", category: "Payments" },
  { id: "manage_documents", label: "Manage Documents", category: "Documents" },
  { id: "manage_inquiries", label: "Manage Inquiries", category: "Inquiries" },
  { id: "manage_packages", label: "Manage Packages", category: "Packages" },
  { id: "manage_ads", label: "Manage Ads & Campaigns", category: "Marketing" },
  { id: "manage_services", label: "Manage Services", category: "Services" },
  { id: "manage_categories", label: "Manage Categories", category: "Settings" },
  { id: "manage_amenities", label: "Manage Amenities", category: "Settings" },
  { id: "view_analytics", label: "View Analytics", category: "Analytics" },
  { id: "view_reports", label: "View Reports", category: "Analytics" },
  { id: "manage_team", label: "Manage Team Members", category: "Admin" },
];

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      email: "rajesh@mykeys.com",
      role: "SUBADMIN",
      permissions: [
        "manage_users",
        "manage_properties",
        "manage_bookings",
        "manage_inquiries",
      ],
      status: "active",
      joinDate: "2026-01-15",
      lastActive: "2026-02-26 14:32:15",
    },
    {
      id: "2",
      name: "Priya Sharma",
      email: "priya@mykeys.com",
      role: "SUBADMIN",
      permissions: [
        "manage_payments",
        "manage_documents",
        "view_analytics",
        "view_reports",
      ],
      status: "active",
      joinDate: "2026-01-20",
      lastActive: "2026-02-26 13:15:22",
    },
    {
      id: "3",
      name: "Amit Patel",
      email: "amit@mykeys.com",
      role: "SUBADMIN",
      permissions: [
        "manage_packages",
        "manage_ads",
        "manage_services",
        "manage_categories",
      ],
      status: "active",
      joinDate: "2026-02-01",
      lastActive: "2026-02-25 16:45:33",
    },
    {
      id: "4",
      name: "Neha Singh",
      email: "neha@mykeys.com",
      role: "SUBADMIN",
      permissions: ["manage_properties", "manage_listings", "manage_amenities"],
      status: "inactive",
      joinDate: "2026-01-10",
      lastActive: "2026-02-20 10:12:44",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      setTeamMembers(teamMembers.filter((m) => m.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTeamMembers(
      teamMembers.map((m) =>
        m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m
      )
    );
  };

  const permissionsByCategory = allPermissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, typeof allPermissions>
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-green-600" />
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">Manage admin team members and assign permissions</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="border-2 border-green-600 p-6">
            <h2 className="text-2xl font-bold mb-4">Add New Team Member</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="member@mykeys.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600">
                  <option>SubAdmin</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setShowAddForm(false);
                  setNewMemberEmail("");
                }}
              >
                Add Member
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Team Members List */}
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="border-2 hover:border-green-500 transition-all p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  {member.status === "active" ? (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                  )}
                </div>

                {/* Role */}
                <div className="mb-4 pb-4 border-b">
                  <Badge className="bg-purple-100 text-purple-800 capitalize">
                    {member.role}
                  </Badge>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Permissions ({member.permissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {member.permissions.map((perm) => {
                      const permLabel = allPermissions.find((p) => p.id === perm)?.label;
                      return permLabel ? (
                        <Badge key={perm} className="bg-blue-100 text-blue-800 text-xs">
                          {permLabel}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Activity */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Joined:</span> {member.joinDate}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Last Active:</span> {member.lastActive}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => setSelectedMember(member)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => handleToggleStatus(member.id)}
                  >
                    {member.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Member Details & Permission Editor */}
        {selectedMember && (
          <Card className="border-2 border-green-600 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  {selectedMember.name} - Permissions
                </h2>
                <p className="text-gray-600 text-sm mt-1">{selectedMember.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedMember(null)}>
                ✕
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Member Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Member Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Role</p>
                    <Badge className="mt-1 bg-purple-100 text-purple-800 capitalize">
                      {selectedMember.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge className={`mt-1 ${selectedMember.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {selectedMember.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Joined Date</p>
                    <p className="font-semibold">{selectedMember.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Active</p>
                    <p className="font-semibold text-xs">{selectedMember.lastActive}</p>
                  </div>
                </div>
              </div>

              {/* Permissions List */}
              <div className="md:col-span-2">
                <h3 className="font-bold text-gray-700 mb-4">Current Permissions</h3>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-700 mb-2">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm) => (
                          <Badge
                            key={perm.id}
                            className={
                              selectedMember.permissions.includes(perm.id)
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-600"
                            }
                          >
                            <input
                              type="checkbox"
                              className="mr-1"
                              checked={selectedMember.permissions.includes(perm.id)}
                              readOnly
                            />
                            {perm.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                Save Permissions
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
