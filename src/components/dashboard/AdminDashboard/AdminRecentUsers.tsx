"use client";

import { Card } from "@/components/ui/card";
import { Users, Shield, Package, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "user" | "service";
  joinDate: string;
  status: "active" | "inactive" | "pending";
}

export default function AdminRecentUsers() {
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/users?pageSize=5&sortBy=createdAt&sortOrder=desc");
        if (response.data?.success && response.data?.data) {
          const users = response.data.data.map((user: any) => {
            // Determine primary role from roles array
            const roles = user.roles || [];
            let role: "owner" | "user" | "service" = "user";
            if (roles.includes("OWNER")) role = "owner";
            else if (roles.includes("SERVICE")) role = "service";
            
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role,
              joinDate: user.createdAt?.split("T")[0] || new Date().toISOString().split("T")[0],
              status: (user.status || "ACTIVE").toLowerCase() as "active" | "inactive" | "pending",
            };
          });
          setRecentUsers(users);
        }
      } catch (err) {
        console.error("Error fetching recent users:", err);
        setRecentUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Shield className="w-4 h-4" />;
      case "service":
        return <Package className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-green-100 text-green-700";
      case "service":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Property Owner";
      case "service":
        return "Service Provider";
      default:
        return "Tenant";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700";
      case "pending":
        return "bg-yellow-50 text-yellow-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
        <Link href="/admin/dashboard/users" className="text-sm text-green-600 hover:text-green-700 font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-[5px] animate-pulse">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : recentUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found</div>
        ) : (
          recentUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-[5px] hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                {getRoleIcon(user.role) && (
                  <span className="text-white">{getRoleIcon(user.role)}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
              <span className="text-xs text-gray-500">{new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))
        )}
      </div>
    </Card>
  );
}
