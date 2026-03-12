import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
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

export async function GET() {
  try {
    const result = await requirePermission("staff", "view");
    if (result instanceof NextResponse) return result;

    const { userId } = result;
    const profile = await getCurrentUserProfile(userId);
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
