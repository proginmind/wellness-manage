import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, Clock3, User } from "lucide-react";

import { Member } from "@/types/member";
import { Visit } from "@/types/visit";
import { buildRoute } from "@/lib/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { VisitStatusBadge } from "@/components/visit-status-badge";

interface VisitCardProps {
  visit: Visit;
  member: Member;
}

export function VisitCard({ visit, member }: VisitCardProps) {
  const memberInitials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <Link href={buildRoute.visit(visit.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Left: Member Avatar & Name */}
            <div className="flex items-center gap-3 md:w-1/3">
              <Avatar className="h-10 w-10">
                {member.image && <AvatarImage src={member.image} alt={member.firstName} />}
                <AvatarFallback>{memberInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{member.email}</p>
              </div>
            </div>

            {/* Middle: Visit Details */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Date</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {format(new Date(visit.date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Time</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {format(new Date(visit.time), "h:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Service</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                    {visit.eventTypeName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock3 className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Duration</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {visit.eventTypeDuration} min
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Status */}
            <div className="flex items-center md:justify-end">
              <VisitStatusBadge status={visit.status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
