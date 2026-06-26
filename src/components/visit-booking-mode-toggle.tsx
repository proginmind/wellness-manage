"use client";

import { cn } from "@/lib/utils";
import type { VisitBookingMode } from "@/lib/validations/visit";
import { Button } from "@/components/ui/button";

interface VisitBookingModeToggleProps {
  value: VisitBookingMode;
  onChange: (mode: VisitBookingMode) => void;
  disabled?: boolean;
  className?: string;
}

export function VisitBookingModeToggle({
  value,
  onChange,
  disabled,
  className,
}: VisitBookingModeToggleProps) {
  return (
    <div className={cn("flex rounded-lg border p-1 gap-1", className)}>
      <Button
        type="button"
        variant={value === "guided" ? "default" : "ghost"}
        size="sm"
        className="flex-1"
        disabled={disabled}
        onClick={() => onChange("guided")}
      >
        From availability
      </Button>
      <Button
        type="button"
        variant={value === "manual" ? "default" : "ghost"}
        size="sm"
        className="flex-1"
        disabled={disabled}
        onClick={() => onChange("manual")}
      >
        Manual entry
      </Button>
    </div>
  );
}
