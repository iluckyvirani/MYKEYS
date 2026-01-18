"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Settings, Bell, Shield, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/dashboard/UserDashboard/ProfileForm";
import SecuritySettings from "@/components/dashboard/UserDashboard/SecuritySettings";
import NotificationSettings from "@/components/dashboard/UserDashboard/NotificationSettings";


export default function ProfilePage() {
  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your profile, security, and preferences
            </p>
          </div>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-xl p-6 mb-8 border">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">John Doe</h3>
            <p className="text-gray-600">john.doe@example.com</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-sm">
                <span className="font-medium">Member since:</span> Jan 2023
              </div>
              <div className="text-sm">
                <span className="font-medium">Verified:</span> Email, Phone
              </div>
              <div className="text-sm">
                <span className="font-medium">Bookings:</span> 12
              </div>
            </div>
          </div>
          <Button variant="outline">Change Photo</Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl border">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none px-6 pt-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="profile" className="m-0">
              <ProfileForm />
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