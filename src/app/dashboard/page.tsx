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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.email}</p>
        </div>

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
