"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Settings, Bell, Shield, CreditCard, FileText, Upload, CheckCircle, Clock, AlertCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/dashboard/UserDashboard/ProfileForm";
import SecuritySettings from "@/components/dashboard/UserDashboard/SecuritySettings";
import NotificationSettings from "@/components/dashboard/UserDashboard/NotificationSettings";
import DocumentList from "@/components/dashboard/UserDashboard/DocumentList";
import DocumentUploadModal from "@/components/dashboard/UserDashboard/DocumentUploadModal";
import PaymentMethods from "@/components/dashboard/UserDashboard/PaymentMethods";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { MeResponse, UserDTO } from "@/types/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentListKey, setDocumentListKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.get<MeResponse>("/auth/me");
      if (response.data) {
        setUser(response.data.data);
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

  const handleDocumentUploadSuccess = () => {
    // Refresh the document list by incrementing the key
    setDocumentListKey(prev => prev + 1);
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError('');

      // Convert to base64
      const base64 = await fileToBase64(file);

      // Upload to Cloudinary
      const uploadResponse = await api.post('/upload', {
        image: base64,
        folder: 'mykeys/avatars'
      });

      const { url } = uploadResponse.data.data;

      // Update user profile with new avatar URL
      await api.patch('/auth/profile', { avatar: url });

      // Refresh user data
      await fetchUserData();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setAvatarError(
        err.response?.data?.message || 'Failed to upload avatar. Please try again.'
      );
    } finally {
      setUploadingAvatar(false);
    }
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
        {avatarError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm mb-4">
            {avatarError}
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
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
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
            >
              <Camera className="w-4 h-4 mr-2" />
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
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
            {/* <TabsTrigger value="notifications" className="flex items-center gap-2 py-5 rounded-[5px] cursor-pointer">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger> */}
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

            {/* <TabsContent value="notifications" className="m-0">
              <NotificationSettings />
            </TabsContent> */}

            <TabsContent value="payment" className="m-0">
              <PaymentMethods />
            </TabsContent>

            <TabsContent value="documents" className="m-0">
              <div className="space-y-6">
                {/* Verification Status */}
                <div className="border rounded-[5px] p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete verification for faster bookings
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        75% Complete
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-[5px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="font-medium">Email</div>
                      </div>
                      <div className="text-sm text-gray-600">Verified</div>
                    </div>
                    
                    <div className="p-4 border rounded-[5px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="font-medium">Phone</div>
                      </div>
                      <div className="text-sm text-gray-600">Verified</div>
                    </div>
                    
                    <div className="p-4 border rounded-[5px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="font-medium">ID Proof</div>
                      </div>
                      <div className="text-sm text-gray-600">Under Review</div>
                    </div>
                    
                    <div className="p-4 border rounded-[5px]">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="font-medium">Address Proof</div>
                      </div>
                      <div className="text-sm text-gray-600">Not Uploaded</div>
                    </div>
                  </div>
                </div>

                {/* Upload Actions */}
                <div className="border rounded-[5px] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">All Documents</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploaded documents for verification
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        className="rounded-[5px]"
                        onClick={() => setShowDocumentUpload(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                  
                  <DocumentList 
                    key={documentListKey}
                    onDocumentDeleted={handleDocumentUploadSuccess}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
        onSuccess={handleDocumentUploadSuccess}
        userRole="USER"
      />
    </DashboardLayout>
  );
}