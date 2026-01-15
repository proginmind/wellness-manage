"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";

interface StatsResponse {
  total: number;
  active: number;
  newThisMonth: number;
  archived: number;
}

export function DashboardStats() {
  const { data, error, isLoading } = useSWR<StatsResponse>(
    "/api/stats",
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <p className="text-center text-red-500 dark:text-red-400">
              Failed to load statistics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = data || { total: 0, active: 0, newThisMonth: 0, archived: 0 };

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          <span className="text-2xl">👥</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {stats.total === 0 ? "No members yet" : "Registered members"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          <span className="text-2xl">✅</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.active}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Currently active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          <span className="text-2xl">📈</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newThisMonth}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Joined this month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Archived</CardTitle>
          <span className="text-2xl">📦</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.archived}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Archived members
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
