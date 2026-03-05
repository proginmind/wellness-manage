"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";

import type { Subscription } from "@/types/billing";
import { formatCurrency } from "@/lib/currency";
import { buildRoute } from "@/lib/routes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CurrentPlanCardProps {
  subscription: Subscription | null;
  onCancelClick?: () => void;
}

function formatInterval(interval: string): string {
  if (interval === "one_time") return "Lifetime";
  if (interval === "month") return "month";
  if (interval === "year") return "year";
  return interval;
}

export function CurrentPlanCard({ subscription, onCancelClick }: CurrentPlanCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancel = () => {
    setShowCancelDialog(false);
    toast.info("Cancel subscription", {
      description: "This will be implemented with Stripe integration.",
    });
    onCancelClick?.();
  };

  if (!subscription) {
    return (
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>No active subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={buildRoute.settingsPlans()}>
              <CreditCard className="h-4 w-4 mr-2" />
              Choose a plan
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { plan, status } = subscription;
  const isActive = status === "active";

  return (
    <>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </div>
          {isActive && (
            <Badge className="w-fit shrink-0 self-start bg-green-600 hover:bg-green-600">
              Active
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-2xl font-bold">{plan.nickname}</span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {formatCurrency(plan.amount, plan.currency, { inCents: true })} /{" "}
              {formatInterval(plan.interval)}
            </span>
          </div>

          {subscription.currentPeriodEnd && subscription.plan.interval !== "one_time" && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}

          <div className="flex min-w-0 flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
            <Button asChild className="w-full sm:w-auto sm:shrink-0">
              <Link href={buildRoute.settingsPlans()} className="flex items-center justify-center">
                <CreditCard className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Manage plan</span>
              </Link>
            </Button>
            {isActive && (
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 sm:w-auto sm:shrink-0 dark:hover:bg-red-900/20"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Cancel subscription</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to premium
              features at the end of your billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
