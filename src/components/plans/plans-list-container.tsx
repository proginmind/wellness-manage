"use client";

import { toast } from "sonner";

import type { Plan } from "@/types/plan";
import { PlanCard } from "@/components/plans/plan-card";

interface PlansListContainerProps {
  plans: Plan[];
  activePlanId: string | null;
}

export function PlansListContainer({ plans, activePlanId }: PlansListContainerProps) {
  const handleSelect = (planId: string) => {
    toast.success("Plan selected", {
      description: "Upgrade flow will be implemented soon.",
    });
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
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
