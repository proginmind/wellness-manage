"use client";

import useSWR from "swr";

import type { StaffListResponse } from "@/types/api";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  eventTypes?: Array<{ id: string; name: string }>;
}

function staffDisplayName(member: StaffProfile): string {
  const name = [member.firstName, member.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return member.email.split("@")[0] ?? "Staff";
}

interface VisitStaffSelectProps {
  eventTypeId: string;
  value?: string;
  onChange: (staffId: string) => void;
  className?: string;
}

export function VisitStaffSelect({
  eventTypeId,
  value,
  onChange,
  className,
}: VisitStaffSelectProps) {
  const { data, isLoading } = useSWR<StaffListResponse>(
    `${buildApiRoute.profiles()}?include=eventTypes`,
    fetcher
  );

  const allStaff = (data?.staff ?? []) as StaffProfile[];
  const qualified = allStaff.filter((s) => s.eventTypes?.some((et) => et.id === eventTypeId));
  const options = qualified.length > 0 ? qualified : allStaff;
  const showingFallback = qualified.length === 0 && allStaff.length > 0;

  return (
    <FormItem className={cn(className)}>
      <FormLabel>Staff member</FormLabel>
      <Select value={value ?? ""} onValueChange={onChange} disabled={isLoading}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Loading staff..." : "Select a staff member"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {options.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {staffDisplayName(member)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showingFallback && (
        <FormDescription>
          No staff assigned to this service — showing all team members.
        </FormDescription>
      )}
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
  const member = staff.find((s) => s.id === staffId) as StaffProfile & {
    avatarImage?: string;
  };
  return member?.avatarImage;
}
