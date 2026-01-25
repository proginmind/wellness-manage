import { Card, CardContent } from "@/components/ui/card";
import { Visit } from "@/types/visit";
import { User, Calendar, Clock, Mail } from "lucide-react";
import { differenceInYears, format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Member } from "@/types/member";

interface VisitCardProps {
  visit: Visit;
  member: Member;
}

export function VisitCard({ visit, member }: VisitCardProps) {
  if (!member) {
    return null;
  }

  return (
    <Link href={`/visits/${visit.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            <Avatar>
              <AvatarImage src={member?.image} alt={member?.firstName} />
              <AvatarFallback>{member?.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 truncate">
              {member?.firstName} {member?.lastName}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              <Mail className="h-4 w-4" />
              <span className="truncate">{member?.email}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{differenceInYears(new Date(), new Date(member?.dateOfBirth || ""))} years old</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Born {format(new Date(member?.dateOfBirth || ""), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Joined {format(new Date(member?.dateJoined || ""), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
