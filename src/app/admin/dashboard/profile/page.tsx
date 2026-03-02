"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef, useEffect, useCallback } from "react";
import { User, Lock, Bell, Save, Camera, Shield } from "lucide-react";
import { api } from "@/lib/api";

interface AdminProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  joinedDate: string;
  avatar?: string;
  lastLoginDate?: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "Administration",
    role: "Admin",
    joinedDate: new Date().toISOString().split("T")[0],
    lastLoginDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/me");
      if (response.data?.success && response.data?.data) {
        const userData = response.data.data;
        // Parse name into first and last name
        const nameParts = (userData.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        // Get role from roles array
        const role = userData.roles?.[0] || "Admin";
        
        setProfile({
          firstName,
          lastName,
          email: userData.email || "",
          phone: userData.phone || "",
          department: "Administration",
          role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
          joinedDate: userData.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
          avatar: userData.profileImage || undefined,
          lastLoginDate: userData.lastLoginAt?.split("T")[0] || new Date().toISOString().split("T")[0],
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await api.put("/auth/profile", {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError("");
      // Simulate upload
      setTimeout(() => {
        setUploadingAvatar(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);
    } catch (err) {
      setAvatarError("Failed to upload avatar");
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AdminDashboardLayout>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your profile, security, and preferences</p>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-[5px] p-5 mb-5 border">
        {avatarError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm mb-4">
            {avatarError}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {`${profile.firstName} ${profile.lastName}`}
            </h3>
            <p className="text-gray-600">{profile.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm">
                <span className="font-medium">Member since:</span> {formatDate(profile.joinedDate)}
              </div>
              <div className="text-sm">
                <span className="font-medium">Last login:</span> {formatDate(profile.lastLoginDate || profile.joinedDate)}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="rounded-[5px]"
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploadingAvatar ? "Uploading..." : "Change Photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-[5px] border">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6 py-6">
            <TabsTrigger value="profile" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                    <p className="text-sm text-gray-600 mt-1">Update your personal details</p>
                  </div>
                  <Button
                    variant={isEditing ? "secondary" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-[5px]"
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
                      className={`rounded-[5px] ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <Input
                      value={profile.lastName}
                      onChange={(e) => handleProfileChange("lastName", e.target.value)}
                      disabled={!isEditing}
                      className={`rounded-[5px] ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      value={profile.email}
                      disabled={true}
                      className="bg-gray-50 rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => handleProfileChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className={`rounded-[5px] ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <Input
                      value={profile.department}
                      disabled={true}
                      className="bg-gray-50 rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <Input
                      value={profile.role}
                      disabled={true}
                      className="bg-gray-50 rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joined Date</label>
                    <Input
                      value={profile.joinedDate}
                      disabled={true}
                      className="bg-gray-50 rounded-[5px]"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="rounded-[5px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-green-600 hover:bg-green-700 rounded-[5px]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="m-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage your password and security</p>
                </div>

                <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="rounded-[5px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="rounded-[5px]"
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button className="bg-green-600 hover:bg-green-700 rounded-[5px]">
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Security Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Use a strong password with at least 8 characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Include uppercase, lowercase, numbers, and special characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Change your password regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                      <span>Never share your password with anyone</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="m-0">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage how you receive notifications</p>
                </div>

                <div className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                      <p className="text-xs text-gray-600 mt-1">Receive important updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, emailNotifications: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="text-sm font-medium text-gray-900">SMS Alerts</span>
                      <p className="text-xs text-gray-600 mt-1">Get alerts via SMS for urgent matters</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.smsAlerts}
                      onChange={(e) =>
                        setNotifications({ ...notifications, smsAlerts: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Push Notifications</span>
                      <p className="text-xs text-gray-600 mt-1">Receive browser push notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) =>
                        setNotifications({ ...notifications, pushNotifications: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Weekly Reports</span>
                      <p className="text-xs text-gray-600 mt-1">Get weekly summary reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReports}
                      onChange={(e) =>
                        setNotifications({ ...notifications, weeklyReports: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="bg-green-600 hover:bg-green-700 rounded-[5px]">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}
