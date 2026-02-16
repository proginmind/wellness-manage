"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Edit, Layers, Mail, Phone, User } from "lucide-react";
import useSWR from "swr";

import { ProfileWithEventTypes } from "@/types/profile-event-type";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { PermissionGate } from "@/components/PermissionGate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TeamMemberDetailPage() {
  const params = useParams();
  const profileId = params.id as string;

  const { data, error, isLoading } = useSWR<{ profile: ProfileWithEventTypes }>(
    buildApiRoute.profile(profileId),
    fetcher
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Link
            href={buildRoute.team()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
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
      </AppLayout>
    );
  }

  const { profile } = data;
  const fullName =
    profile.firstName && profile.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.firstName || profile.lastName || profile.email.split("@")[0];
  const initials =
    profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : fullName.slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={buildRoute.team()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Team
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-20 w-20 ring-4 ring-zinc-100 dark:ring-zinc-800">
                {profile.avatarImage && <AvatarImage src={profile.avatarImage} alt={fullName} />}
                <AvatarFallback className="text-2xl bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant={profile.role === "owner" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {profile.role}
                  </Badge>
                </div>
                {profile.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            <PermissionGate resource="staff" action="update">
              <Button asChild variant="outline">
                <Link href={buildRoute.teamMemberEdit(profileId)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How to reach this team member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Email</p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {profile.email}
                  </a>
                </div>
                {profile.phoneNumber && (
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Phone</p>
                    <a
                      href={`tel:${profile.phoneNumber}`}
                      className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      {profile.phoneNumber}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Qualified Services */}
            <Card>
              <CardHeader>
                <CardTitle>Qualified Services</CardTitle>
                <CardDescription>Services this team member can provide</CardDescription>
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

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Role</p>
                  <p className="font-medium capitalize">{profile.role}</p>
                </div>
                <Separator />
                {profile.dateOfBirth && (
                  <>
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">Date of Birth</p>
                      <p className="font-medium">{format(new Date(profile.dateOfBirth), "PPP")}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Joined</p>
                  <p className="font-medium">
                    {new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">User ID</p>
                  <p className="font-mono text-xs">{profile.userId}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Profile ID</p>
                  <p className="font-mono text-xs">{profile.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
