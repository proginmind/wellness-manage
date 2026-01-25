import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar } from "lucide-react";
import { Invitation, InvitationStatus } from "@/types";

interface InvitationCardProps {
  invitation: Invitation;
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const getStatusVariant = (status: InvitationStatus) => {
    switch (status) {
      case "accepted":
        return "default";
      case "expired":
        return "secondary";
      case "pending":
      default:
        return "outline";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Email & Info */}
          <div className="flex-1 min-w-0">
            {/* Email */}
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
              <span className="font-medium text-zinc-900 dark:text-white truncate">
                {invitation.email}
              </span>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>
                Invited {format(new Date(invitation.createdAt), "MMM d, yyyy")}
              </span>
            </div>

            {/* Expires Date (if pending) */}
            {invitation.status === "pending" && invitation.expiresAt && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <span>
                  Expires {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>

          {/* Right: Status Badge */}
          <Badge
            variant={getStatusVariant(invitation.status)}
            className="capitalize shrink-0"
          >
            {invitation.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
