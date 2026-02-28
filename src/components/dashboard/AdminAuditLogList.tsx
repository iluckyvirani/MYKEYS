"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

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

interface AdminAuditLogListProps {
  logs: AuditLog[];
  onViewLog: (log: AuditLog) => void;
}

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

export default function AdminAuditLogList({
  logs,
  onViewLog,
}: AdminAuditLogListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Action
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Entity
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Performed By
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Timestamp
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              IP Address
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
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
              <td className="py-3 px-4 text-sm text-gray-600">
                {log.timestamp}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                {log.ipAddress}
              </td>
              <td className="py-3 px-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewLog(log)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {logs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No logs found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
