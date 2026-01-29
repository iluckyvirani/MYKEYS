"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Settings, Bell, Shield, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/dashboard/UserDashboard/ProfileForm";
import SecuritySettings from "@/components/dashboard/UserDashboard/SecuritySettings";
import NotificationSettings from "@/components/dashboard/UserDashboard/NotificationSettings";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { UserDTO } from "@/types/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get<UserDTO>("/auth/me");
      if (response.data) {
        setUser(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    fetchUserData();
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <DashboardLayout defaultRole="user">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your profile, security, and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-[5px] p-5 mb-5 border">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm">
                <span className="font-medium">Member since:</span> {formatDate(user?.createdAt?.toString())}
              </div>
              <div className="text-sm">
                <span className="font-medium">Last login:</span> {user?.lastLoginAt ? formatDate(user.lastLoginAt?.toString()) : "Never"}
              </div>
            </div>
          </div>
          <Button variant="outline">Change Photo</Button>
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
            <TabsTrigger value="payment" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
              <CreditCard className="w-4 h-4" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="profile" className="m-0">
              <ProfileForm onSuccess={handleProfileUpdate} />
            </TabsContent>

            <TabsContent value="security" className="m-0">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="notifications" className="m-0">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="payment" className="m-0">
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Methods</h3>
                <p className="text-gray-500">Manage your saved payment methods here.</p>
                <Button className="mt-4">Add Payment Method</Button>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="m-0">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-500">Upload and manage your verification documents.</p>
                <Button className="mt-4">Upload Documents</Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}