"use client";

import { FileText, Calendar, Download, BarChart3, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const reportTypes = [
  { id: "performance", name: "Performance Report", icon: TrendingUp, description: "Revenue, bookings, and occupancy metrics" },
  { id: "financial", name: "Financial Report", icon: BarChart3, description: "Income, expenses, and profit analysis" },
  { id: "property", name: "Property Analysis", icon: FileText, description: "Individual property performance" },
  { id: "tax", name: "Tax Summary", icon: FileText, description: "Tax calculations and deductions" },
];

const dateRanges = [
  { id: "today", name: "Today" },
  { id: "week", name: "Last 7 Days" },
  { id: "month", name: "Current Month" },
  { id: "quarter", name: "This Quarter" },
  { id: "year", name: "This Year" },
  { id: "custom", name: "Custom Range" },
];

const properties = [
  { id: "all", name: "All Properties" },
  { id: "PROP001", name: "Seaside Luxury Villa" },
  { id: "PROP002", name: "Modern 2BHK Apartment" },
  { id: "PROP003", name: "Mountain View Cottage" },
];

export default function ReportGenerator() {
  const [selectedReport, setSelectedReport] = useState("performance");
  const [selectedDateRange, setSelectedDateRange] = useState("month");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Report generated successfully!\nType: ${selectedReport}\nDate Range: ${selectedDateRange}\nProperty: ${selectedProperty}`);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create custom reports with selected parameters
          </p>
        </div>
        <div className="p-2 bg-green-100 rounded-lg">
          <FileText className="w-5 h-5 text-green-600" />
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Report Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isSelected = selectedReport === report.id;
            
            return (
              <button
                key={report.id}
                className={`p-4 border rounded-lg text-left transition-all ${
                  isSelected
                    ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? "bg-green-100" : "bg-gray-100"
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? "text-green-600" : "text-gray-600"}`} />
                  </div>
                  <div className="font-semibold text-gray-900">{report.name}</div>
                </div>
                <p className="text-xs text-gray-600">{report.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Date Range
          </label>
          <div className="grid grid-cols-3 gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                className={`px-3 py-2 text-sm rounded-[5px] border ${
                  selectedDateRange === range.id
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setSelectedDateRange(range.id)}
              >
                {range.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Select Property
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-[5px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Report Preview
        </label>
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(245000)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Bookings</div>
              <div className="text-xl font-bold text-gray-900">8</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Occupancy Rate</div>
              <div className="text-xl font-bold text-gray-900">85%</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            This report will include: {reportTypes.find(r => r.id === selectedReport)?.description}
            <br />
            Period: {dateRanges.find(d => d.id === selectedDateRange)?.name}
            <br />
            Property: {properties.find(p => p.id === selectedProperty)?.name}
          </div>
        </div>
      </div>

      {/* Format Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Export Format
        </label>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
            PDF
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
            Excel
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
            CSV
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
            Print
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        onClick={generateReport}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating Report...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </>
        )}
      </Button>
    </div>
  );
}