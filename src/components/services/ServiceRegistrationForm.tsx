"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileUp, AlertCircle, Upload, X, Loader2 } from "lucide-react";
import { DocumentType, DOCUMENT_TYPE_LABELS, SERVICE_REQUIRED_DOCUMENTS, SERVICE_OPTIONAL_DOCUMENTS } from "@/types/document";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

interface UploadedDocument {
  id: string;
  documentType: DocumentType;
  fileName: string;
  status: "uploading" | "uploaded" | "error";
  errorMessage?: string;
}

interface ServiceRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: any) => void;
  isSubmitting?: boolean;
}

export default function ServiceRegistrationForm({ open, onOpenChange, onSubmit, isSubmitting = false }: ServiceRegistrationFormProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    serviceAreas: [] as string[],
    bio: "",
  });
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | "">("")
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available service document types
  const serviceDocumentTypes: DocumentType[] = [
    ...SERVICE_REQUIRED_DOCUMENTS,
    ...SERVICE_OPTIONAL_DOCUMENTS,
  ];

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
    
    if (open && !token) {
      // If dialog opens and user not logged in, redirect to login
      onOpenChange(false);
      router.push("/login?redirect=/");
    }
  }, [open, router, onOpenChange]);

  // Fetch categories from API (public endpoint - no auth required)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get("/services/categories");
        if (response.data?.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      fetchCategories();
    }
  }, [open]);

  const serviceAreas = [
    "Downtown",
    "Suburbs",
    "North District",
    "East Side",
    "West Side",
    "Central",
    "South End",
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter((a) => a !== area)
        : [...prev.serviceAreas, area],
    }));
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a JPG, PNG, WebP, or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    // Guard: no type selected (shouldn't reach here via UI but keep as safety)
    if (!selectedDocType) {
      setUploadError("Please select a document type before uploading.");
      return;
    }

    // Check if this document type is already uploaded
    if (uploadedDocuments.some(doc => doc.documentType === selectedDocType && doc.status === "uploaded")) {
      setUploadError(`${DOCUMENT_TYPE_LABELS[selectedDocType]} is already uploaded`);
      return;
    }

    setUploadError("");
    setIsUploading(true);

    // Add uploading state
    const tempId = `temp-${Date.now()}`;
    setUploadedDocuments(prev => [...prev, {
      id: tempId,
      documentType: selectedDocType,
      fileName: file.name,
      status: "uploading",
    }]);

    try {
      // Step 1: Convert to base64 and upload to Cloudinary
      const base64 = await fileToBase64(file);
      const uploadResponse = await api.post("/upload", {
        image: base64,
        folder: "mykeys/service-documents",
      });

      const documentUrl = uploadResponse.data.data.url;

      // Step 2: Create document record
      const response = await api.post("/documents", {
        documentType: selectedDocType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentUrl,
      });

      // Update status to uploaded
      setUploadedDocuments(prev => prev.map(doc => 
        doc.id === tempId 
          ? { ...doc, id: response.data.data?.id || tempId, status: "uploaded" as const }
          : doc
      ));

    } catch (error: any) {
      console.error("Document upload error:", error);
      // Update status to error
      setUploadedDocuments(prev => prev.map(doc => 
        doc.id === tempId 
          ? { ...doc, status: "error" as const, errorMessage: error.response?.data?.message || "Upload failed" }
          : doc
      ));
      setUploadError(error.response?.data?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    // Reset form when closing
    setStep(1);
    setSelectedCategories([]);
    setFormData({
      serviceAreas: [] as string[],
      bio: "",
    });
    setUploadedDocuments([]);
    setSelectedDocType("");
    setUploadError("");
    onOpenChange(false);
  };

  const canProceed = () => {
    if (step === 1) return selectedCategories.length > 0;
    if (step === 2) return formData.serviceAreas.length > 0;
    if (step === 3) return true;
    if (step === 4) return SERVICE_REQUIRED_DOCUMENTS.every((docType) =>
      uploadedDocuments.some((d) => d.documentType === docType && d.status === "uploaded")
    );
    return false;
  };

  const handleSubmit = () => {
    const data = {
      ...formData,
      categoryIds: selectedCategories,
      // keep single-category compat for APIs that still expect one
      categoryId: selectedCategories[0] ?? null,
    };
    onSubmit?.(data);
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl min-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-900 text-center">
            Become a Service Professional
          </DialogTitle>
          <p className="text-gray-600 text-center">
            Join our platform and reach thousands of customers looking for your services
          </p>
        </DialogHeader>

        <div className="mt-6">

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-start">
              {[
                { num: 1, label: "Category" },
                { num: 2, label: "Areas" },
                { num: 3, label: "Details" },
                { num: 4, label: "Documents" },
              ].map((item, index) => (
                <div key={item.num} className={index < 3 ? "flex-1 flex items-start" : "flex"}>
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        step > item.num
                          ? "bg-green-600 text-white shadow-md"
                          : step === item.num
                            ? "bg-green-600 text-white ring-4 ring-green-100 shadow-md"
                            : "bg-gray-100 text-gray-500 border-2 border-gray-200"
                      }`}
                      animate={{ scale: step === item.num ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {step > item.num ? <CheckCircle className="w-5 h-5" /> : item.num}
                    </motion.div>
                    <p className={`text-xs font-semibold mt-2 whitespace-nowrap ${
                      step >= item.num ? "text-green-700" : "text-gray-400"
                    }`}>
                      {item.label}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-5 transition-colors duration-300 ${
                      step > item.num ? "bg-green-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-50 rounded-xl p-6 mb-6"
          >
          {/* Step 1: Category Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service Categories</h2>
                <p className="text-gray-600">
                  Choose all categories you specialise in — you can select multiple.{" "}
                  {selectedCategories.length > 0 && (
                    <span className="font-semibold text-green-700">{selectedCategories.length} selected</span>
                  )}
                </p>
              </div>

              {loadingCategories ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No categories available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    return (
                      <motion.div
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-green-600 bg-green-50 shadow-md"
                            : "border-gray-200 hover:border-green-400"
                        }`}
                        whileHover={{ scale: 1.03 }}
                      >
                        {/* Checkmark badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="text-center">
                          {category.icon && (
                            <div className="text-4xl mb-2">{category.icon}</div>
                          )}
                          <h3 className="font-bold text-gray-900 mt-2">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service Areas */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Areas</h2>
                <p className="text-gray-600">Select all areas where you can provide services</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceAreas.map((area) => (
                  <label
                    key={area}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.serviceAreas.includes(area)
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.serviceAreas.includes(area)}
                      onChange={() => handleAreaToggle(area)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Service Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">About You</h2>
                <p className="text-gray-600">
                  Tell customers about your experience. Pricing is set by MYKEYS for each catalog service — after registration you will mark which services you provide.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">About Your Service (Optional)</Label>
                  <textarea
                    id="bio"
                    placeholder="Tell customers about your service expertise and experience..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none h-24"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Document Verification */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h2>
                <p className="text-gray-600">Upload documents for verification to build trust with customers</p>
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Document Type Selector */}
              <div>
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Step 1 — Choose Document Type <span className="text-red-500">*</span>
                </Label>
                <select
                  value={selectedDocType}
                  onChange={(e) => {
                    setSelectedDocType(e.target.value as DocumentType | "");
                    setUploadError("");
                  }}
                  disabled={isUploading}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
                    !selectedDocType ? "border-amber-400 bg-amber-50 text-gray-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    — Select a document type —
                  </option>
                  {serviceDocumentTypes.map((docType) => (
                    <option key={docType} value={docType}>
                      {DOCUMENT_TYPE_LABELS[docType]}
                      {SERVICE_REQUIRED_DOCUMENTS.includes(docType) ? " *" : ""}
                    </option>
                  ))}
                </select>
                {!selectedDocType && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Select a document type first to enable uploading.
                  </p>
                )}
              </div>

              {/* Upload Area */}
              <div>
                <Label className="block text-sm font-medium text-gray-900 mb-2">
                  Step 2 — Upload File
                </Label>
                <Card className={`border-2 border-dashed transition-all ${
                  !selectedDocType ? "opacity-50 pointer-events-none border-gray-200 bg-gray-50" : "border-gray-300 hover:border-green-400"
                }`}>
                  <CardContent className="pt-6">
                    <label className={`flex flex-col items-center justify-center ${
                      !selectedDocType ? "cursor-not-allowed" : "cursor-pointer"
                    }`}>
                      {isUploading ? (
                        <>
                          <Loader2 className="w-12 h-12 text-green-600 mb-4 animate-spin" />
                          <span className="text-lg font-semibold text-gray-900 mb-1">
                            Uploading...
                          </span>
                        </>
                      ) : !selectedDocType ? (
                        <>
                          <FileUp className="w-12 h-12 text-gray-300 mb-4" />
                          <span className="text-base font-semibold text-gray-400 mb-1">
                            Select a document type above first
                          </span>
                          <span className="text-sm text-gray-400">
                            The upload will be enabled once you choose a type
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-green-600 mb-4" />
                          <span className="text-lg font-semibold text-gray-900 mb-1">
                            Upload {DOCUMENT_TYPE_LABELS[selectedDocType as DocumentType]}
                          </span>
                          <span className="text-sm text-gray-600 mb-4">
                            JPG, PNG, WebP or PDF (max 10MB)
                          </span>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Browse Files
                          </Badge>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleDocumentUpload}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        disabled={isUploading || !selectedDocType}
                      />
                    </label>
                  </CardContent>
                </Card>
              </div>

              {/* Required Documents Status */}
              <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                <p className="text-sm font-bold text-gray-800 mb-3">
                  Required Documents <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-500 ml-2">(all must be uploaded to proceed)</span>
                </p>
                <div className="space-y-2">
                  {SERVICE_REQUIRED_DOCUMENTS.map((docType) => {
                    const isUploaded = uploadedDocuments.some(
                      (d) => d.documentType === docType && d.status === "uploaded"
                    );
                    return (
                      <div
                        key={docType}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isUploaded
                            ? "bg-green-50 border border-green-200"
                            : "bg-red-50 border border-red-200"
                        }`}
                      >
                        {isUploaded ? (
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${
                          isUploaded ? "text-green-800" : "text-red-700"
                        }`}>
                          {DOCUMENT_TYPE_LABELS[docType]}
                          {!isUploaded && (
                            <span className="ml-1.5 text-xs font-normal opacity-80">(required)</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {!SERVICE_REQUIRED_DOCUMENTS.every((docType) =>
                  uploadedDocuments.some((d) => d.documentType === docType && d.status === "uploaded")
                ) && (
                  <p className="text-xs text-red-600 mt-3 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Upload all required documents above to complete registration.
                  </p>
                )}
              </div>

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <h4 className="font-semibold text-gray-900">Uploaded Documents</h4>
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        doc.status === "uploaded"
                          ? "bg-green-50 border-green-200"
                          : doc.status === "uploading"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {doc.status === "uploaded" && <CheckCircle className="w-5 h-5 text-green-600" />}
                        {doc.status === "uploading" && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
                        {doc.status === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{DOCUMENT_TYPE_LABELS[doc.documentType]}</p>
                          <p className="text-xs text-gray-600">{doc.fileName}</p>
                          {doc.errorMessage && <p className="text-xs text-red-600">{doc.errorMessage}</p>}
                        </div>
                      </div>
                      {doc.status !== "uploading" && (
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Your documents are secure</p>
                  <p>
                    All documents are verified by our admin team. You will appear in service
                    listings after your documents are verified.
                  </p>
                </div>
              </div>
            </div>
          )}
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between mt-6">
            <Button
              onClick={() => setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 | 4 : prev))}
              variant="outline"
              disabled={step === 1 || isSubmitting}
              className="flex-1"
            >
              Previous
            </Button>

            <Button
              onClick={() => {
                if (step === 4) {
                  handleSubmit();
                } else {
                  setStep((prev) => (prev < 4 ? (prev + 1) as 1 | 2 | 3 | 4 : prev));
                }
              }}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer text-white"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : step === 4 ? (
                "Complete Registration"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
