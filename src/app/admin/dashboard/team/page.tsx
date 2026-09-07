"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Search, Eye, Trash2, Users, Lock, Download, Shield, TrendingUp } from "lucide-react";

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
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

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

  const handlePermissionsChange = (memberId: string, permissionId: string) => {
    setTeamMembers(
      teamMembers.map((m) => {
        if (m.id === memberId) {
          const newPermissions = m.permissions.includes(permissionId)
            ? m.permissions.filter((p) => p !== permissionId)
            : [...m.permissions, permissionId];
          
          const updatedMember = { ...m, permissions: newPermissions };
          if (selectedMember?.id === memberId) {
            setSelectedMember(updatedMember);
          }
          return updatedMember;
        }
        return m;
      })
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

  // Calculate stats
  const activeMembers = teamMembers.filter((m) => m.status === "active").length;
  const subAdmins = teamMembers.filter((m) => m.role === "SUBADMIN").length;
  const totalAdmins = teamMembers.filter((m) => m.role === "ADMIN").length;

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage admin team members and assign permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{teamMembers.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">{activeMembers} active</span>
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Currently active
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{subAdmins}</div>
                <div className="text-sm text-gray-600">SubAdmins</div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              SubAdmin role
            </div>
          </div>

          <div className="bg-white rounded-[5px] border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{totalAdmins}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Admin role
            </div>
          </div>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="border-2 border-green-600 p-6 rounded-[5px]">
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-[5px]"
                onClick={() => {
                  setShowAddForm(false);
                  setNewMemberEmail("");
                }}
              >
                Add Member
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-[5px]"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Team Members Table */}
        <Card className="p-6 rounded-[5px]">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search team members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[5px]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Team Member</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Permissions</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{member.email}</td>
                    <td className="py-4 px-4 text-sm">
                      <Badge
                        className={member.role === "ADMIN" ? "bg-orange-100 text-orange-800" : "bg-purple-100 text-purple-800"}
                      >
                        {member.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {member.permissions.length} permissions
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <Badge className={member.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedMember(member);
                            setShowPermissionsModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleToggleStatus(member.id)}
                        >
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Permissions Modal */}
        {showPermissionsModal && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-96 overflow-hidden flex flex-col rounded-[5px]">
              {/* Modal Header */}
              <div className="border-b p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    {selectedMember.name} - Assign Permissions
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedMember.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedMember(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4 border">
                    <h3 className="font-bold text-gray-900 mb-4 text-sm">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white transition">
                          <input
                            type="checkbox"
                            checked={selectedMember.permissions.includes(perm.id)}
                            onChange={() => handlePermissionsChange(selectedMember.id, perm.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-6 flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-[5px]"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedMember(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-[5px]"
                  onClick={() => {
                    setShowPermissionsModal(false);
                    alert("Permissions updated successfully!");
                  }}
                >
                  Save Permissions
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
