"use client";

import { Check } from "lucide-react";

import type { Plan } from "@/types/plan";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanCardProps {
  plan: Plan;
  isActive: boolean;
  onSelect: (planId: string) => void;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function PlanCard({ plan, isActive, onSelect }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        isActive &&
          "ring-2 ring-green-500 border-green-500 dark:ring-green-500 dark:border-green-500"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{plan.title}</CardTitle>
          <CardDescription className="mt-1">{plan.description}</CardDescription>
        </div>
        {isActive && (
          <Badge className="w-fit shrink-0 self-start bg-green-600 hover:bg-green-600">
            Active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatPrice(plan.price, plan.currency)}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{plan.currency}</span>
        </div>

        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
            >
              <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant={isActive ? "secondary" : "default"}
          className="w-full"
          onClick={() => onSelect(plan.id)}
          disabled={isActive}
        >
          {isActive ? "Current Plan" : "Select"}
        </Button>
      </CardContent>
    </Card>
  );
}
