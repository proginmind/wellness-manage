"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Mail, Search } from "lucide-react";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { StaffProfileWithEventTypes } from "@/lib/supabase/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PermissionGate } from "../PermissionGate";

type StaffMember = StaffProfileWithEventTypes;

interface TeamListProps {
  fallbackData?: { staff: StaffMember[]; total: number };
}

export function TeamList({ fallbackData }: TeamListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const apiUrl =
    buildApiRoute.profiles() +
    `?include=eventTypes` +
    (debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : "");

  const { data, error } = useSWR<{ staff: StaffMember[]; total: number }>(apiUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: debouncedSearch ? undefined : fallbackData,
  });

  const staff = data?.staff || [];

  return (
    <div className="space-y-4">
      {/* Search & Invite Button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Loading State */}
      {!data && !error && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
                    <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center text-zinc-500 dark:text-zinc-400">
            Failed to load staff members
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {data && !error && staff.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-zinc-500 dark:text-zinc-400">
            {searchQuery ? "No staff members found matching your search" : "No staff members yet"}
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      {data && !error && staff.length > 0 && (
        <div className="flex flex-col gap-4">
          {staff.map((member) => {
            // Determine display name
            const fullName =
              member.firstName && member.lastName
                ? `${member.firstName} ${member.lastName}`
                : member.firstName || member.lastName || member.email.split("@")[0];
            const initials =
              member.firstName && member.lastName
                ? `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
                : fullName.slice(0, 2).toUpperCase();

            return (
              <Link href={buildRoute.teamMember(member.id)} key={member.id}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        {member.avatarImage && (
                          <AvatarImage src={member.avatarImage} alt={fullName} />
                        )}
                        <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <div className="font-medium text-zinc-900 dark:text-white truncate mb-1">
                          {fullName}
                        </div>

                        {/* Email & Role */}
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>

                        {/* Role Badge & Date */}
                        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                          <Badge
                            variant={member.role === "owner" ? "default" : "secondary"}
                            className="capitalize text-xs"
                          >
                            {member.role}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {format(new Date(member.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>

                        {/* Event Types / Services */}
                        {member.eventTypes && member.eventTypes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {member.eventTypes.map((eventType) => (
                              <Badge
                                key={eventType.id}
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: eventType.color,
                                  color: eventType.color,
                                }}
                              >
                                {eventType.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {member.role === "staff" &&
                          (!member.eventTypes || member.eventTypes.length === 0) && (
                            <div className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-2">
                              No services assigned
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Total Count */}
      {data && !error && staff.length > 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {staff.length} {staff.length === 1 ? "staff member" : "staff members"}
          {searchQuery && " found"}
        </p>
      )}
    </div>
  );
}
