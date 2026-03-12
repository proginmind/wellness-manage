import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventTypeDetailLoading() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={buildRoute.eventTypes()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event Types
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Skeleton className="w-2 h-16 rounded-full shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Duration</p>
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Price</p>
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Status</p>
                  <Skeleton className="h-6 w-16" />
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Description</p>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
