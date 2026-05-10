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

export default function PropertyDocumentsTab({ propertyId }: Props) {
  const [requiredTypes, setRequiredTypes] = useState<DocumentType[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Per-type date states (for issue/expiry date inputs before upload)
  const [dates, setDates] = useState<
    Record<string, { issuedDate: string; expiryDate: string }>
  >({});

  async function fetchData() {
    setLoading(true);
    try {
      const [reqRes, docsRes] = await Promise.all([
        api.get(`/api/properties/${propertyId}/documents/required`),
        api.get(`/api/properties/${propertyId}/documents`),
      ]);
      setRequiredTypes(reqRes.data?.data ?? []);
      setUploadedDocs(docsRes.data?.data ?? []);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
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

  async function handleUpload(typeId: string, file: File) {
    setUploadingId(typeId);
    setUploadError("");
    try {
      // Upload to Cloudinary via /api/upload
      const base64 = await toBase64(file);
      const uploadRes = await api.post("/api/upload", {
        image: base64,
        folder: "mykeys/property-documents",
      });
      const { url } = uploadRes.data?.data ?? uploadRes.data;

      const typeDates = dates[typeId] ?? { issuedDate: "", expiryDate: "" };

      await api.post(`/api/properties/${propertyId}/documents`, {
        documentTypeId: typeId,
        documentUrl: url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        issuedDate: typeDates.issuedDate || undefined,
        expiryDate: typeDates.expiryDate || undefined,
      });

      await fetchData();
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
      await api.delete(
        `/api/properties/${propertyId}/documents/${doc.id}`
      );
      await fetchData();
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
                {(!uploaded ||
                  uploaded.status === "REJECTED" ||
                  uploaded.status === "EXPIRED") && (
                  <div className="mt-3 flex flex-wrap gap-4">
                    {dt.requireIssueDate && (
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Issue Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          className="text-xs h-8 w-40"
                          value={typeDates.issuedDate}
                          onChange={(e) =>
                            setDates((d) => ({
                              ...d,
                              [dt.id]: {
                                ...(d[dt.id] ?? {
                                  issuedDate: "",
                                  expiryDate: "",
                                }),
                                issuedDate: e.target.value,
                              },
                            }))
                          }
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
                          onChange={(e) =>
                            setDates((d) => ({
                              ...d,
                              [dt.id]: {
                                ...(d[dt.id] ?? {
                                  issuedDate: "",
                                  expiryDate: "",
                                }),
                                expiryDate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {uploaded && uploaded.status !== "REJECTED" && uploaded.status !== "EXPIRED" && (
                  <a
                    href={uploaded.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
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
                  onClick={() => fileRefs.current[dt.id]?.click()}
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
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
  );
}
