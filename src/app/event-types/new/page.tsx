"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import { buildApiRoute, buildRoute } from "@/lib/routes";
import { type EventTypeFormValues } from "@/lib/validations/event-type";
import { AppLayout } from "@/components/app-layout";
import { EventTypeForm } from "@/components/event-type-form";

// Mutation function for creating event type
async function createEventType(url: string, { arg }: { arg: EventTypeFormValues }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create event type");
  }

  return response.json();
}

export default function NewEventTypePage() {
  const router = useRouter();

  // Setup mutation
  const { trigger: triggerCreate, isMutating } = useSWRMutation(
    buildApiRoute.eventTypes(),
    createEventType,
    {
      onSuccess: (result) => {
        toast.success("Event type created successfully", {
          description: `${result.eventType.name} has been created.`,
        });

        // Navigate to the new event type detail page
        router.push(buildRoute.eventType(result.eventType.id));
      },
      onError: (error) => {
        console.error("Error creating event type:", error);
        toast.error("Failed to create event type", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
    }
  );

  const handleSubmit = async (formData: EventTypeFormValues) => {
    await triggerCreate(formData);
  };

  const handleCancel = () => {
    router.push(buildRoute.eventTypes());
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={buildRoute.eventTypes()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Service</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new service to your wellness center
          </p>
        </div>

        {/* Form */}
        <EventTypeForm
          mode="create"
          onSubmit={handleSubmit}
          isSubmitting={isMutating}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
}
