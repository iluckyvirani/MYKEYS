"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BookServicesMarketplace from "@/components/services/BookServicesMarketplace";

export default function OwnerServicesPage() {
  return (
    <DashboardLayout defaultRole="agent">
      <BookServicesMarketplace roleLabel="your properties" />
    </DashboardLayout>
  );
}
