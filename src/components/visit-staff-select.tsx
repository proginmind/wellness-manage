"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useSWR from "swr";

import type { StaffListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/segmented-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type StaffSlotTab = "qualified" | "all";

const STAFF_SLOT_OPTIONS = [
  { value: "qualified" as const, label: "Qualified for service" },
  { value: "all" as const, label: "All staff available" },
];

interface StaffProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarImage?: string;
  eventTypes?: Array<{ id: string; name: string; color?: string }>;
}

function staffDisplayName(member: StaffProfile): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return member.email.split("@")[0] ?? "Staff";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] ?? "").toUpperCase() + (parts[parts.length - 1][0] ?? "").toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

interface VisitStaffSelectProps {
  eventTypeId: string;
  value?: string;
  onChange: (staffId: string | undefined) => void;
  className?: string;
}

export function VisitStaffSelect({
  eventTypeId,
  value,
  onChange,
  className,
}: VisitStaffSelectProps) {
  const [staffTab, setStaffTab] = React.useState<StaffSlotTab>("qualified");

  const { data, isLoading } = useSWR<StaffListResponse>(
    `${buildApiRoute.profiles()}?include=eventTypes`,
    fetcher
  );

  const allStaff = (data?.staff ?? []) as StaffProfile[];
  const qualified = allStaff.filter((s) => s.eventTypes?.some((et) => et.id === eventTypeId));
  const displayedStaff = staffTab === "qualified" ? qualified : allStaff;

  const handleTabChange = (tab: StaffSlotTab) => {
    setStaffTab(tab);
    if (!value) return;
    const list = tab === "qualified" ? qualified : allStaff;
    if (!list.some((s) => s.id === value)) {
      onChange(undefined);
    }
  };

  return (
    <FormItem className={cn(className)}>
      <FormLabel>Staff member</FormLabel>
      <FormControl>
        <div className="space-y-3">
          <SegmentedControl
            value={staffTab}
            onChange={handleTabChange}
            options={STAFF_SLOT_OPTIONS}
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-11 rounded-md bg-muted" />
              <div className="h-11 rounded-md bg-muted" />
            </div>
          ) : !displayedStaff.length ? (
            <p className="text-sm text-muted-foreground">
              {staffTab === "qualified"
                ? "No staff assigned to this service."
                : "No staff members found."}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {displayedStaff.map((member) => {
                const name = staffDisplayName(member);
                const isSelected = value === member.id;
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => onChange(member.id)}
                      className={cn(
                        "flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          {member.avatarImage ? (
                            <AvatarImage src={member.avatarImage} alt="" />
                          ) : null}
                          <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                          <span className="font-medium truncate">{name}</span>
                          {staffTab === "all" &&
                            member.eventTypes?.map((service) => (
                              <Badge
                                key={service.id}
                                variant="outline"
                                className="text-xs shrink-0"
                                style={
                                  service.color
                                    ? { borderColor: service.color, color: service.color }
                                    : undefined
                                }
                              >
                                {service.name}
                              </Badge>
                            ))}
                        </span>
                      </span>
                      <Link
                        href={buildRoute.teamMember(member.id)}
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
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function getStaffDisplayName(
  staff: StaffProfile[] | undefined,
  staffId: string | undefined
): string | undefined {
  if (!staffId || !staff) return undefined;
  const member = staff.find((s) => s.id === staffId);
  return member ? staffDisplayName(member) : undefined;
}

export function getStaffAvatarUrl(
  staff: StaffProfile[] | undefined,
  staffId: string | undefined
): string | undefined {
  if (!staffId || !staff) return undefined;
  const member = staff.find((s) => s.id === staffId);
  return member?.avatarImage;
}
