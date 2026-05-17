"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Trash2,
  Eye,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";

interface DocumentType {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  requireIssueDate: boolean;
  requireExpiryDate: boolean;
  appliesTo: string[];
}

interface PropertyDocument {
  id: string;
  documentTypeId: string;
  documentUrl: string;
  fileName: string;
  fileSize: number;
  issuedDate?: string;
  expiryDate?: string;
  status: string;
  verifiedNotes?: string;
  documentType: DocumentType;
  createdAt: string;
}

interface Props {
  propertyId: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-3 h-3" />,
  },
  VERIFIED: {
    label: "Verified",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-3 h-3" />,
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-gray-100 text-gray-600",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(fileName: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(fileName);
}

function isPdfFile(fileName: string) {
  return /\.pdf$/i.test(fileName);
}

// ── Document Preview Modal ──────────────────────────────────────────────────
interface PreviewModalProps {
  doc: PropertyDocument;
  onClose: () => void;
}

function DocumentPreviewModal({ doc, onClose }: PreviewModalProps) {
  const [imgScale, setImgScale] = useState(1);
  const isImage = isImageFile(doc.fileName);
  const isPdf = isPdfFile(doc.fileName);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[5px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-gray-500 shrink-0" />
            <span className="font-medium text-gray-900 truncate text-sm">
              {doc.fileName}
            </span>
            <span className="text-xs text-gray-400 shrink-0">
              ({formatBytes(doc.fileSize)})
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {isImage && (
              <>
                <button
                  type="button"
                  onClick={() => setImgScale((s) => Math.max(0.5, s - 0.25))}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 w-10 text-center">
                  {Math.round(imgScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setImgScale((s) => Math.min(3, s + 0.25))}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}
            <a
              href={doc.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={doc.documentUrl}
              download={doc.fileName}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-4 min-h-0">
          {isImage ? (
            <div
              className="transition-transform duration-150 origin-top"
              style={{ transform: `scale(${imgScale})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.documentUrl}
                alt={doc.fileName}
                className="max-w-full rounded shadow"
                style={{ maxHeight: "70vh" }}
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(doc.documentUrl)}&embedded=true`}
              title={doc.fileName}
              className="w-full bg-white rounded"
              style={{ height: "70vh", minHeight: 400 }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                Preview not available for this file type
              </p>
              <a
                href={doc.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Open file in new tab
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between text-xs text-gray-500 shrink-0 bg-gray-50">
          <span>
            {doc.issuedDate && `Issued: ${new Date(doc.issuedDate).toLocaleDateString("en-GB")}  `}
            {doc.expiryDate && `Expires: ${new Date(doc.expiryDate).toLocaleDateString("en-GB")}`}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}


export default function PropertyDocumentsTab({ propertyId }: Props) {
  const [requiredTypes, setRequiredTypes] = useState<DocumentType[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PropertyDocument | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const fetchedTypesRef = useRef(false);

  // Per-type date states (for issue/expiry date inputs before upload)
  const [dates, setDates] = useState<
    Record<string, { issuedDate: string; expiryDate: string }>
  >({});

  // Fetch required document types ONCE — they don't change during the session
  async function fetchRequiredTypes() {
    try {
      const res = await api.get(`/properties/${propertyId}/documents/required`);
      setRequiredTypes(res.data?.data ?? []);
    } catch {
      /* silently fail */
    }
  }

  // Fetch only the uploaded docs — called after every upload/delete
  async function refreshDocs() {
    try {
      const res = await api.get(`/properties/${propertyId}/documents`);
      setUploadedDocs(res.data?.data ?? []);
    } catch {
      /* silently fail */
    }
  }

  useEffect(() => {
    if (fetchedTypesRef.current) return; // prevent StrictMode double-invoke
    fetchedTypesRef.current = true;

    setLoading(true);
    Promise.all([fetchRequiredTypes(), refreshDocs()]).finally(() =>
      setLoading(false)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  function getUploadedDoc(typeId: string) {
    return uploadedDocs.find((d) => d.documentTypeId === typeId);
  }

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function validateDates(typeId: string, dt: DocumentType): string {
    const typeDates = dates[typeId] ?? { issuedDate: "", expiryDate: "" };
    if (dt.requireIssueDate && !typeDates.issuedDate) {
      return "Issue date is required before uploading.";
    }
    if (dt.requireExpiryDate && !typeDates.expiryDate) {
      return "Expiry date is required before uploading.";
    }
    return "";
  }

  function handleUploadClick(typeId: string, dt: DocumentType) {
    const err = validateDates(typeId, dt);
    if (err) {
      setDateErrors((prev) => ({ ...prev, [typeId]: err }));
      return;
    }
    setDateErrors((prev) => ({ ...prev, [typeId]: "" }));
    fileRefs.current[typeId]?.click();
  }

  async function handleUpload(typeId: string, file: File) {
    setUploadingId(typeId);
    setUploadError("");
    try {
      // Upload to Cloudinary via /api/upload
      const base64 = await toBase64(file);
      const uploadRes = await api.post("/upload", {
        image: base64,
        folder: "mykeys/property-documents",
      });
      const { url } = uploadRes.data?.data ?? uploadRes.data;

      const typeDates = dates[typeId] ?? { issuedDate: "", expiryDate: "" };

      await api.post(`/properties/${propertyId}/documents`, {
        documentTypeId: typeId,
        documentUrl: url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        issuedDate: typeDates.issuedDate || undefined,
        expiryDate: typeDates.expiryDate || undefined,
      });

      // Only refresh the uploaded docs list — required types haven't changed
      await refreshDocs();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Upload failed";
      setUploadError(msg);
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDelete(doc: PropertyDocument) {
    setDeletingId(doc.id);
    try {
      await api.delete(`/properties/${propertyId}/documents/${doc.id}`);
      // Only refresh the uploaded docs list
      await refreshDocs();
    } catch {
      /* silently fail */
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading documents...</div>
    );
  }

  if (requiredTypes.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
        <p>No document types are required for this property type.</p>
      </Card>
    );
  }

  return (
    <>
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
      <div className="space-y-4">
      {uploadError && (
        <div className="bg-red-50 text-red-700 rounded px-4 py-2 text-sm">
          {uploadError}
        </div>
      )}

      {requiredTypes.map((dt) => {
        const uploaded = getUploadedDoc(dt.id);
        const status = uploaded ? STATUS_CONFIG[uploaded.status] : null;
        const typeDates = dates[dt.id] ?? { issuedDate: "", expiryDate: "" };
        const isUploading = uploadingId === dt.id;
        const isDeleting = deletingId === uploaded?.id;
        const needsDates =
          !uploaded ||
          uploaded.status === "REJECTED" ||
          uploaded.status === "EXPIRED";
        const dateError = dateErrors[dt.id] ?? "";

        return (
          <Card key={dt.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-medium text-gray-900">{dt.name}</span>
                  {dt.isRequired ? (
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                      Required
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">
                      Optional
                    </Badge>
                  )}
                  {status && (
                    <Badge
                      className={`${status.color} border-0 text-xs flex items-center gap-1`}
                    >
                      {status.icon}
                      {status.label}
                    </Badge>
                  )}
                </div>

                {dt.description && (
                  <p className="text-xs text-gray-400 mt-1">{dt.description}</p>
                )}

                {/* Uploaded doc info */}
                {uploaded && (
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p>
                      {uploaded.fileName} ({formatBytes(uploaded.fileSize)})
                    </p>
                    {uploaded.issuedDate && (
                      <p>
                        Issued:{" "}
                        {new Date(uploaded.issuedDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    )}
                    {uploaded.expiryDate && (
                      <p>
                        Expires:{" "}
                        {new Date(uploaded.expiryDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </p>
                    )}
                    {uploaded.verifiedNotes && uploaded.status === "REJECTED" && (
                      <p className="text-red-600">
                        Reason: {uploaded.verifiedNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Date inputs — show when no uploaded doc or when rejected/expired */}
                {needsDates && (
                  <div className="mt-3 space-y-2">
                    <div className="flex flex-wrap gap-4">
                      {dt.requireIssueDate && (
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Issue Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            className="text-xs h-8 w-40"
                            value={typeDates.issuedDate}
                            onChange={(e) => {
                              setDates((d) => ({
                                ...d,
                                [dt.id]: {
                                  ...(d[dt.id] ?? {
                                    issuedDate: "",
                                    expiryDate: "",
                                  }),
                                  issuedDate: e.target.value,
                                },
                              }));
                              setDateErrors((prev) => ({ ...prev, [dt.id]: "" }));
                            }}
                          />
                        </div>
                      )}
                      {dt.requireExpiryDate && (
                        <div className="space-y-1">
                          <Label className="text-xs">
                            Expiry Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            className="text-xs h-8 w-40"
                            value={typeDates.expiryDate}
                            onChange={(e) => {
                              setDates((d) => ({
                                ...d,
                                [dt.id]: {
                                  ...(d[dt.id] ?? {
                                    issuedDate: "",
                                    expiryDate: "",
                                  }),
                                  expiryDate: e.target.value,
                                },
                              }));
                              setDateErrors((prev) => ({ ...prev, [dt.id]: "" }));
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {dateError && (
                      <p className="text-xs text-red-600">{dateError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {uploaded && uploaded.status !== "REJECTED" && uploaded.status !== "EXPIRED" && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(uploaded)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                )}

                {/* Upload / Re-upload */}
                <input
                  ref={(el) => {
                    fileRefs.current[dt.id] = el;
                  }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(dt.id, file);
                    e.target.value = "";
                  }}
                />
                <Button
                  size="sm"
                  variant={uploaded ? "outline" : "default"}
                  disabled={isUploading}
                  onClick={() => handleUploadClick(dt.id, dt)}
                  className="cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" />
                  {isUploading
                    ? "Uploading..."
                    : uploaded
                    ? "Replace"
                    : "Upload"}
                </Button>

                {/* Delete */}
                {uploaded && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    disabled={isDeleting}
                    onClick={() => handleDelete(uploaded)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {/* Summary */}
      <div className="text-xs text-gray-400">
        {
          requiredTypes.filter(
            (dt) =>
              !dt.isRequired ||
              uploadedDocs.some(
                (d) =>
                  d.documentTypeId === dt.id &&
                  ["PENDING", "VERIFIED"].includes(d.status)
              )
          ).length
        }{" "}
        / {requiredTypes.filter((dt) => dt.isRequired).length} required
        documents uploaded
      </div>
    </div>
    </>
  );
}
