"use client";

import { FileText, Download, Eye, Share2, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

const reports = [
  {
    id: "REP001",
    title: "Monthly Performance Report",
    type: "monthly",
    period: "January 2024",
    generated: "2024-02-01",
    size: "2.4 MB",
    metrics: {
      revenue: 245000,
      bookings: 8,
      occupancy: 85,
      growth: 12,
    },
    status: "ready",
  },
  {
    id: "REP002",
    title: "Annual Tax Summary",
    type: "annual",
    period: "2023-2024",
    generated: "2024-01-15",
    size: "3.8 MB",
    metrics: {
      revenue: 1450000,
      expenses: 345000,
      profit: 1105000,
      growth: 18,
    },
    status: "ready",
  },
  {
    id: "REP003",
    title: "Property-wise Analysis",
    type: "detailed",
    period: "Q4 2023",
    generated: "2024-01-10",
    size: "4.2 MB",
    metrics: {
      properties: 5,
      avgRevenue: 49000,
      bestPerformer: "Seaside Villa",
      growth: 15,
    },
    status: "ready",
  },
  {
    id: "REP004",
    title: "Expense Breakdown Report",
    type: "detailed",
    period: "January 2024",
    generated: "2024-02-02",
    size: "1.8 MB",
    metrics: {
      totalExpenses: 55500,
      mainCategory: "Maintenance",
      savings: 4500,
      growth: -2,
    },
    status: "generating",
  },
];

const reportTypes = [
  { id: "all", label: "All Reports" },
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
  { id: "detailed", label: "Detailed" },
];

export default function FinancialReports() {
  const [selectedType, setSelectedType] = useState("all");

  const filteredReports = reports.filter(report => 
    selectedType === "all" || report.type === selectedType
  );

  const generateNewReport = () => {
    alert("Generating new report... This may take a few moments.");
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
          <p className="text-sm text-gray-500 mt-1">
            Generate and download detailed financial reports
          </p>
        </div>
        <Button 
          onClick={generateNewReport}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Type Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-4 py-2 text-sm rounded-[5px] border ${
              selectedType === type.id
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="border rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{report.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    {report.period}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                report.status === "ready" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {report.status}
              </span>
            </div>

            {/* Report Metrics */}
            <div className="space-y-3 mb-4">
              {report.type === "monthly" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-medium">{formatCurrency(report.metrics.revenue  ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bookings</span>
                    <span className="font-medium">{report.metrics.bookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth</span>
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      +{report.metrics.growth}%
                    </span>
                  </div>
                </>
              )}
              
              {report.type === "annual" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Revenue</span>
                    <span className="font-medium">{formatCurrency(report.metrics.revenue  ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Net Profit</span>
                    <span className="font-medium">{formatCurrency(report.metrics.profit  ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Annual Growth</span>
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      +{report.metrics.growth}%
                    </span>
                  </div>
                </>
              )}
              
              {report.type === "detailed" && report.title.includes("Property") && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Properties</span>
                    <span className="font-medium">{report.metrics.properties}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Revenue</span>
                    <span className="font-medium">{formatCurrency(report.metrics.avgRevenue  ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Top Performer</span>
                    <span className="font-medium">{report.metrics.bestPerformer}</span>
                  </div>
                </>
              )}
              
              {report.type === "detailed" && report.title.includes("Expense") && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Expenses</span>
                    <span className="font-medium">{formatCurrency(report.metrics.totalExpenses  ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Main Category</span>
                    <span className="font-medium">{report.metrics.mainCategory}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost Savings</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(report.metrics.savings ?? 0)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">
                Generated: {new Date(report.generated).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
                • {report.size}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Report Options */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-900 mb-3">Quick Report Templates</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            <BarChart3 className="w-4 h-4 mr-2" />
            Occupancy Report
          </Button>
          <Button variant="outline" className="justify-start">
            <TrendingUp className="w-4 h-4 mr-2" />
            Revenue Forecast
          </Button>
          <Button variant="outline" className="justify-start">
            <FileText className="w-4 h-4 mr-2" />
            Expense Report
          </Button>
          <Button variant="outline" className="justify-start">
            <Calendar className="w-4 h-4 mr-2" />
            Seasonal Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}