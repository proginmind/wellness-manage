"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import useSWR from "swr";

import { MemberVisitsResponse, ProfileVisitsResponse } from "@/types/api";
import { Visit } from "@/types/visit";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitStatusBadge } from "@/components/visit-status-badge";

interface VisitHistoryRow {
  visit: Visit;
  clientName?: string;
}

type VisitHistoryCardProps =
  | { memberId: string; profileId?: never }
  | { profileId: string; memberId?: never };

function VisitHistoryItem({ visit, clientName }: VisitHistoryRow) {
  return (
    <Link href={buildRoute.visit(visit.id)} className="block">
      <div className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
            <span className="font-medium">{format(new Date(visit.date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
            <span>{format(new Date(visit.time), "h:mm a")}</span>
          </div>
          {clientName && (
            <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <User className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="truncate">{clientName}</span>
            </div>
          )}
          <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
            {visit.eventTypeName}
          </span>
        </div>
        <VisitStatusBadge status={visit.status} />
      </div>
    </Link>
  );
}

export function VisitHistoryCard(props: VisitHistoryCardProps) {
  const isStaff = "profileId" in props && props.profileId !== undefined;
  const apiUrl = isStaff
    ? buildApiRoute.profileVisits(props.profileId)
    : buildApiRoute.memberVisits(props.memberId);

  const { data: memberData, error: memberError } = useSWR<MemberVisitsResponse>(
    isStaff ? null : apiUrl,
    fetcher
  );
  const { data: staffData, error: staffError } = useSWR<ProfileVisitsResponse>(
    isStaff ? apiUrl : null,
    fetcher
  );

  const error = isStaff ? staffError : memberError;
  useTrialGuard(error);

  const rows: VisitHistoryRow[] | undefined = isStaff
    ? staffData?.visits.map(({ visit, member }) => ({
        visit,
        clientName: `${member.firstName} ${member.lastName}`,
      }))
    : memberData?.visits.map((visit) => ({ visit }));

  const total = isStaff ? staffData?.total : memberData?.total;

  if (!rows) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardContent>
      </Card>
    );
  }

  const emptyDescription = isStaff
    ? "No appointments recorded for this staff member"
    : "No appointments recorded for this client";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
        <CardDescription>
          {rows.length === 0 ? emptyDescription : `${total} appointment${total === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">No appointments yet</p>
            <Button asChild variant="outline" size="sm">
              <Link href={buildRoute.visitsNew()}>Book appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map(({ visit, clientName }) => (
              <VisitHistoryItem key={visit.id} visit={visit} clientName={clientName} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
