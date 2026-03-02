"use client";

import { useState, useRef } from "react";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { DocumentType, DOCUMENT_TYPE_LABELS, USER_REQUIRED_DOCUMENTS, USER_OPTIONAL_DOCUMENTS, SERVICE_REQUIRED_DOCUMENTS, SERVICE_OPTIONAL_DOCUMENTS } from "@/types/document";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userRole?: "USER" | "OWNER" | "SERVICE";
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  userRole = "USER",
}: DocumentUploadModalProps) {
  const [documentType, setDocumentType] = useState<DocumentType>("PAN_CARD");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const availableDocuments = userRole === "USER"
    ? [...USER_REQUIRED_DOCUMENTS, ...USER_OPTIONAL_DOCUMENTS]
    : userRole === "SERVICE"
      ? [...SERVICE_REQUIRED_DOCUMENTS, ...SERVICE_OPTIONAL_DOCUMENTS]
      : ["PROPERTY_LICENSE", "BUSINESS_LICENSE", "GST_CERTIFICATE", "TAX_IDENTIFICATION", "RENTAL_AGREEMENT_TEMPLATE"] as DocumentType[];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload a JPG, PNG, WebP, or PDF file");
      setFile(null);
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Step 1: Upload to Cloudinary to get URL
      const uploadResponse = await api.post("/upload", {
        image: base64,
        folder: "mykeys/user-documents",
      });

      const documentUrl = uploadResponse.data.data.url;

      // Step 2: Create document record with Cloudinary URL
      const response = await api.post("/documents", {
        documentType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentUrl,
      });

      if (response.data) {
        setFile(null);
        setDocumentType("PAN_CARD");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error("Document upload error:", err);
      setError(
        err.response?.data?.message || "Failed to upload document. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Document Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Document Type *
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {availableDocuments.map((docType) => (
              <option key={docType} value={docType}>
                {DOCUMENT_TYPE_LABELS[docType]}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Select File *
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors disabled:opacity-50"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  JPG, PNG, WebP or PDF (max 10MB)
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
          <p>
            <strong>Tip:</strong> Upload clear, readable documents for faster verification. Documents will be verified by our admin team.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
