import { Calendar, DollarSign, Users } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/currency";
import {
  getActiveStaffCount,
  getCurrentUserProfile,
  getMemberStats,
  getMonthlyRevenue,
  getOrganizationById,
  getUpcomingVisits,
} from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function KpiSection() {
  // Fetch auth + profile + org in parallel — profile is cached via React cache()
  // so sub-components calling getCurrentUserProfile concurrently share the result
  const user = await requireAuth();
  const [userProfile] = await Promise.all([getCurrentUserProfile(user.id)]);
  const org = await getOrganizationById(userProfile.organizationId);

  const [memberStats, upcomingVisits, monthlyRevenue, activeStaff] = await Promise.all([
    getMemberStats(userProfile.organizationId),
    getUpcomingVisits(),
    getMonthlyRevenue(),
    getActiveStaffCount(),
  ]);

  const currency = org?.currency ?? "USD";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{memberStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {memberStats.active} active, {memberStats.archived} archived
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Visits</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingVisits.length}</div>
          <p className="text-xs text-muted-foreground">Next 7 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue, currency)}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeStaff}</div>
          <p className="text-xs text-muted-foreground">Team members</p>
        </CardContent>
      </Card>
    </div>
  );
}
