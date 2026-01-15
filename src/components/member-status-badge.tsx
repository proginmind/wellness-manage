import { Badge } from "@/components/ui/badge";
import { MemberStatus } from "@/types/member";

interface MemberStatusBadgeProps {
  status: MemberStatus;
}

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  switch (status) {
    case "active":
      return <Badge variant="secondary">Active</Badge>;
    
    case "archived":
      return <Badge variant="destructive">Archived</Badge>;
    
    default:
      // Exhaustive check - TypeScript will error if we miss a status
      const _exhaustiveCheck: never = status;
      return <Badge variant="outline">Unknown</Badge>;
  }
}
