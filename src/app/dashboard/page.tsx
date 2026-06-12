import type { Metadata } from "next";

import { requireAuth } from "@/lib/auth";
import {
  getActiveStaffCount,
  getCurrentUserProfile,
  getMemberStats,
  getMonthlyRevenue,
  getOrganizationById,
  getRevenueByCategoryDistribution,
  getRevenueChartData,
  getUpcomingVisits,
  getVisitStatusDistribution,
} from "@/lib/supabase/queries";
import { requireTrialAccess } from "@/lib/trial-server";
import { AppLayout } from "@/components/app-layout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getCurrentUserProfile(user.id);
  await requireTrialAccess(profile.organizationId);

  const [
    org,
    memberStats,
    upcomingVisits,
    monthlyRevenue,
    activeStaff,
    revenueChart,
    visitStatus,
    revenueByCategory,
  ] = await Promise.all([
    getOrganizationById(profile.organizationId),
    getMemberStats(profile.organizationId),
    getUpcomingVisits(),
    getMonthlyRevenue(),
    getActiveStaffCount(),
    getRevenueChartData(),
    getVisitStatusDistribution(),
    getRevenueByCategoryDistribution(),
  ]);

  return (
    <AppLayout>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.email}`} />

      <div className="container mx-auto px-4 py-6">
        <DashboardContent
          fallbackData={{
            kpi: {
              memberStats,
              upcomingVisitsCount: upcomingVisits.length,
              monthlyRevenue,
              activeStaff,
            },
            currency: org?.currency ?? "USD",
            upcomingVisits,
            charts: {
              revenueChart,
              visitStatus,
              revenueByCategory,
            },
          }}
        />
      </div>
    </AppLayout>
  );
}
