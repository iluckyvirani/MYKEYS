"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { User, Lock, Bell, Save } from "lucide-react";

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joinedDate: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>({
    firstName: "Admin",
    lastName: "User",
    email: "admin@mykeys.com",
    phone: "+91-9876543210",
    department: "Administration",
    role: "Super Admin",
    joinedDate: "2024-01-15",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // API call would go here
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Profile Information */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h2>
            <Button
              variant={isEditing ? "secondary" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={profile.firstName}
                onChange={(e) => handleProfileChange("firstName", e.target.value)}
                disabled={!isEditing}
                className={isEditing ? "" : "bg-gray-50"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={profile.lastName}
                onChange={(e) => handleProfileChange("lastName", e.target.value)}
                disabled={!isEditing}
                className={isEditing ? "" : "bg-gray-50"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                value={profile.email}
                disabled={true}
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <Input
                value={profile.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
                disabled={!isEditing}
                className={isEditing ? "" : "bg-gray-50"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                value={profile.department}
                disabled={true}
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <Input
                value={profile.role}
                disabled={true}
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
              <Input
                value={profile.joinedDate}
                disabled={true}
                className="bg-gray-50"
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5" />
            Security Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button className="bg-green-600 hover:bg-green-700">Update Password</Button>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {[
              { label: "Email Notifications", enabled: true },
              { label: "SMS Alerts", enabled: true },
              { label: "Push Notifications", enabled: false },
              { label: "Weekly Reports", enabled: true },
            ].map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-700">{notification.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={notification.enabled}
                  className="w-4 h-4 rounded border-gray-300"
                />
              </div>
            ))}
            <div className="flex justify-end pt-4">
              <Button className="bg-green-600 hover:bg-green-700">Save Preferences</Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
