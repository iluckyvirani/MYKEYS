"use client";

import { useEffect, useState } from "react";
import { Home, Building, Wrench, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserDTO } from "@/types/auth";
import { api } from "@/lib/api";
import {
  getStoredUserFromLocalStorage,
  setStoredUser,
  userHasRole,
} from "@/lib/auth/storedUser";
import type { DashboardPanelRole } from "@/lib/dashboard/DashboardContext";

interface RoleSwitcherProps {
  currentRole: DashboardPanelRole;
  onSwitch: (role: DashboardPanelRole) => void;
}

export default function RoleSwitcher({
  currentRole,
  onSwitch,
}: RoleSwitcherProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    const sync = async () => {
      const stored = getStoredUserFromLocalStorage();
      setUser(stored);

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await api.get("/auth/me");
        const me = res.data?.data;
        if (me?.roles) {
          setStoredUser(me);
          setUser(me);
        }
      } catch {
        // keep stored
      }
    };

    sync();
    const onUserUpdated = () => setUser(getStoredUserFromLocalStorage());
    window.addEventListener("mykeys:user-updated", onUserUpdated);
    window.addEventListener("storage", onUserUpdated);
    return () => {
      window.removeEventListener("mykeys:user-updated", onUserUpdated);
      window.removeEventListener("storage", onUserUpdated);
    };
  }, []);

  const hasUserRole = userHasRole(user, "USER") || Boolean(user);
  const hasOwnerRole = userHasRole(user, "OWNER");
  const hasAgentRole = userHasRole(user, "AGENT");
  const hasServiceRole = userHasRole(user, "SERVICE");

  const availableRoles = [
    hasUserRole ? "USER" : null,
    hasOwnerRole ? "OWNER" : null,
    hasAgentRole ? "AGENT" : null,
    hasServiceRole ? "SERVICE" : null,
  ].filter(Boolean);

  if (availableRoles.length < 2) {
    return null;
  }

  const handleRoleChange = (role: DashboardPanelRole) => {
    onSwitch(role);
    router.push(`/${role}/dashboard`);
  };

  const getRoleIcon = (role: DashboardPanelRole) => {
    switch (role) {
      case "owner":
        return <Building className="w-5 h-5 text-blue-600" />;
      case "agent":
        return <Briefcase className="w-5 h-5 text-amber-600" />;
      case "service":
        return <Wrench className="w-5 h-5 text-purple-600" />;
      default:
        return <Home className="w-5 h-5 text-green-600" />;
    }
  };

  const getRoleLabel = (role: DashboardPanelRole) => {
    switch (role) {
      case "owner":
        return "Seller/Landlord";
      case "agent":
        return "Estate Agent";
      case "service":
        return "Professional/Associates";
      default:
        return "Tenant";
    }
  };

  const getRoleDescription = (role: DashboardPanelRole) => {
    switch (role) {
      case "owner":
        return "Manage your properties and bookings";
      case "agent":
        return "Manage agency listings and inquiries";
      case "service":
        return "Manage your services and bookings";
      default:
        return "Manage your bookings and inquiries";
    }
  };

  const isOwner = currentRole === "owner";
  const isAgent = currentRole === "agent";
  const isService = currentRole === "service";

  return (
    <div className="mb-4 p-3 sm:p-4 bg-white rounded-[5px] shadow-sm border">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isOwner
                ? "bg-blue-100"
                : isAgent
                  ? "bg-amber-100"
                  : isService
                    ? "bg-purple-100"
                    : "bg-green-100"
            }`}
          >
            {getRoleIcon(currentRole)}
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold truncate">{getRoleLabel(currentRole)}</h3>
            <p className="text-sm text-gray-500 hidden sm:block">
              {getRoleDescription(currentRole)}
            </p>
          </div>
        </div>

        {availableRoles.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
              {hasUserRole && (
                <button
                  type="button"
                  onClick={() => handleRoleChange("user")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    currentRole === "user"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Tenant
                </button>
              )}
              {hasOwnerRole && (
                <button
                  type="button"
                  onClick={() => handleRoleChange("owner")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    currentRole === "owner"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Seller/Landlord
                </button>
              )}
              {hasAgentRole && (
                <button
                  type="button"
                  onClick={() => handleRoleChange("agent")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    currentRole === "agent"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Agent
                </button>
              )}
              {hasServiceRole && (
                <button
                  type="button"
                  onClick={() => handleRoleChange("service")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    currentRole === "service"
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Professional
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
