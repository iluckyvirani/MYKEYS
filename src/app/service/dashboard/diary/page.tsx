"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DiaryManager from "@/components/dashboard/DiaryManager";

export default function ServiceDiaryPage() {
  return (
    <DashboardLayout defaultRole="service">
      <DiaryManager />
    </DashboardLayout>
  );
}
