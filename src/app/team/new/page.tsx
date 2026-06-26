"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWRMutation from "swr/mutation";

import { buildApiRoute, buildRoute } from "@/lib/routes";
import { type StaffFormValues } from "@/lib/validations/staff";
import { AppLayout } from "@/components/app-layout";
import { StaffForm } from "@/components/staff-form";

async function createStaff(url: string, { arg }: { arg: StaffFormValues }) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create staff member");
  }

  return response.json();
}

export default function NewTeamMemberPage() {
  const router = useRouter();

  const { trigger: triggerCreate, isMutating } = useSWRMutation(
    buildApiRoute.profiles(),
    createStaff,
    {
      onSuccess: (result) => {
        const name = [result.profile.firstName, result.profile.lastName].filter(Boolean).join(" ");
        toast.success("Staff member created", {
          description: name ? `${name} has been added.` : "Staff member has been added.",
        });
        router.push(buildRoute.teamMemberEdit(result.profile.id));
      },
      onError: (error) => {
        toast.error("Failed to create staff member", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
    }
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <Link
            href={buildRoute.team()}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Staff Member</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a staff profile for scheduling and appointments
          </p>
        </div>

        <StaffForm
          mode="create"
          onSubmit={(data) => triggerCreate(data)}
          isSubmitting={isMutating}
          onCancel={() => router.push(buildRoute.team())}
        />
      </div>
    </AppLayout>
  );
}
