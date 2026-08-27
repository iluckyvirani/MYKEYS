"use client";

import { useEffect, useState } from "react";
import { Home, Building, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserDTO } from "@/types/auth";
import { api } from "@/lib/api";
import {
  getStoredUserFromLocalStorage,
  setStoredUser,
  userHasRole,
} from "@/lib/auth/storedUser";

interface RoleSwitcherProps {
  currentRole: "user" | "owner" | "service";
  onSwitch: (role: "user" | "owner" | "service") => void;
}

export default function RoleSwitcher({
  currentRole,
  onSwitch,
}: RoleSwitcherProps) {
  const router = useRouter();
  const isOwner = currentRole === "owner";
  const isService = currentRole === "service";
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
  const hasServiceRole = userHasRole(user, "SERVICE");

  const availableRoles = [
    hasUserRole ? "USER" : null,
    hasOwnerRole ? "OWNER" : null,
    hasServiceRole ? "SERVICE" : null,
  ].filter(Boolean);

  if (availableRoles.length < 2) {
    return null;
  }

  const handleRoleChange = (role: "user" | "owner" | "service") => {
    onSwitch(role);
    router.push(`/${role}/dashboard`);
  };

  const getRoleIcon = (role: "user" | "owner" | "service") => {
    switch (role) {
      case "owner":
        return <Building className="w-5 h-5 text-blue-600" />;
      case "service":
        return <Wrench className="w-5 h-5 text-purple-600" />;
      default:
        return <Home className="w-5 h-5 text-green-600" />;
    }
  };

  const getRoleLabel = (role: "user" | "owner" | "service") => {
    switch (role) {
      case "owner":
        return "Seller/Landlord";
      case "service":
        return "Professional/Associates";
      default:
        return "Tenant";
    }
  };

  const getRoleDescription = (role: "user" | "owner" | "service") => {
    switch (role) {
      case "owner":
        return "Manage your properties and bookings";
      case "service":
        return "Manage your services and bookings";
      default:
        return "Manage your bookings and inquiries";
    }
  };

  return (
    <div className="mb-5 p-4 bg-white rounded-[5px] shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isOwner ? "bg-blue-100" : isService ? "bg-purple-100" : "bg-green-100"
            }`}
          >
            {getRoleIcon(currentRole)}
          </div>

          <div>
            <h3 className="font-semibold">{getRoleLabel(currentRole)}</h3>
            <p className="text-sm text-gray-500">
              {getRoleDescription(currentRole)}
            </p>
          </div>
        </div>

        {availableRoles.length > 1 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 space-x-3">
              {hasUserRole && (
                <button
                  type="button"
                  onClick={() => handleRoleChange("user")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentRole === "owner"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Seller/Landlord
                </button>
              )}
              {hasServiceRole && (
                <button
                  type="button"
                  onClick={() => handleRoleChange("service")}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    currentRole === "service"
                      ? "bg-purple-100 text-purple-700 border border-purple-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Professional
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
