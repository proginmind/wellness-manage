import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function VisitDetailLoading() {
  return (
    <AppLayout>
      {/* Page Header */}
      <div className="border-b bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <Link
            href={buildRoute.visits()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visits
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Visit Details
            </h1>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Visit Overview</CardTitle>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Date</p>
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Time</p>
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Service</p>
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Duration & Price
                    </p>
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Member Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
