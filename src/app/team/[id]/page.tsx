"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Edit, Layers, Mail } from "lucide-react";
import useSWR from "swr";

import { ProfileWithEventTypes } from "@/types/profile-event-type";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { PermissionGate } from "@/components/PermissionGate";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TeamMemberDetailPage() {
  const params = useParams();
  const profileId = params.id as string;

  const { data, error, isLoading } = useSWR<{ profile: ProfileWithEventTypes }>(
    buildApiRoute.teamMemberApi(profileId),
    fetcher
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href={buildRoute.team()}
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Team
            </Link>
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 dark:text-gray-400">
                  {error ? "Failed to load team member" : "Team member not found"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { profile } = data;
  const displayName = profile.email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={buildRoute.team()}
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Team
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Team Member Details
              </h1>
              <PermissionGate resource="staff" action="update">
                <Button variant="outline" asChild>
                  <Link href={buildRoute.teamMemberEdit(profileId)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Services
                  </Link>
                </Button>
              </PermissionGate>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{displayName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={profile.role === "owner" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {profile.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {profile.email}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Membership Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date Joined</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(profile.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qualified Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Qualified Services</CardTitle>
                <Badge variant="outline">{profile.eventTypes.length} services</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {profile.eventTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No services assigned yet</p>
                  <PermissionGate resource="staff" action="update">
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href={buildRoute.teamMemberEdit(profileId)}>Assign Services</Link>
                    </Button>
                  </PermissionGate>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {profile.eventTypes.map((eventType) => (
                    <div
                      key={eventType.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div
                        className="w-1 h-12 rounded-full shrink-0"
                        style={{ backgroundColor: eventType.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {eventType.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {eventType.categoryName && (
                            <>
                              <span className="text-xs">{eventType.categoryName}</span>
                              <Separator orientation="vertical" className="h-3" />
                            </>
                          )}
                          <Clock className="h-3 w-3" />
                          <span>{eventType.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
