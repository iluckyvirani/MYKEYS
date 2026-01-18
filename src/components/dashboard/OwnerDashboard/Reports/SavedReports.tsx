"use client";

import { FileText, Download, Eye, Calendar, MoreVertical, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const savedReports = [
  {
    id: 1,
    name: "Monthly Performance Report",
    type: "performance",
    date: "2024-01-31",
    size: "2.4 MB",
    downloads: 12,
    metrics: {
      revenue: 245000,
      bookings: 8,
      occupancy: 85,
    },
    favorite: true,
  },
  {
    id: 2,
    name: "Annual Financial Summary",
    type: "financial",
    date: "2023-12-31",
    size: "3.8 MB",
    downloads: 8,
    metrics: {
      revenue: 1450000,
      expenses: 345000,
      profit: 1105000,
    },
    favorite: true,
  },
  {
    id: 3,
    name: "Property Analysis - Q4",
    type: "property",
    date: "2024-01-15",
    size: "1.9 MB",
    downloads: 5,
    metrics: {
      properties: 5,
      avgRevenue: 49000,
      bestPerformer: "Seaside Villa",
    },
    favorite: false,
  },
  {
    id: 4,
    name: "Tax Preparation Report",
    type: "tax",
    date: "2024-01-10",
    size: "1.2 MB",
    downloads: 3,
    metrics: {
      taxableIncome: 1105000,
      taxLiability: 275000,
      taxPaid: 200000,
    },
    favorite: false,
  },
];

const getReportIcon = (type: string) => {
  switch (type) {
    case "performance":
      return { icon: TrendingUp, color: "text-blue-600" };
    case "financial":
      return { icon: BarChart3, color: "text-green-600" };
    case "property":
      return { icon: FileText, color: "text-purple-600" };
    case "tax":
      return { icon: FileText, color: "text-orange-600" };
    default:
      return { icon: FileText, color: "text-gray-600" };
  }
};

export default function SavedReports() {
  const [reports, setReports] = useState(savedReports);
  const [filter, setFilter] = useState("all");

  const toggleFavorite = (id: number) => {
    setReports(reports.map(report => 
      report.id === id 
        ? { ...report, favorite: !report.favorite }
        : report
    ));
  };

  const filteredReports = reports.filter(report => {
    if (filter === "all") return true;
    if (filter === "favorites") return report.favorite;
    return report.type === filter;
  });

  const downloadReport = (id: number) => {
    alert(`Downloading report #${id}`);
    // Update download count
    setReports(reports.map(report => 
      report.id === id 
        ? { ...report, downloads: report.downloads + 1 }
        : report
    ));
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saved Reports</h3>
          <p className="text-sm text-gray-500 mt-1">
            Access previously generated reports
          </p>
        </div>
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "performance", "financial", "property", "tax", "favorites"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-3 py-1.5 text-sm rounded-[5px] border ${
              filter === filterType
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {filterType === "all" && "All"}
            {filterType === "performance" && "Performance"}
            {filterType === "financial" && "Financial"}
            {filterType === "property" && "Property"}
            {filterType === "tax" && "Tax"}
            {filterType === "favorites" && "Favorites"}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => {
          const reportIcon = getReportIcon(report.type);
          const Icon = reportIcon.icon;

          return (
            <div
              key={report.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`w-4 h-4 ${reportIcon.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{report.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(report.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>{report.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(report.id)}
                  className="text-gray-400 hover:text-yellow-500"
                >
                  {report.favorite ? "★" : "☆"}
                </button>
              </div>

              {/* Metrics Preview */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {report.type === "performance" && (
                  <>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.revenue)}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600">Bookings</div>
                      <div className="text-sm font-bold">{report.metrics.bookings}</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-xs text-gray-600">Occupancy</div>
                      <div className="text-sm font-bold">{report.metrics.occupancy}%</div>
                    </div>
                  </>
                )}
                {report.type === "financial" && (
                  <>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">Revenue</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.revenue)}</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-xs text-gray-600">Expenses</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.expenses)}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600">Profit</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.profit)}</div>
                    </div>
                  </>
                )}
                {report.type === "property" && (
                  <>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">Properties</div>
                      <div className="text-sm font-bold">{report.metrics.properties}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600">Avg Revenue</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.avgRevenue)}</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-xs text-gray-600">Top Property</div>
                      <div className="text-sm font-bold truncate">{report.metrics.bestPerformer}</div>
                    </div>
                  </>
                )}
                {report.type === "tax" && (
                  <>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">Taxable Income</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.taxableIncome)}</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="text-xs text-gray-600">Tax Liability</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.taxLiability)}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-xs text-gray-600">Tax Paid</div>
                      <div className="text-sm font-bold">{formatCurrency(report.metrics.taxPaid)}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => downloadReport(report.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reports found</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Schedule Reports
          </Button>
          <Button variant="outline" className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            Bulk Download
          </Button>
          <Button variant="outline" className="justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Monthly Archive
          </Button>
          <Button variant="outline" className="justify-start">
            <Eye className="w-4 h-4 mr-2" />
            Shared Reports
          </Button>
        </div>
      </div>
    </div>
  );
}