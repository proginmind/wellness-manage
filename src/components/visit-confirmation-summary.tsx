"use client";

import Link from "next/link";

import { buildRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] ?? "").toUpperCase() + (parts[parts.length - 1][0] ?? "").toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

interface ConfirmationSummaryProps {
  memberName: string;
  memberId?: string;
  memberEmail?: string;
  memberImage?: string;
  serviceName: string;
  eventTypeId?: string;
  date: string;
  time: string;
  staffName: string;
  staffId?: string;
  staffAvatarUrl?: string;
  notes?: string;
  className?: string;
}

export function ConfirmationSummary({
  memberName,
  memberId,
  memberEmail,
  memberImage,
  serviceName,
  eventTypeId,
  date,
  time,
  staffName,
  staffId,
  staffAvatarUrl,
  notes,
  className,
}: ConfirmationSummaryProps) {
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Confirm appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Client</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              {memberImage ? <AvatarImage src={memberImage} alt="" /> : null}
              <AvatarFallback className="text-sm">{initials(memberName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {memberId ? (
                <Link
                  href={buildRoute.member(memberId)}
                  className="font-medium underline-offset-4 hover:underline"
                  target="_blank"
                >
                  {memberName}
                </Link>
              ) : (
                <p className="font-medium">{memberName}</p>
              )}
              {memberEmail ? (
                <p className="text-sm text-muted-foreground truncate">{memberEmail}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Service</p>
          {eventTypeId ? (
            <Link
              href={buildRoute.eventType(eventTypeId)}
              className="font-medium underline-offset-4 hover:underline"
              target="_blank"
            >
              {serviceName}
            </Link>
          ) : (
            <p className="font-medium">{serviceName}</p>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Date & time</p>
          <p className="font-medium">
            {formattedDate} at {time}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Staff</p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              {staffAvatarUrl ? <AvatarImage src={staffAvatarUrl} alt="" /> : null}
              <AvatarFallback className="text-sm">{initials(staffName)}</AvatarFallback>
            </Avatar>
            {staffId ? (
              <Link
                href={buildRoute.teamMember(staffId)}
                className="font-medium underline-offset-4 hover:underline"
                target="_blank"
              >
                {staffName}
              </Link>
            ) : (
              <p className="font-medium">{staffName}</p>
            )}
          </div>
        </div>
        {notes && (
          <div>
            <p className="text-sm text-muted-foreground">Notes</p>
            <p className="font-medium">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
