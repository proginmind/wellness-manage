"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { EventType } from "@/types/event-type";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { type EventTypeFormValues } from "@/lib/validations/event-type";
import { AppLayout } from "@/components/app-layout";
import { EventTypeForm } from "@/components/event-type-form";
import { Card, CardContent } from "@/components/ui/card";

// Convert EventType to EventTypeFormValues for form population
function eventTypeToFormValues(eventType: EventType): EventTypeFormValues {
  return {
    name: eventType.name,
    description: eventType.description || "",
    color: eventType.color,
    category: eventType.category || "",
    duration: eventType.duration,
    bufferBefore: eventType.bufferBefore,
    bufferAfter: eventType.bufferAfter,
    price: eventType.price,
    currency: eventType.currency,
    isActive: eventType.isActive,
    isBookable: eventType.isBookable,
    requiresApproval: eventType.requiresApproval,
    maxAdvanceBookingDays: eventType.maxAdvanceBookingDays || null,
    minAdvanceBookingHours: eventType.minAdvanceBookingHours,
  };
}

// Mutation function for updating event type
async function updateEventType(url: string, { arg }: { arg: EventTypeFormValues }) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update event type");
  }

  return response.json();
}

export default function EditEventTypePage() {
  const params = useParams();
  const router = useRouter();
  const eventTypeId = params.id as string;

  // Fetch event type data
  const { data, error, isLoading } = useSWR<{ eventType: EventType }>(
    buildApiRoute.eventType(eventTypeId),
    fetcher
  );

  // Setup mutation
  const { trigger: triggerUpdate, isMutating } = useSWRMutation(
    buildApiRoute.eventType(eventTypeId),
    updateEventType,
    {
      onSuccess: (result) => {
        toast.success("Event type updated successfully", {
          description: `${result.eventType.name} has been updated.`,
        });

        // Navigate to detail page
        router.push(buildRoute.eventType(eventTypeId));
      },
      onError: (error) => {
        console.error("Error updating event type:", error);
        toast.error("Failed to update event type", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
      // Automatically revalidate related endpoints
      populateCache: false,
      revalidate: true,
    }
  );

  const handleSubmit = async (formData: EventTypeFormValues) => {
    await triggerUpdate(formData);
  };

  const handleCancel = () => {
    router.push(buildRoute.eventType(eventTypeId));
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href={buildRoute.eventTypes()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
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
  const defaultValues = eventTypeToFormValues(eventType);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={buildRoute.eventType(eventTypeId)}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event Type Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Event Type</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update {eventType.name}</p>
        </div>

        {/* Form */}
        <EventTypeForm
          mode="edit"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isMutating}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
}
