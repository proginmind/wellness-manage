"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { MemberForm } from "@/components/member-form";
import { Card, CardContent } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";
import { Member } from "@/types/member";
import { type MemberFormValues } from "@/lib/validations/member";
import { dateToInputValue } from "@/lib/utils/date-helpers";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Convert Member to MemberFormValues for form population
function memberToFormValues(member: Member): MemberFormValues {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    dateOfBirth: dateToInputValue(new Date(member.dateOfBirth)),
    dateJoined: dateToInputValue(new Date(member.dateJoined)),
    image: member.image || "",
  };
}

// Mutation function for updating member
async function updateMember(url: string, { arg }: { arg: MemberFormValues }) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update member");
  }

  return response.json();
}

export default function EditMemberPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  // Fetch member data
  const { data, error, isLoading } = useSWR<{ member: Member }>(
    `/api/members/${memberId}`,
    fetcher
  );

  // Setup mutation
  const { trigger: triggerUpdate, isMutating } = useSWRMutation(
    `/api/members/${memberId}`,
    updateMember,
    {
      onSuccess: (result) => {
        toast.success("Member updated successfully", {
          description: `${result.member.firstName} ${result.member.lastName}'s information has been updated.`,
        });

        // Navigate to detail page
        router.push(`/members/${memberId}`);
      },
      onError: (error) => {
        console.error("Error updating member:", error);
        toast.error("Failed to update member", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
      // Automatically revalidate related endpoints
      populateCache: false,
      revalidate: true,
    }
  );

  const handleSubmit = async (formData: MemberFormValues) => {
    await triggerUpdate(formData);
  };

  const handleCancel = () => {
    router.push(`/members/${memberId}`);
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
            href="/members"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                {error ? "Failed to load member" : "Member not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { member } = data;
  const defaultValues = memberToFormValues(member);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/members/${memberId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Member Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Member
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Update {member.firstName} {member.lastName}'s information
          </p>
        </div>

        {/* Form */}
        <MemberForm
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
