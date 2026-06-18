"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  Archive,
  Calendar,
  CheckCircle,
  Clock,
  Clock3,
  Edit,
  FileText,
  XCircle,
} from "lucide-react";
import useSWR from "swr";

import { Member } from "@/types/member";
import { Profile } from "@/types/profile";
import { Visit } from "@/types/visit";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { AppLayout } from "@/components/app-layout";
import { CurrencyDisplay } from "@/components/currency-display";
import { PageHeader } from "@/components/page-header";
import { PermissionGate } from "@/components/PermissionGate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface VisitDetailResponse {
  visit: Visit;
  member: Member;
}

interface ProfileResponse {
  profile: Profile;
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

function VisitDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Appointment Overview</CardTitle>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Date</p>
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Time</p>
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Service</p>
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Duration & Price</p>
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function VisitDetailPageClient() {
  const params = useParams();
  const id = params.id as string;

  const { data, error } = useSWR<VisitDetailResponse>(buildApiRoute.visit(id), fetcher);

  const staffId = data?.visit.staffId;
  const { data: staffData } = useSWR<ProfileResponse>(
    staffId ? buildApiRoute.profile(staffId) : null,
    fetcher
  );

  useTrialGuard(error);

  const pageHeader = (
    <PageHeader
      title="Appointment Details"
      backLink={{ href: buildRoute.visits(), label: "Back to Appointments" }}
      action={
        data ? (
          <div className="flex items-center gap-2">
            {data.visit.status !== "cancelled" && (
              <>
                <PermissionGate resource="visits" action="update">
                  <Button asChild variant="outline">
                    <Link href={buildRoute.visitEdit(data.visit.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </PermissionGate>

                <PermissionGate resource="visits" action="archive">
                  <Button asChild variant="outline" className="text-red-600 hover:text-red-700">
                    <Link href={buildRoute.visitArchive(data.visit.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Link>
                  </Button>
                </PermissionGate>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        )
      }
    />
  );

  if (!data && !error) {
    return (
      <AppLayout>
        {pageHeader}
        <VisitDetailSkeleton />
      </AppLayout>
    );
  }

  if (error || !data) {
    const isNotFound = error && (error as { status?: number }).status === 404;

    return (
      <AppLayout>
        <PageHeader
          title="Appointment Details"
          backLink={{ href: buildRoute.visits(), label: "Back to Appointments" }}
        />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="pt-6 text-center text-zinc-500">
              {isNotFound ? "Appointment not found" : "Failed to load appointment"}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { visit, member } = data;
  const memberInitials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  const staffProfile = staffData?.profile ?? null;
  const staffName = staffProfile
    ? [staffProfile.firstName, staffProfile.lastName].filter(Boolean).join(" ") ||
      staffProfile.email
    : null;

  return (
    <AppLayout>
      {pageHeader}

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Appointment Overview</CardTitle>
                  {getStatusBadge(visit.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Service</p>
                    <p className="font-medium">{visit.eventTypeName}</p>
                    {visit.eventTypeCategoryName && (
                      <div className="flex items-center gap-2 mt-1">
                        {visit.eventTypeCategoryColor && (
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: visit.eventTypeCategoryColor }}
                          />
                        )}
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {visit.eventTypeCategoryName}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Duration & Price
                    </p>
                    <div className="font-medium">
                      {visit.eventTypeDuration} minutes •{" "}
                      <CurrencyDisplay
                        className="inline-block"
                        value={visit.eventTypePrice}
                        currency={visit.eventTypeCurrency ?? "USD"}
                      />
                    </div>
                  </div>
                </div>

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

            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
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

            {staffProfile && staffName && (
              <Card>
                <CardHeader>
                  <CardTitle>Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-16 w-16">
                      {staffProfile.avatarImage && (
                        <AvatarImage src={staffProfile.avatarImage} alt={staffName} />
                      )}
                      <AvatarFallback className="text-lg">
                        {staffName
                          .trim()
                          .split(/\s+/)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <Link
                        href={buildRoute.teamMember(staffProfile.id)}
                        className="text-lg font-semibold hover:underline"
                      >
                        {staffName}
                      </Link>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                        {staffProfile.role}
                      </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <Link href={buildRoute.teamMember(staffProfile.id)}>View Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Appointment ID</p>
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
