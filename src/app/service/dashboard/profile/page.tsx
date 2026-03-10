// app/service/dashboard/profile/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DocumentUploadModal from "@/components/dashboard/UserDashboard/DocumentUploadModal";
import { useState, useEffect } from "react";
import { Award, Star, FileText, CheckCircle, Clock, XCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/types/document";

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

interface UserDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
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
  
  // Documents state
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

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
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const res = await api.get("/documents");
      if (res.data?.data) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDocumentUploadSuccess = () => {
    fetchDocuments();
  };

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
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
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
          </div> */}

          {/* Certifications */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
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
          </div> */}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </Button>
            </div>
            
            {documentsLoading ? (
              <p className="text-sm text-gray-500">Loading documents...</p>
            ) : documents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">No documents uploaded yet</p>
                <p className="text-xs text-gray-400">Upload your service certificates to get verified</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                    </div>
                    <div className="ml-2 shrink-0">
                      {doc.status === "VERIFIED" && (
                        <span className="flex items-center text-green-600" title="Verified">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      )}
                      {doc.status === "PENDING" && (
                        <span className="flex items-center text-yellow-600" title="Pending Review">
                          <Clock className="w-4 h-4" />
                        </span>
                      )}
                      {doc.status === "REJECTED" && (
                        <span className="flex items-center text-red-600" title="Rejected">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {documents.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{documents.filter(d => d.status === "VERIFIED").length} verified</span>
                  <span>{documents.filter(d => d.status === "PENDING").length} pending</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleDocumentUploadSuccess}
        userRole="SERVICE"
      />
    </DashboardLayout>
  );
}
