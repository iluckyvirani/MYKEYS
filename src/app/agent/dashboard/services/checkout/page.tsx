"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ServiceCheckoutPage from "@/components/services/ServiceCheckoutPage";

export default function AgentServiceCheckoutRoute() {
  return (
    <DashboardLayout defaultRole="agent">
      <Suspense
        fallback={
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        }
      >
        <ServiceCheckoutPage backHref="/agent/dashboard/services" />
      </Suspense>
    </DashboardLayout>
  );
}
