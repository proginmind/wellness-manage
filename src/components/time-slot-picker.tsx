"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/segmented-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface StaffAssignedService {
  id: string;
  name: string;
  color?: string;
}

export interface SlotStaff {
  id: string;
  displayName: string;
  email?: string;
  profileUrl?: string;
  avatarUrl?: string;
  hasServedClient: boolean;
  isQualifiedForService: boolean;
  assignedServices: StaffAssignedService[];
}

export type StaffSlotTab = "qualified" | "all";

const STAFF_SLOT_OPTIONS = [
  { value: "qualified" as const, label: "Qualified for service" },
  { value: "all" as const, label: "All staff available" },
];

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
  onClearSelection?: () => void;
  isLoading?: boolean;
  className?: string;
}

function filterStaffForTab(staff: SlotStaff[], tab: StaffSlotTab): SlotStaff[] {
  if (tab === "all") return staff;
  return staff.filter((s) => s.isQualifiedForService);
}

export function TimeSlotPicker({
  slots,
  selectedTime,
  selectedStaffId,
  onSelect,
  onClearSelection,
  isLoading,
  className,
}: TimeSlotPickerProps) {
  const [staffTab, setStaffTab] = React.useState<StaffSlotTab>("qualified");

  const handleTabChange = (tab: StaffSlotTab) => {
    setStaffTab(tab);
    if (!selectedTime || !selectedStaffId) return;
    const slot = slots.find((s) => s.time === selectedTime);
    const staff = slot ? filterStaffForTab(slot.staff, tab) : [];
    if (!staff.some((s) => s.id === selectedStaffId)) {
      onClearSelection?.();
    }
  };

  const filteredSlots = React.useMemo(() => {
    return slots
      .map((slot) => ({
        ...slot,
        staff: filterStaffForTab(slot.staff, staffTab),
      }))
      .filter((slot) => slot.staff.length > 0);
  }, [slots, staffTab]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
        <div className="h-10 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <p className="text-sm font-medium">Available times</p>
        <SegmentedControl
          value={staffTab}
          onChange={handleTabChange}
          options={STAFF_SLOT_OPTIONS}
        />
      </div>

      {!filteredSlots.length ? (
        <p className="text-sm text-muted-foreground">
          {staffTab === "qualified"
            ? "No qualified staff available for this date."
            : "No staff available for this date."}
        </p>
      ) : (
        <ul className="space-y-2">
          {filteredSlots.map((slot) => (
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
                                {staffTab === "all" &&
                                  s.assignedServices.map((service) => (
                                    <Badge
                                      key={service.id}
                                      variant="outline"
                                      className="text-xs shrink-0"
                                      style={
                                        service.color
                                          ? {
                                              borderColor: service.color,
                                              color: service.color,
                                            }
                                          : undefined
                                      }
                                    >
                                      {service.name}
                                    </Badge>
                                  ))}
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
      )}
    </div>
  );
}
