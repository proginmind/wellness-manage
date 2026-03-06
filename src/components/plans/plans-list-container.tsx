"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Plan } from "@/types/plan";
import { buildApiRoute } from "@/lib/routes";
import { PlanCard } from "@/components/plans/plan-card";

interface PlansListContainerProps {
  plans: Plan[];
  activePlanId: string | null;
}

export function PlansListContainer({ plans, activePlanId }: PlansListContainerProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSelect = async (planId: string) => {
    setLoadingPlanId(planId);
    try {
      const res = await fetch(buildApiRoute.checkout(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: planId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "Failed to start checkout");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid checkout response");
      }
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setLoadingPlanId(null);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
        <p>No plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isActive={activePlanId === plan.id}
          isLoading={loadingPlanId === plan.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
