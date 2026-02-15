"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

import { VisitFormValues } from "@/lib/validations/visit";
import { AppLayout } from "@/components/app-layout";
import { VisitForm } from "@/components/visit-form";

export default function NewVisitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: VisitFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create visit");
      }

      const result = await response.json();

      // Invalidate visits cache to refetch with new visit
      mutate("/api/visits");
      mutate((key) => typeof key === "string" && key.startsWith("/api/visits"));

      toast.success("Visit created successfully", {
        description: "The visit has been scheduled.",
      });

      // Redirect to visit details page
      router.push(`/visits/${result.visit.id}`);
    } catch (error) {
      console.error("Error creating visit:", error);
      toast.error("Failed to create visit", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/visits"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Visits
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Visit</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fill in the information to add a new visit to the wellness center
          </p>
        </div>

        {/* Form */}
        <VisitForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/visits")}
        />
      </div>
    </AppLayout>
  );
}
