"use client";

import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback } from "react";
import { Search, Briefcase } from "lucide-react";
import { api } from "@/lib/api";

interface AgentRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string | null;
  totalProperties: number;
  status: string;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("pageSize", "50");
      if (searchTerm) params.append("search", searchTerm);
      const response = await api.get(`/admin/agents?${params.toString()}`);
      if (response.data?.success && response.data?.data?.items) {
        setAgents(response.data.data.items);
      } else {
        setAgents([]);
      }
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-600" /> Estate Agents
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Users with the Agent role and their listings
          </p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search agents…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 bg-gray-50">
                <th className="p-3 font-medium">Agent</th>
                <th className="p-3 font-medium">Agency</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Listings</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">
                        {agent.firstName} {agent.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{agent.email}</div>
                    </td>
                    <td className="p-3">{agent.companyName || "—"}</td>
                    <td className="p-3">{agent.phone || "—"}</td>
                    <td className="p-3">{agent.totalProperties}</td>
                    <td className="p-3">
                      <Badge variant="outline">{agent.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Button variant="outline" onClick={fetchAgents}>
          Refresh
        </Button>
      </div>
    </AdminDashboardLayout>
  );
}
