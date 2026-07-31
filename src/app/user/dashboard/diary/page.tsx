"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DiaryManager from "@/components/dashboard/DiaryManager";

export default function UserDiaryPage() {
  return (
    <DashboardLayout defaultRole="user">
      <DiaryManager />
    </DashboardLayout>
  );
}
