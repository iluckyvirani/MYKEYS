"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BookServicesMarketplace from "@/components/services/BookServicesMarketplace";

export default function UserServicesPage() {
  return (
    <DashboardLayout defaultRole="user">
      <BookServicesMarketplace
        roleLabel="your home"
        checkoutPath="/user/dashboard/services/checkout"
      />
    </DashboardLayout>
  );
}
