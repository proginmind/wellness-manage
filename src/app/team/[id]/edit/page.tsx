"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock, Layers, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import { EventTypesListResponse } from "@/types/api";
import { EventType } from "@/types/event-type";
import { ProfileWithEventTypes } from "@/types/profile-event-type";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

async function assignEventTypeMutation(url: string, { arg }: { arg: { eventTypeId: string } }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventTypeId: arg.eventTypeId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to assign service");
  }

  return response.json();
}

async function removeEventTypeMutation(url: string, { arg }: { arg: { eventTypeId: string } }) {
  const urlWithQuery = `${url}?eventTypeId=${arg.eventTypeId}`;
  const response = await fetch(urlWithQuery, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to remove service");
  }

  return response.json();
}

export default function TeamMemberEditPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const { data: profileData, isLoading: profileLoading } = useSWR<{
    profile: ProfileWithEventTypes;
  }>(buildApiRoute.teamMemberApi(profileId), fetcher);

  const { data: eventTypesData, isLoading: eventTypesLoading } = useSWR<EventTypesListResponse>(
    buildApiRoute.eventTypes() + "?is_active=true",
    fetcher
  );

  const { trigger: triggerAssign, isMutating: isAssigning } = useSWRMutation(
    buildApiRoute.teamMemberEventTypes(profileId),
    assignEventTypeMutation,
    {
      onSuccess: () => {
        toast.success("Service assigned successfully");
        mutate(buildApiRoute.teamMemberApi(profileId));
      },
      onError: (error) => {
        toast.error("Failed to assign service", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      },
    }
  );

  const { trigger: triggerRemove, isMutating: isRemoving } = useSWRMutation(
    buildApiRoute.teamMemberEventTypes(profileId),
    removeEventTypeMutation,
    {
      onSuccess: () => {
        toast.success("Service removed successfully");
        mutate(buildApiRoute.teamMemberApi(profileId));
      },
      onError: (error) => {
        toast.error("Failed to remove service", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      },
    }
  );

  const handleAssign = async (eventTypeId: string) => {
    await triggerAssign({ eventTypeId });
  };

  const handleRemove = async (eventTypeId: string) => {
    await triggerRemove({ eventTypeId });
  };

  const isLoading = profileLoading || eventTypesLoading;
  const isMutating = isAssigning || isRemoving;

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

  if (!profileData || !eventTypesData) {
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
                <p className="text-center text-gray-500 dark:text-gray-400">Failed to load data</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { profile } = profileData;
  const displayName = profile.email.split("@")[0];

  const assignedEventTypeIds = new Set(profile.eventTypes.map((et) => et.id));
  const availableEventTypes = eventTypesData.eventTypes.filter(
    (et) => !assignedEventTypeIds.has(et.id)
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={buildRoute.teamMember(profileId)}
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Details
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Services
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Managing services for {displayName}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Services */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Assigned Services
              </CardTitle>
              <CardDescription>
                Services this team member is currently qualified to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.eventTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No services assigned yet</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {profile.eventTypes.map((eventType) => (
                    <div
                      key={eventType.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(eventType.id)}
                        disabled={isMutating}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Available Services
              </CardTitle>
              <CardDescription>
                Click to assign additional services to this team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableEventTypes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Layers className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>All services are already assigned</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {availableEventTypes.map((eventType) => (
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
                          <Clock className="h-3 w-3" />
                          <span>{eventType.duration} min</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAssign(eventType.id)}
                        disabled={isMutating}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" asChild>
              <Link href={buildRoute.teamMember(profileId)}>Done</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
