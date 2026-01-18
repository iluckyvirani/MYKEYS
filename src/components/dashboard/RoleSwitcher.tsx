"use client";

import { Label } from "@/components/ui/label";
import { Home, Building } from "lucide-react";
import { Switch } from "../ui/switch";
import { useRouter } from "next/navigation";

interface RoleSwitcherProps {
  currentRole: "user" | "owner";
  onSwitch: (role: "user" | "owner") => void;
}

export default function RoleSwitcher({
  currentRole,
  onSwitch,
}: RoleSwitcherProps) {
  const router = useRouter();
  const isOwner = currentRole === "owner";

  const handleRoleChange = (checked: boolean) => {
    const role = checked ? "owner" : "user";

    onSwitch(role);

    // 🔁 route change
    router.push(`/${role}/dashboard`);
  };

  return (
    <div className="mb-5 p-4 bg-white rounded-[5px] shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isOwner ? "bg-blue-100" : "bg-green-100"
            }`}
          >
            {isOwner ? (
              <Building className="w-5 h-5 text-blue-600" />
            ) : (
              <Home className="w-5 h-5 text-green-600" />
            )}
          </div>

          <div>
            <h3 className="font-semibold">
              {isOwner ? "Owner Dashboard" : "User Dashboard"}
            </h3>
            <p className="text-sm text-gray-500">
              {isOwner
                ? "Manage your properties and bookings"
                : "Manage your bookings and inquiries"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Home
              className={`w-4 h-4 ${
                !isOwner ? "text-green-600" : "text-gray-400"
              }`}
            />
            <Label htmlFor="role-switch" className="cursor-pointer">
              User
            </Label>
          </div>

          <Switch
            id="role-switch"
            checked={isOwner}
            onCheckedChange={handleRoleChange}
          />

          <div className="flex items-center gap-2">
            <Label htmlFor="role-switch" className="cursor-pointer">
              Owner
            </Label>
            <Building
              className={`w-4 h-4 ${
                isOwner ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
