import { CheckCircle, Clock3, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function VisitStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary">
          <Clock3 className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
