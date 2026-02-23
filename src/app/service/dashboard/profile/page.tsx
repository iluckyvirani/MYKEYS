// app/service/dashboard/profile/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import { Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  bio: string;
  specializations: string[];
  certifications: string[];
  joinDate: string;
  completedBookings: number;
  rating: number;
  reviews: number;
}

export default function ServiceProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    bio: "",
    specializations: [],
    certifications: [],
    joinDate: "",
    completedBookings: 0,
    rating: 0,
    reviews: 0,
  });

  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/service/profile");
        const data = res.data?.data;
        if (data) {
          setProfile(data);
          setTempProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/service/profile", {
        name: tempProfile.name,
        email: tempProfile.email,
        phone: tempProfile.phone,
        city: tempProfile.city,
        state: tempProfile.state,
        bio: tempProfile.bio,
      });
      const data = res.data?.data;
      if (data) {
        setProfile(data);
      } else {
        setProfile(tempProfile);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  if (loading) {
    return (
      <DashboardLayout defaultRole="service">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="service">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your professional profile and information.
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={handleEdit}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={tempProfile.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={tempProfile.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.state}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={tempProfile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Specializations
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((spec, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              Certifications
            </h2>
            <div className="space-y-2">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-900">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="space-y-4">
          {/* Rating Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
              Rating
            </h2>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {profile.rating}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              From {profile.reviews} reviews
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed Bookings</span>
                <span className="font-semibold text-gray-900">
                  {profile.completedBookings}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {new Date(profile.joinDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Documents
            </h2>
            <Button variant="outline" className="w-full">
              Upload Documents
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
