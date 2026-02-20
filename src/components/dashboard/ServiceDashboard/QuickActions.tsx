"use client";

import {
  Plus,
  MessageSquare,
  Calendar,
  Settings,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const actions = [
    {
      icon: <Plus className="w-5 h-5" />,
      label: "Add New Service",
      href: "/service/dashboard/services/new",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Manage Messages",
      href: "/service/dashboard/messages",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: "View Calendar",
      href: "/service/dashboard/bookings",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Service Settings",
      href: "/service/dashboard/settings",
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: "View Invoices",
      href: "/service/dashboard/invoices",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "View Analytics",
      href: "/service/dashboard/analytics",
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all hover:border-green-200 ${action.color} hover:scale-105`}
          >
            {action.icon}
            <span className="text-sm font-medium text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
