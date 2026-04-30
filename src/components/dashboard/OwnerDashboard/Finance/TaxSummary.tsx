"use client";

import { FileText, Calculator, AlertCircle, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const taxData = {
  financialYear: "2023-2024",
  totalIncome: 1450000,
  deductibleExpenses: 345000,
  taxableIncome: 1105000,
  taxLiability: 275000,
  taxPaid: 200000,
  taxDue: 75000,
  dueDate: "2024-03-31",
  categories: [
    { name: "Property Tax", amount: 85000, paid: true },
    { name: "GST", amount: 120000, paid: false },
    { name: "Income Tax", amount: 70000, paid: true },
  ],
  documents: [
    { name: "Form 16", date: "2024-01-15", status: "ready" },
    { name: "GST Returns", date: "2024-01-20", status: "pending" },
    { name: "Property Tax Receipt", date: "2023-12-28", status: "ready" },
  ],
};

export default function TaxSummary() {
  const taxPercentage = (taxData.taxLiability / taxData.taxableIncome * 100).toFixed(1);
  const daysUntilDue = Math.ceil(
    (new Date(taxData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-[5px] border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tax Summary</h3>
          <p className="text-sm text-gray-500 mt-1">
            Financial Year: {taxData.financialYear}
          </p>
        </div>
        <div className="p-2 bg-purple-100 rounded-lg">
          <Calculator className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      {/* Tax Overview */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Income</span>
          <span className="font-bold text-gray-900">{formatCurrency(taxData.totalIncome)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Deductible Expenses</span>
          <span className="font-medium text-red-600">-{formatCurrency(taxData.deductibleExpenses)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-medium text-gray-900">Taxable Income</span>
          <span className="font-bold text-gray-900">{formatCurrency(taxData.taxableIncome)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tax Liability</span>
          <span className="font-bold text-red-600">{formatCurrency(taxData.taxLiability)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tax Paid</span>
          <span className="font-medium text-green-600">{formatCurrency(taxData.taxPaid)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-medium text-gray-900">Balance Due</span>
          <span className="font-bold text-red-600">{formatCurrency(taxData.taxDue)}</span>
        </div>
      </div>

      {/* Due Date Alert */}
      {taxData.taxDue > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${
          daysUntilDue <= 30 ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${
              daysUntilDue <= 30 ? "text-red-600" : "text-yellow-600"
            }`} />
            <div>
              <div className="font-medium text-gray-900">
                Tax Payment Due: {new Date(taxData.dueDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} remaining • Effective tax rate: {taxPercentage}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Categories */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Tax Breakdown</h4>
        <div className="space-y-3">
          {taxData.categories.map((category) => (
            <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${category.paid ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{formatCurrency(category.amount)}</span>
                <span className={`text-xs ${category.paid ? "text-green-600" : "text-red-600"}`}>
                  {category.paid ? "Paid" : "Due"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Tax Documents</h4>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
        <div className="space-y-2">
          {taxData.documents.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">{doc.name}</div>
                  <div className="text-xs text-gray-500">
                    Due: {new Date(doc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                doc.status === "ready" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {doc.status}
              </span>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          Consult Tax Advisor
        </Button>
      </div>
    </div>
  );
}