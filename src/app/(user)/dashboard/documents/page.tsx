"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentList from "@/components/dashboard/UserDashboard/DocumentList";

export default function DocumentsPage() {
  return (
    <DashboardLayout defaultRole="user">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-2">
              Manage your verification documents and IDs
            </p>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-white rounded-xl p-6 mb-8 border">
        <div className="flex items-center justify-between mb-6">
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
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="font-medium">Email</div>
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="font-medium">Phone</div>
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="font-medium">ID Proof</div>
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          
          <div className="p-4 border rounded-lg">
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

      {/* Documents List */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">All Documents</h3>
              <p className="text-sm text-gray-500 mt-1">
                Uploaded documents for verification
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="border rounded-lg px-4 py-2 text-sm">
                <option>All Documents</option>
                <option>Verified</option>
                <option>Pending</option>
                <option>Expired</option>
              </select>
            </div>
          </div>
        </div>

        <DocumentList />
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-3">Document Tips</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>Upload clear, readable images of your documents</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>Complete verification for instant booking approval on select properties</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>Documents are securely encrypted and only shared with property owners when required</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
            <span>You can update expired documents anytime</span>
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
}