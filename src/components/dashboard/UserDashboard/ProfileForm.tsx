"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { UserDTO, UpdateProfileRequest, MeResponse } from "@/types/auth";
import { Upload, User } from "lucide-react";

interface ProfileFormProps {
  onSuccess?: () => void;
}

export default function ProfileForm({ onSuccess }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    emergencyName: "",
    emergencyContact: "",
    avatar: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setInitialLoading(true);
      const response = await api.get<MeResponse>("/auth/me");

      if (response.data) {
        const user = response.data.data;
        setFormData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          birthDate: user.birthDate || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          zipCode: user.zipCode || "",
          country: user.country || "",
          emergencyName: user.emergencyName || "",
          emergencyContact: user.emergencyContact || "",
          avatar: user.avatar || "",
        });
        setAvatarPreview(user.avatar || null);
      }
    } catch (err: any) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');

      // Convert to base64
      const base64 = await fileToBase64(file);

      // Upload to Cloudinary
      const uploadResponse = await api.post('/upload', {
        image: base64,
        folder: 'mykeys/avatars'
      });

      const { url } = uploadResponse.data.data;

      // Update form data with new avatar URL
      setFormData((prev) => ({ ...prev, avatar: url }));
      setAvatarPreview(url);
      setSuccess('Avatar uploaded successfully. Click Save to update your profile.');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(
        err.response?.data?.message || 'Failed to upload avatar. Please try again.'
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch<UserDTO>("/auth/profile", formData);

      if (response.data) {
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(response.data));
        setSuccess("Profile updated successfully!");

        if (onSuccess) {
          onSuccess();
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile. Please try again.";
      setError(message);
      console.error("Update profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-[5px] text-sm">
          {success}
        </div>
      )}

      {/* Avatar Upload Section */}
      <div>
        {/* <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Profile Picture
        </h4> */}
        {/* <div className="flex items-center gap-4">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar || loading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div> */}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="6-9 digit Indian phone number"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="birthDate">Date of Birth</Label>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Address Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Emergency Contact
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="emergencyName">Contact Name</Label>
            <Input
              id="emergencyName"
              name="emergencyName"
              value={formData.emergencyName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="emergencyContact">Contact Phone</Label>
            <Input
              id="emergencyContact"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="6-9 digit Indian phone number"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t gap-3">
        <Button
          variant="outline"
          onClick={fetchUserProfile}
          disabled={loading}
          className="cursor-pointer"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="cursor-pointer bg-green-600 hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}