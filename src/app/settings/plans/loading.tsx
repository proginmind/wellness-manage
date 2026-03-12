import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Choose the plan that best fits your wellness center
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Single plan card skeleton matching PlanCard layout */}
        <Card className="flex flex-col min-w-0 overflow-hidden">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-7 w-28" />
              {/* Active badge placeholder */}
              <Skeleton className="h-6 w-14" />
            </div>
            {/* Price */}
            <div className="flex items-baseline gap-1">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-2">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              What&apos;s included
            </p>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                <Skeleton className="h-4" style={{ width: `${60 + (i % 3) * 15}%` }} />
              </div>
            ))}
          </CardContent>

          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
