"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SlotStaff {
  id: string;
  displayName: string;
  profileUrl?: string;
  avatarUrl?: string;
  hasServedClient: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] ?? "").toUpperCase() + (parts[parts.length - 1][0] ?? "").toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export interface TimeSlotOption {
  time: string;
  staff: SlotStaff[];
}

interface TimeSlotPickerProps {
  slots: TimeSlotOption[];
  selectedTime: string | undefined;
  selectedStaffId: string | undefined;
  onSelect: (time: string, staffId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function TimeSlotPicker({
  slots,
  selectedTime,
  selectedStaffId,
  onSelect,
  isLoading,
  className,
}: TimeSlotPickerProps) {
  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    );
  }

  if (!slots.length) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No available time slots for this date.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">Available times</p>
      <ul className="space-y-2">
        {slots.map((slot) => (
          <li key={slot.time}>
            <Card>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">{slot.time}</p>
                <ul className="space-y-1.5">
                  {slot.staff.map((s) => {
                    const isSelected = selectedTime === slot.time && selectedStaffId === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(slot.time, s.id)}
                          className={cn(
                            "flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-accent"
                          )}
                        >
                          <span className="flex min-w-0 flex-1 items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              {s.avatarUrl ? <AvatarImage src={s.avatarUrl} alt="" /> : null}
                              <AvatarFallback className="text-xs">
                                {initials(s.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                              <span className="font-medium truncate">{s.displayName}</span>
                              {s.hasServedClient && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  Previously served
                                </Badge>
                              )}
                            </span>
                          </span>
                          <Link
                            href={buildRoute.teamMember(s.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-xs font-medium"
                          >
                            Details
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
