import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="min-w-0 space-y-6 overflow-hidden">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your subscription, payment method, and billing history
        </p>
      </div>

      <div className="grid w-full min-w-0 grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Current Plan skeleton */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="min-w-0 flex-1">
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </div>
            <Skeleton className="h-6 w-14 shrink-0 self-start" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex min-w-0 flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
              <Skeleton className="h-9 w-full sm:w-32" />
              <Skeleton className="h-9 w-full sm:w-36" />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method skeleton */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="min-w-0 flex-1">
              <CardTitle>Payment method</CardTitle>
              <CardDescription>Card used for billing</CardDescription>
            </div>
            <Skeleton className="h-9 w-20 shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History skeleton */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
          <CardDescription>Invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12 ml-auto" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
