"use client";

import { useUser } from "@/hooks/useUser";
import { AppLayout } from "@/components/app-layout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PageHeader } from "@/components/page-header";

export function DashboardPageClient() {
  const { user } = useUser();

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description={user ? `Welcome back, ${user.email}` : undefined}
      />

      <div className="container mx-auto px-4 py-6">
        <DashboardContent />
      </div>
    </AppLayout>
  );
}
