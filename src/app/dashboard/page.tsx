import { Suspense } from "react";
import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/app-layout";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { KpiSection } from "@/components/dashboard/kpi-section";
import { ChartsSkeleton, KpiSkeleton, VisitsSkeleton } from "@/components/dashboard/skeletons";
import { VisitsSection } from "@/components/dashboard/visits-section";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.email}</p>
        </div>

        <div className="space-y-8">
          <Suspense fallback={<KpiSkeleton />}>
            <KpiSection />
          </Suspense>

          <Suspense fallback={<VisitsSkeleton />}>
            <VisitsSection />
          </Suspense>

          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsSection />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
