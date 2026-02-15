import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  Calendar,
  CheckCircle,
  Clock,
  Clock3,
  Edit,
  FileText,
  User,
  XCircle,
} from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getVisitById } from "@/lib/supabase/queries";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface VisitDetailPageProps {
  params: Promise<{ id: string }>;
}

function getStatusBadge(status: string) {
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

export default async function VisitDetailPage({ params }: VisitDetailPageProps) {
  const { id } = await params;

  // Get authenticated user
  const user = await requireAuth();

  // Get user's profile and organization
  const profile = await getCurrentUserProfile(user.id);

  // Fetch visit with member details
  const result = await getVisitById(id, profile.organizationId);

  if (!result) {
    notFound();
  }

  const { visit, member } = result;
  const memberInitials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <AppLayout>
      <PageHeader
        title="Visit Details"
        backLink={{ href: buildRoute.visits(), label: "Back to Visits" }}
        action={
          <div className="flex items-center gap-2">
            {visit.status !== "cancelled" && (
              <>
                <PermissionGate resource="visits" action="update">
                  <Button asChild variant="outline">
                    <Link href={buildRoute.visitEdit(visit.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </PermissionGate>

                <PermissionGate resource="visits" action="archive">
                  <Button asChild variant="outline" className="text-red-600 hover:text-red-700">
                    <Link href={buildRoute.visitArchive(visit.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Link>
                  </Button>
                </PermissionGate>
              </>
            )}
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Overview */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Visit Overview</CardTitle>
                  {getStatusBadge(visit.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Date</span>
                    </div>
                    <p className="font-medium">
                      {format(new Date(visit.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span>Time</span>
                    </div>
                    <p className="font-medium">{format(new Date(visit.time), "h:mm a")}</p>
                  </div>
                </div>

                <Separator />

                {/* Service Details - using snapshot data from booking time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Service</p>
                    <p className="font-medium">{visit.eventTypeName}</p>
                    {visit.eventTypeCategory && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                        {visit.eventTypeCategory}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Duration & Price
                    </p>
                    <p className="font-medium">
                      {visit.eventTypeDuration} minutes • ${visit.eventTypePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {visit.notes && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                        <FileText className="h-4 w-4" />
                        <span>Notes</span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                        {visit.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Member Information */}
            <Card>
              <CardHeader>
                <CardTitle>Member Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-16 w-16">
                    {member.image && (
                      <AvatarImage
                        src={member.image}
                        alt={`${member.firstName} ${member.lastName}`}
                      />
                    )}
                    <AvatarFallback className="text-lg">{memberInitials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <Link
                      href={buildRoute.member(member.id)}
                      className="text-lg font-semibold hover:underline"
                    >
                      {member.firstName} {member.lastName}
                    </Link>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{member.email}</p>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <Link href={buildRoute.member(member.id)}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Visit ID</p>
                  <p className="font-mono text-xs">{visit.id}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Created</p>
                  <p className="font-medium">
                    {format(new Date(visit.createdAt), "MMM d, yyyy")}
                    <span className="text-zinc-400 ml-1">
                      at {format(new Date(visit.createdAt), "h:mm a")}
                    </span>
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(visit.updatedAt), "MMM d, yyyy")}
                    <span className="text-zinc-400 ml-1">
                      at {format(new Date(visit.updatedAt), "h:mm a")}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
