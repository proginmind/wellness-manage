import Link from "next/link";
import { format } from "date-fns";

import { buildRoute } from "@/lib/routes";
import { getUpcomingVisits } from "@/lib/supabase/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function VisitsSection() {
  const upcomingVisits = await getUpcomingVisits();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Visits</CardTitle>
        <CardDescription>Next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingVisits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No upcoming visits scheduled</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingVisits.map(({ visit, member }) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <Link
                      href={buildRoute.visit(visit.id)}
                      className="hover:underline text-blue-600 dark:text-blue-400"
                    >
                      {format(new Date(visit.date), "MMM d, yyyy")}
                    </Link>
                  </TableCell>
                  <TableCell>{format(new Date(visit.time), "h:mm a")}</TableCell>
                  <TableCell>
                    <Link
                      href={buildRoute.member(member.id)}
                      className="hover:underline text-blue-600 dark:text-blue-400"
                    >
                      {member.firstName} {member.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>{visit.eventTypeName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{visit.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
