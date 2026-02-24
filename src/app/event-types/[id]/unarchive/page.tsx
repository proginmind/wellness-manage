"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { EventType } from "@/types/event-type";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function unarchiveEventTypeMutation(url: string) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive: true }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to unarchive event type");
  }

  return response.json();
}

export default function UnarchiveEventTypePage() {
  const params = useParams();
  const router = useRouter();
  const eventTypeId = params.id as string;

  const { data, error, isLoading } = useSWR<{ eventType: EventType }>(
    buildApiRoute.eventType(eventTypeId),
    fetcher
  );

  const { trigger: triggerUnarchive, isMutating: isUnarchiving } = useSWRMutation(
    buildApiRoute.eventType(eventTypeId),
    unarchiveEventTypeMutation,
    {
      onSuccess: () => {
        toast.success("Event type unarchived successfully", {
          description: `${data?.eventType.name} is now active.`,
        });
        router.push(buildRoute.eventType(eventTypeId));
      },
      onError: (error) => {
        console.error("Error unarchiving event type:", error);
        toast.error("Failed to unarchive event type", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
    }
  );

  const handleUnarchive = async () => {
    await triggerUnarchive();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href={buildRoute.eventTypes()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event Types
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                {error ? "Failed to load event type" : "Event type not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { eventType } = data;

  // If already active, show message
  if (eventType.isActive) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href={buildRoute.eventType(eventTypeId)}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event Type
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This event type is already active.
                </p>
                <Button asChild variant="outline">
                  <Link href={buildRoute.eventType(eventTypeId)}>View Event Type</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href={buildRoute.eventType(eventTypeId)}
          className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Event Type
        </Link>

        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Unarchive Event Type</CardTitle>
                <CardDescription>This action will mark the event type as active</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event Type Preview */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div
                className="w-1 h-16 rounded-full shrink-0"
                style={{ backgroundColor: eventType.color }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{eventType.name}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{eventType.duration} minutes</Badge>
                  <Badge variant="outline">${eventType.price}</Badge>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                What happens when you unarchive this event type?
              </h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
                <li>The event type will be marked as active</li>
                <li>It will be available for new bookings again</li>
                <li>It will appear in the active event types list</li>
                <li>All settings and configurations will be preserved</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" asChild disabled={isUnarchiving}>
                <Link href={buildRoute.eventType(eventTypeId)}>Cancel</Link>
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleUnarchive}
                disabled={isUnarchiving}
              >
                {isUnarchiving ? "Unarchiving..." : "Unarchive Event Type"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
