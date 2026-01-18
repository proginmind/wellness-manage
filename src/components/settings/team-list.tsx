"use client";

import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User, Mail, Calendar, Plus } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import { PermissionGate } from "../PermissionGate";

interface StaffMember {
  id: string;
  userId: string;
  email: string;
  role: "owner" | "staff";
  createdAt: string;
}

export function TeamList() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, error, isLoading } = useSWR<{ staff: StaffMember[]; total: number }>(
    `/api/staff${debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ""}`,
    fetcher
  );

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
        <PermissionGate resource="invitations" action="create">
          <Button asChild>
            <Link href="/settings/invitations/new">
              <Plus className="h-4 w-4 mr-2" />
              Invite Staff
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {/* Loading State */}
      {isLoading && (
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
      {!isLoading && !error && staff.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-zinc-500 dark:text-zinc-400">
            {searchQuery ? "No staff members found matching your search" : "No staff members yet"}
          </CardContent>
        </Card>
      )}

      {/* Staff List */}
      {!isLoading && !error && staff.length > 0 && (
        <div className="flex flex-col gap-4">
          {staff.map((member) => {
            // Extract name from email (before @)
            const displayName = member.email.split("@")[0];
            const initials = displayName.slice(0, 2).toUpperCase();

            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Name */}
                      <div className="font-medium text-zinc-900 dark:text-white truncate mb-1">
                        {displayName}
                      </div>

                      {/* Email & Role */}
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>

                      {/* Role Badge & Date */}
                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Total Count */}
      {!isLoading && !error && staff.length > 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {staff.length} {staff.length === 1 ? "staff member" : "staff members"}
          {searchQuery && " found"}
        </p>
      )}
    </div>
  );
}
