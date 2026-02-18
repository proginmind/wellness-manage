import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, DollarSign, Users } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import {
  getActiveStaffCount,
  getMemberStats,
  getMonthlyRevenue,
  getRevenueByCategoryDistribution,
  getRevenueChartData,
  getUpcomingVisits,
  getVisitStatusDistribution,
} from "@/lib/supabase/queries";
import { AppLayout } from "@/components/app-layout";
import { DonutChart } from "@/components/donut-chart";
import { RevenueChart } from "@/components/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch all dashboard data in parallel
  const [
    memberStats,
    upcomingVisits,
    monthlyRevenue,
    activeStaff,
    chartData,
    visitStatusData,
    revenueByCategoryData,
  ] = await Promise.all([
    getMemberStats(),
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.email}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
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

        {/* Upcoming Visits Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Visits</CardTitle>
            <CardDescription>Next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming visits scheduled</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingVisits.map(({ visit, member }) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <Link
                          href={buildRoute.visit(visit.id)}
                          className="hover:underline text-blue-600 dark:text-blue-400"
                        >
                          {format(new Date(visit.date), "MMM d, yyyy")}
                        </Link>
                      </TableCell>
                      <TableCell>{format(new Date(visit.time), "h:mm a")}</TableCell>
                      <TableCell>
                        <Link
                          href={buildRoute.member(member.id)}
                          className="hover:underline text-blue-600 dark:text-blue-400"
                        >
                          {member.firstName} {member.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{visit.eventTypeName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{visit.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Donut Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <DonutChart
            data={visitStatusData}
            title="Visit Status Distribution"
            description="All visits breakdown"
            valueFormat="number"
          />
          <DonutChart
            data={revenueByCategoryData}
            title="Revenue by Category"
            description="Completed visits"
            valueFormat="currency"
          />
        </div>

        {/* Revenue Chart */}
        <RevenueChart data={chartData} />
      </div>
    </AppLayout>
  );
}
