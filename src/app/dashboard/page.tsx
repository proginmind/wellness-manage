import { getUser, requireAuth } from "@/lib/auth";
import { useUser } from "@/hooks/useUser";
import { AppLayout } from "@/components/app-layout";
import { DashboardStats } from "@/components/dashboard-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  // Get user (middleware already ensured auth)
  const user = await requireAuth();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats />

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest wellness activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                <p>No activities recorded yet.</p>
                <p className="text-sm mt-2">Start tracking your wellness journey!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with wellness tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                📝 Log Activity
              </Button>
              <Button className="w-full justify-start" variant="outline">
                🎯 Set Goals
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📊 View Reports
              </Button>
              <Button className="w-full justify-start" variant="outline">
                ⚙️ Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
