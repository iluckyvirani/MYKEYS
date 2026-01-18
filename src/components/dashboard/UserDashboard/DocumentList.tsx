"use client";

import { FileText, Download, Eye, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

const documents = [
  {
    id: "DOC001",
    name: "PAN Card",
    type: "id_proof",
    uploaded: "2024-01-05",
    expires: "2030-01-05",
    status: "verified",
    size: "2.4 MB",
    previewUrl: "#",
  },
  {
    id: "DOC002",
    name: "Aadhar Card",
    type: "id_proof",
    uploaded: "2024-01-05",
    expires: "2030-01-05",
    status: "pending",
    size: "3.2 MB",
    previewUrl: "#",
  },
  {
    id: "DOC003",
    name: "Passport",
    type: "id_proof",
    uploaded: "2023-12-20",
    expires: "2033-12-20",
    status: "verified",
    size: "4.1 MB",
    previewUrl: "#",
  },
  {
    id: "DOC004",
    name: "Driving License",
    type: "id_proof",
    uploaded: "2023-11-15",
    expires: "2030-11-15",
    status: "rejected",
    size: "2.8 MB",
    previewUrl: "#",
    rejectionReason: "Image unclear, please upload a clearer copy",
  },
  {
    id: "DOC005",
    name: "Electricity Bill",
    type: "address_proof",
    uploaded: "2024-01-10",
    expires: "2024-07-10",
    status: "pending",
    size: "1.9 MB",
    previewUrl: "#",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "verified":
      return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Verified" };
    case "pending":
      return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Under Review" };
    case "rejected":
      return { color: "bg-red-100 text-red-800", icon: XCircle, label: "Rejected" };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: Clock, label: "Pending" };
  }
};

export default function DocumentList() {
  const [docs, setDocs] = useState(documents);

  const handleDelete = (id: string) => {
    setDocs(docs.filter(doc => doc.id !== id));
  };

  return (
    <div className="p-6">
      <div className="space-y-4">
        {docs.map((doc) => {
          const statusConfig = getStatusConfig(doc.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={doc.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4 md:mb-0">
                <div className="p-3 rounded-lg bg-blue-50">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{doc.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Type: {doc.type.replace("_", " ")}</div>
                    <div>Uploaded: {formatDate(doc.uploaded)}</div>
                    <div>Expires: {formatDate(doc.expires)}</div>
                    <div>Size: {doc.size}</div>
                    {doc.rejectionReason && (
                      <div className="text-red-600">Reason: {doc.rejectionReason}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {doc.status === "rejected" && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Re-upload
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {docs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-500">Upload your verification documents to get started</p>
          <Button className="mt-4">Upload First Document</Button>
        </div>
      )}
    </div>
  );
}