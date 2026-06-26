"use client";

import type { VisitBookingMode } from "@/lib/validations/visit";
import { SegmentedControl } from "@/components/segmented-control";

interface VisitBookingModeToggleProps {
  value: VisitBookingMode;
  onChange: (mode: VisitBookingMode) => void;
  disabled?: boolean;
  className?: string;
}

const BOOKING_MODE_OPTIONS = [
  { value: "guided" as const, label: "From availability" },
  { value: "manual" as const, label: "Manual entry" },
];

export function VisitBookingModeToggle({
  value,
  onChange,
  disabled,
  className,
}: VisitBookingModeToggleProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      options={BOOKING_MODE_OPTIONS}
      disabled={disabled}
      className={className}
    />
  );
}
