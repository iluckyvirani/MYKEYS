"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Filter, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      performedBy: "Admin",
      timestamp: "2026-02-26 09:45:12",
      ipAddress: "192.168.1.50",
      description: "Removed unused amenity from system",
    },
    {
      id: "7",
      action: "UPDATE",
      entity: "Package",
      entityId: "pkg_44444",
      performedBy: "Admin",
      timestamp: "2026-02-25 16:20:33",
      ipAddress: "192.168.1.50",
      description: "Updated package pricing and features",
    },
    {
      id: "8",
      action: "CREATE",
      entity: "Inquiry",
      entityId: "inq_55555",
      performedBy: "Neha Singh",
      timestamp: "2026-02-25 15:08:44",
      ipAddress: "192.168.1.104",
      description: "New inquiry created for property listing",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<"ALL" | "CREATE" | "UPDATE" | "DELETE">("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE":
        return "➕";
      case "UPDATE":
        return "✏️";
      case "DELETE":
        return "🗑️";
      default:
        return "📝";
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
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by entity, user, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={actionFilter === "ALL" ? "default" : "outline"}
                onClick={() => setActionFilter("ALL")}
                className={
                  actionFilter === "ALL" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                All Actions
              </Button>
              <Button
                variant={actionFilter === "CREATE" ? "default" : "outline"}
                onClick={() => setActionFilter("CREATE")}
                className={
                  actionFilter === "CREATE" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                Create
              </Button>
              <Button
                variant={actionFilter === "UPDATE" ? "default" : "outline"}
                onClick={() => setActionFilter("UPDATE")}
                className={
                  actionFilter === "UPDATE" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                Update
              </Button>
              <Button
                variant={actionFilter === "DELETE" ? "default" : "outline"}
                onClick={() => setActionFilter("DELETE")}
                className={
                  actionFilter === "DELETE" ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Entity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Performed By</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">IP Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{getActionIcon(log.action)}</span>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{log.entity}</div>
                      <div className="text-xs text-gray-600">{log.entityId}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{log.performedBy}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{log.timestamp}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No logs found matching your criteria</p>
            </div>
          )}
        </Card>

        {/* Log Details */}
        {selectedLog && (
          <Card className="border-2 border-green-600 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {getActionIcon(selectedLog.action)}
                  {selectedLog.action} - {selectedLog.entity}
                </h2>
              </div>
              <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                ✕
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">Action Type</p>
                  <Badge className={`mt-2 ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </Badge>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">Entity Type</p>
                  <p className="font-semibold mt-2">{selectedLog.entity}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">Entity ID</p>
                  <p className="font-mono text-sm mt-2">{selectedLog.entityId}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">Performed By</p>
                  <p className="font-semibold mt-2">{selectedLog.performedBy}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">Timestamp</p>
                  <p className="font-semibold mt-2">{selectedLog.timestamp}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">IP Address</p>
                  <p className="font-mono text-sm mt-2">{selectedLog.ipAddress}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">Request ID</p>
                  <p className="font-mono text-sm mt-2">REQ-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-semibold">User Agent</p>
                  <p className="text-xs text-gray-600 mt-2">Mozilla/5.0 (Windows NT 10.0; Win64; x64)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold mb-2">Description</p>
              <p className="text-gray-700">{selectedLog.description}</p>
            </div>
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
