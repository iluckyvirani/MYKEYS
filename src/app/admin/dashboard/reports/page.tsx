"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Download, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  name: string;
  type: "financial" | "performance" | "property";
  generatedBy: string;
  generatedDate: string;
  fileSize: string;
  downloads: number;
  period: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "Monthly Financial Report - February 2026",
      type: "financial",
      generatedBy: "Admin System",
      generatedDate: "2026-02-26",
      fileSize: "2.4 MB",
      downloads: 12,
      period: "Feb 2026",
    },
    {
      id: "2",
      name: "Q1 2026 Platform Performance Report",
      type: "performance",
      generatedBy: "Admin Dashboard",
      generatedDate: "2026-02-20",
      fileSize: "3.1 MB",
      downloads: 8,
      period: "Q1 2026",
    },
    {
      id: "3",
      name: "Property Listing Analysis - February",
      type: "property",
      generatedBy: "Analytics Engine",
      generatedDate: "2026-02-18",
      fileSize: "1.8 MB",
      downloads: 15,
      period: "Feb 2026",
    },
    {
      id: "4",
      name: "Revenue & Subscription Analytics",
      type: "financial",
      generatedBy: "Finance Module",
      generatedDate: "2026-02-15",
      fileSize: "2.7 MB",
      downloads: 10,
      period: "Feb 2026",
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "financial":
        return "bg-green-100 text-green-800";
      case "performance":
        return "bg-blue-100 text-blue-800";
      case "property":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return "💰";
      case "performance":
        return "📊";
      case "property":
        return "🏠";
      default:
        return "📄";
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-green-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">View and download platform reports and analytics</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-600 to-emerald-500">
            <div className="text-white">
              <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">₹24.5Cr</p>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-500">
            <div className="text-white">
              <BarChart3 className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Active Properties</p>
              <p className="text-2xl font-bold mt-1">8,643</p>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-500">
            <div className="text-white">
              <Calendar className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Total Bookings</p>
              <p className="text-2xl font-bold mt-1">12,450</p>
            </div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-600 to-red-500">
            <div className="text-white">
              <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-sm opacity-90">Platform Growth</p>
              <p className="text-2xl font-bold mt-1">+24.5%</p>
            </div>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Reports</h2>

          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{getTypeIcon(report.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>By {report.generatedBy}</span>
                      <span>•</span>
                      <span>{report.generatedDate}</span>
                      <span>•</span>
                      <span>{report.fileSize}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className={getTypeColor(report.type)}>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Downloads</p>
                    <p className="font-semibold text-gray-900">{report.downloads}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Report Details */}
        {selectedReport && (
          <Card className="border-2 border-green-600 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedReport.name}</h2>
                <p className="text-gray-600 text-sm mt-1">Generated on {selectedReport.generatedDate}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                ✕
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Report Type</p>
                <Badge className={`mt-2 ${getTypeColor(selectedReport.type)}`}>
                  {selectedReport.type.charAt(0).toUpperCase() + selectedReport.type.slice(1)}
                </Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">File Size</p>
                <p className="font-semibold mt-2">{selectedReport.fileSize}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="font-semibold mt-2">{selectedReport.downloads}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Period</p>
                <p className="font-semibold mt-2">{selectedReport.period}</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">Report Preview</h3>
              <p className="text-sm text-blue-800 mb-3">
                This report contains comprehensive analytics and insights for the selected period.
              </p>

              {selectedReport.type === "financial" && (
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Total Revenue: ₹24,500,000</p>
                  <p>• Subscription Revenue: ₹18,200,000</p>
                  <p>• Booking Payments: ₹6,300,000</p>
                  <p>• Platform Commission: ₹3,200,000</p>
                  <p>• Payment Processing Fees: ₹145,000</p>
                </div>
              )}

              {selectedReport.type === "performance" && (
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Active Users: 45,200</p>
                  <p>• New Registrations: 12,890</p>
                  <p>• Platform Engagement: 87.5%</p>
                  <p>• API Response Time: 145ms (avg)</p>
                  <p>• System Uptime: 99.98%</p>
                </div>
              )}

              {selectedReport.type === "property" && (
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• Total Properties: 8,643</p>
                  <p>• New Listings: 1,245</p>
                  <p>• Featured Properties: 2,156</p>
                  <p>• Average Price: ₹45,62,000</p>
                  <p>• Average Rating: 4.62 / 5.0</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1">
                Share Report
              </Button>
              <Button variant="outline" className="flex-1">
                Print
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
