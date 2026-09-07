"use client";

import { useState } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import AdminAuditLogFilterModal from "@/components/dashboard/AdminAuditLogFilterModal";
import AdminAuditLogList from "@/components/dashboard/AdminAuditLogList";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye, X, Activity, ArrowUp, ArrowDown, Plus } from "lucide-react";

interface AuditLog {
  id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  performedBy: string;
  timestamp: string;
  ipAddress: string;
  description: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      action: "CREATE",
      entity: "Property",
      entityId: "prop_12345",
      performedBy: "Rajesh Kumar",
      timestamp: "2026-02-26 14:32:15",
      ipAddress: "192.168.1.101",
      description: "Created new property listing 'Luxury Villa in Mumbai'",
    },
    {
      id: "2",
      action: "UPDATE",
      entity: "User",
      entityId: "user_98765",
      performedBy: "Admin",
      timestamp: "2026-02-26 13:45:22",
      ipAddress: "192.168.1.50",
      description: "Updated user role from OWNER to SERVICE_PROVIDER",
    },
    {
      id: "3",
      action: "DELETE",
      entity: "Booking",
      entityId: "book_54321",
      performedBy: "Priya Sharma",
      timestamp: "2026-02-26 12:15:08",
      ipAddress: "192.168.1.102",
      description: "Cancelled booking for property PROP-2026-001",
    },
    {
      id: "4",
      action: "UPDATE",
      entity: "Payment",
      entityId: "pay_11111",
      performedBy: "System",
      timestamp: "2026-02-26 11:30:45",
      ipAddress: "127.0.0.1",
      description: "Payment status marked as COMPLETED for booking BOK-2026-5432",
    },
    {
      id: "5",
      action: "CREATE",
      entity: "Document",
      entityId: "doc_22222",
      performedBy: "Amit Patel",
      timestamp: "2026-02-26 10:12:30",
      ipAddress: "192.168.1.103",
      description: "Uploaded verification document for property listing",
    },
    {
      id: "6",
      action: "DELETE",
      entity: "Amenity",
      entityId: "amen_33333",
      performedBy: "Samim Raza",
      timestamp: "2026-02-25 16:22:10",
      ipAddress: "192.168.1.104",
      description: "Removed amenity from property due to unavailability",
    },
    {
      id: "7",
      action: "UPDATE",
      entity: "Package",
      entityId: "pkg_44444",
      performedBy: "Admin",
      timestamp: "2026-02-25 15:45:33",
      ipAddress: "192.168.1.50",
      description: "Updated package pricing and duration",
    },
    {
      id: "8",
      action: "CREATE",
      entity: "Inquiry",
      entityId: "inq_55555",
      performedBy: "User",
      timestamp: "2026-02-25 15:08:44",
      ipAddress: "192.168.1.104",
      description: "New inquiry created for property listing",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    action: "ALL",
    entity: "ALL",
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      appliedFilters.action === "ALL" || log.action === appliedFilters.action;
    const matchesEntity =
      appliedFilters.entity === "ALL" || log.entity === appliedFilters.entity;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Calculate stats
  const totalLogs = logs.length;
  const createLogs = logs.filter((log) => log.action === "CREATE").length;
  const updateLogs = logs.filter((log) => log.action === "UPDATE").length;
  const deleteLogs = logs.filter((log) => log.action === "DELETE").length;

  const handleApplyFilters = (filters: {
    action: string;
    entity: string;
  }) => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    setAppliedFilters({ action: "ALL", entity: "ALL" });
  };

  const removeFilter = (filterType: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [filterType]: "ALL",
    }));
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Platform activity and change tracking</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white rounded-[5px]">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Logs Card */}
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Logs</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {totalLogs}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Create Logs Card */}
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Create Actions</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {createLogs}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Update Logs Card */}
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Update Actions</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {updateLogs}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ArrowUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Delete Logs Card */}
          <Card className="p-6 rounded-[5px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Delete Actions</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                  {deleteLogs}
                </h3>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ArrowDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <Card className="p-6 rounded-[5px]">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by entity, user, ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-[5px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterModalOpen(true)}
              className="rounded-[5px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Applied Filters Display */}
          {(appliedFilters.action !== "ALL" || appliedFilters.entity !== "ALL") && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Applied Filters:</span>
              {appliedFilters.action !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.action}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("action")}
                  />
                </Badge>
              )}
              {appliedFilters.entity !== "ALL" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[5px]"
                >
                  {appliedFilters.entity}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeFilter("entity")}
                  />
                </Badge>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Clear all
              </Button>
            </div>
          )}
        </Card>

        {/* Logs Table */}
        <Card className="p-6 rounded-[5px]">
          <AdminAuditLogList logs={filteredLogs} onViewLog={setSelectedLog} />
        </Card>

        {/* Log Details Modal */}
        {selectedLog && (
          <Card className="border-2 border-green-600 p-6 rounded-[5px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedLog.action} - {selectedLog.entity}
                </h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedLog(null)}
                className="rounded-[5px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">Action Type</p>
                  <Badge
                    className={`mt-2 ${getActionColor(selectedLog.action)}`}
                  >
                    {selectedLog.action}
                  </Badge>
                </div>

                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">Entity Type</p>
                  <p className="font-semibold mt-2">{selectedLog.entity}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">Entity ID</p>
                  <p className="font-mono text-sm mt-2">{selectedLog.entityId}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">Performed By</p>
                  <p className="font-semibold mt-2">{selectedLog.performedBy}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">Timestamp</p>
                  <p className="font-semibold mt-2">{selectedLog.timestamp}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">IP Address</p>
                  <p className="font-mono text-sm mt-2">{selectedLog.ipAddress}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">Request ID</p>
                  <p className="font-mono text-sm mt-2">
                    REQ-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-[5px]">
                  <p className="text-sm text-gray-600 font-semibold">User Agent</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Mozilla/5.0 (Windows NT 10.0; Win64; x64)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-[5px] border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold mb-2">
                Description
              </p>
              <p className="text-gray-700">{selectedLog.description}</p>
            </div>
          </Card>
        )}
      </div>

      {/* Filter Modal */}
      <AdminAuditLogFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </AdminDashboardLayout>
  );
}
