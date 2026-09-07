// app/service/dashboard/profile/page.tsx
"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DocumentUploadModal from "@/components/dashboard/UserDashboard/DocumentUploadModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  FileText,
  Camera,
  Upload,
  X,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Zap,
  MapPin,
  Landmark,
} from "lucide-react";
import BankDetailsForm from "@/components/dashboard/BankDetailsForm";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/types/document";

// Types
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  bio: string;
  specializations: string[];
  certifications: string[];
  serviceAreas: string[];
  instantBookingEnabled: boolean;
  instantBookingPrice: number | null;
  joinDate: string;
  completedBookings: number;
  rating: number;
  reviews: number;
  avatar: string | null;
  category: string;
  categories: string[];
  documentVerified: boolean;
}

interface AvailableCategory {
  id: string;
  name: string;
  icon?: string;
}

interface UserDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
}

const EMPTY_PROFILE: ProfileData = {
  name: "", email: "", phone: "", city: "", state: "", bio: "",
  specializations: [], certifications: [], serviceAreas: [],
  instantBookingEnabled: false, instantBookingPrice: null,
  joinDate: "", completedBookings: 0, rating: 0, reviews: 0,
  avatar: null, category: "", categories: [], documentVerified: false,
};

// Tag input helper
function TagInput({ label, tags, onChange, placeholder, disabled }: {
  label: string; tags: string[]; onChange: (tags: string[]) => void;
  placeholder?: string; disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };
  const removeTag = (idx: number) => onChange(tags.filter((_, i) => i !== idx));
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-1 mb-2 min-h-9">
        {tags.map((tag, i) => (
          <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
            {tag}
            {!disabled && (
              <button type="button" onClick={() => removeTag(i)} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {tags.length === 0 && <span className="text-sm text-gray-400 self-center">None added yet</span>}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder={placeholder ?? "Type and press Enter to add"} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}

// Main Page
export default function ServiceProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [form, setForm] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<AvailableCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProfile(); fetchDocuments(); fetchCategories(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/service/profile");
      const data: ProfileData = res.data?.data;
      if (data) { setProfile(data); setForm(data); }
    } catch (err) { setError("Failed to load profile."); }
    finally { setLoading(false); }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const res = await api.get("/documents");
      if (res.data?.data) setDocuments(res.data.data);
    } catch (err) { /* silent */ }
    finally { setDocumentsLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/services/categories");
      if (res.data?.data) setAvailableCategories(res.data.data);
    } catch { /* silent */ }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarError("Image must be under 5 MB"); return; }
    try {
      setUploadingAvatar(true); setAvatarError("");
      const base64 = await fileToBase64(file);
      const uploadRes = await api.post("/upload", { image: base64, folder: "mykeys/avatars" });
      const url = uploadRes.data.data.url;
      await api.patch("/auth/profile", { avatar: url });
      setProfile((p) => ({ ...p, avatar: url }));
      setForm((p) => ({ ...p, avatar: url }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) { setAvatarError(err.response?.data?.message || "Failed to upload avatar"); }
    finally { setUploadingAvatar(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await api.put("/service/profile", {
        name: form.name, email: form.email, phone: form.phone,
        city: form.city, state: form.state, bio: form.bio,
        category: form.categories[0] ?? form.category,
        categories: form.categories.length > 0 ? form.categories : [form.category],
        specializations: form.specializations, certifications: form.certifications,
        serviceAreas: form.serviceAreas,
        instantBookingEnabled: form.instantBookingEnabled,
      });
      const updated: ProfileData = res.data?.data;
      if (updated) { setProfile(updated); setForm(updated); }
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) { setError(err.response?.data?.message || "Failed to save profile."); }
    finally { setSaving(false); }
  };

  const field = (key: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const AlertSuccess = () => success ? (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-[5px] text-sm">{success}</div>
  ) : null;
  const AlertError = () => error ? (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm">{error}</div>
  ) : null;

  if (loading) {
    return (
      <DashboardLayout defaultRole="service">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout defaultRole="service">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your professional profile, service areas, and documents.</p>
      </div>

      {/* Profile overview */}
      <div className="bg-white rounded-[5px] p-5 mb-5 border">
        {avatarError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[5px] text-sm mb-4">{avatarError}</div>
        )}
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{profile.name || "—"}</h3>
            <p className="text-gray-600 text-sm">{profile.email}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {profile.rating.toFixed(1)} ({profile.reviews} reviews)
              </span>
              <span>{profile.completedBookings} jobs done</span>
              {profile.documentVerified && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
          </div>
          <div>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
              <Camera className="w-4 h-4 mr-2" />
              {uploadingAvatar ? "Uploading…" : "Change Photo"}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full bg-white border rounded-[5px] p-1 mb-5 flex gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 py-2.5 rounded-[5px] cursor-pointer flex-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-2 py-2.5 rounded-[5px] cursor-pointer flex-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <Briefcase className="w-4 h-4" /> Professional Info
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2 py-2.5 rounded-[5px] cursor-pointer flex-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <Landmark className="w-4 h-4" /> Bank Details
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 py-2.5 rounded-[5px] cursor-pointer flex-1 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
            <FileText className="w-4 h-4" /> Documents
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="m-0">
          <div className="bg-white rounded-[5px] border p-6 space-y-6">
            <AlertError /><AlertSuccess />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={field("name")} placeholder="Your full name" disabled={saving} />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={form.email} onChange={field("email")} placeholder="your@email.com" disabled={saving} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={field("phone")} placeholder="+44 7xxx xxxxxx" disabled={saving} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={field("city")} placeholder="e.g., London" disabled={saving} />
                </div>
                <div>
                  <Label htmlFor="state">County / State</Label>
                  <Input id="state" value={form.state} onChange={field("state")} placeholder="e.g., Greater London" disabled={saving} />
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">About You</h4>
              <Label htmlFor="bio">Professional Bio</Label>
              <textarea id="bio" value={form.bio} onChange={field("bio")} rows={4}
                placeholder="Describe your experience, skills and what makes you stand out…"
                disabled={saving}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-none disabled:opacity-60" />
            </div>
            <div className="flex gap-3 pt-2 border-t">
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setForm(profile)} disabled={saving}>Discard</Button>
            </div>
          </div>
        </TabsContent>

        {/* Professional Info Tab */}
        <TabsContent value="professional" className="m-0">
          <div className="bg-white rounded-[5px] border p-6 space-y-6">
            <AlertError /><AlertSuccess />
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Service Categories</h4>
              <p className="text-sm text-gray-500 mb-3">Select all categories you specialise in. The first selected becomes your primary category.</p>
              {availableCategories.length === 0 ? (
                <p className="text-sm text-gray-400">Loading categories…</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableCategories.map((cat) => {
                    const isSelected = form.categories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            categories: isSelected
                              ? p.categories.filter((id) => id !== cat.id)
                              : [...p.categories, cat.id],
                          }))
                        }
                        className={`relative flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-green-400 bg-white"
                        } disabled:opacity-60`}
                      >
                        {cat.icon && <span className="text-2xl shrink-0">{cat.icon}</span>}
                        <span className={`text-sm font-medium ${isSelected ? "text-green-800" : "text-gray-700"}`}>{cat.name}</span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-green-600 absolute top-2 right-2 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {form.categories.length === 0 && (
                <p className="text-xs text-red-500 mt-2">Please select at least one category.</p>
              )}
            </div>
            <div>
              <TagInput label="Your specializations" tags={form.specializations}
                onChange={(tags) => setForm((p) => ({ ...p, specializations: tags }))}
                placeholder="e.g., Boiler repair, Leak fixing…" disabled={saving} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h4>
              <TagInput label="Your certifications" tags={form.certifications}
                onChange={(tags) => setForm((p) => ({ ...p, certifications: tags }))}
                placeholder="e.g., Gas Safe, NICEIC…" disabled={saving} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" /> Service Areas
              </h4>
              <p className="text-sm text-gray-500 mb-3">Add cities, postcodes or boroughs where you offer services.</p>
              <TagInput label="Areas you cover" tags={form.serviceAreas}
                onChange={(tags) => setForm((p) => ({ ...p, serviceAreas: tags }))}
                placeholder="e.g., London, SW1, Manchester…" disabled={saving} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" /> Instant Booking
              </h4>
              <div className={`rounded-[5px] border p-4 transition-colors ${form.instantBookingEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={form.instantBookingEnabled}
                    onChange={(e) => setForm((p) => ({ ...p, instantBookingEnabled: e.target.checked }))}
                    disabled={saving} className="w-4 h-4 accent-green-600" />
                  <div>
                    <span className="font-medium text-gray-900">Enable instant booking</span>
                    <p className="text-sm text-gray-500">Clients can book you immediately without waiting for your approval. Prices are set by MYKEYS admin.</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t">
              <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setForm(profile)} disabled={saving}>Discard</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bank" className="m-0">
          <div className="bg-white rounded-[5px] border p-6">
            <BankDetailsForm />
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="m-0">
          <div className="bg-white rounded-[5px] border p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">My Documents</h4>
                <p className="text-sm text-gray-500 mt-0.5">Upload certificates and documents to get verified.</p>
              </div>
              <Button onClick={() => setUploadModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
                <Upload className="w-4 h-4 mr-2" /> Upload Document
              </Button>
            </div>
            {documentsLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-green-600" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-[5px] border border-dashed border-gray-300">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload your Service Certificate and Aadhar Card to get verified.</p>
                <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={() => setUploadModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" /> Upload Now
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-4 mb-5 text-sm">
                  <span className="flex items-center gap-1 text-green-600 font-medium"><CheckCircle className="w-4 h-4" />{documents.filter((d) => d.status === "VERIFIED").length} verified</span>
                  <span className="flex items-center gap-1 text-yellow-600 font-medium"><Clock className="w-4 h-4" />{documents.filter((d) => d.status === "PENDING").length} pending</span>
                  <span className="flex items-center gap-1 text-red-500 font-medium"><XCircle className="w-4 h-4" />{documents.filter((d) => d.status === "REJECTED").length} rejected</span>
                </div>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-[5px] border border-gray-100">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}</p>
                          <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="ml-4 shrink-0">
                        {doc.status === "VERIFIED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Verified</span>}
                        {doc.status === "PENDING" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Under Review</span>}
                        {doc.status === "REJECTED" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Rejected</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => { setUploadModalOpen(false); fetchDocuments(); }}
        userRole="SERVICE"
      />
    </DashboardLayout>
  );
}