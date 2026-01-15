"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { MemberForm } from "@/components/member-form";
import { type MemberFormValues } from "@/lib/validations/member";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { mutate } from "swr";

export default function NewMemberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: MemberFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create member");
      }

      const result = await response.json();

      // Invalidate members cache to refetch with new member
      mutate("/api/members");
      mutate((key) => typeof key === "string" && key.startsWith("/api/members"));

      toast.success("Member created successfully", {
        description: `${result.member.firstName} ${result.member.lastName} has been added to the system.`,
      });

      // Redirect to members page
      router.push("/members");
    } catch (error) {
      console.error("Error creating member:", error);
      toast.error("Failed to create member", {
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
            href="/members"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Member
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fill in the information to add a new member to the wellness center
          </p>
        </div>

        {/* Form */}
        <MemberForm
          mode="create"
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => router.push("/members")}
        />
      </div>
    </AppLayout>
  );
}
