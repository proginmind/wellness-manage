"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Profile } from "@/types/profile";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { dateToInputValue } from "@/lib/utils/date-helpers";
import { type ProfileFormValues } from "@/lib/validations/profile";
import { ProfileForm } from "@/components/profile-form";
import { Card, CardContent } from "@/components/ui/card";

// Convert Profile to ProfileFormValues for form population
function profileToFormValues(profile: Profile): ProfileFormValues {
  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    description: profile.description || "",
    dateOfBirth: profile.dateOfBirth ? dateToInputValue(new Date(profile.dateOfBirth)) : "",
    phoneNumber: profile.phoneNumber || "",
    avatarImage: profile.avatarImage || "",
  };
}

// Mutation function for updating profile
async function updateProfile(url: string, { arg }: { arg: ProfileFormValues }) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  return response.json();
}

export default function EditProfilePage() {
  const router = useRouter();

  // Fetch profile data
  const { data, error, isLoading } = useSWR<{ profile: Profile }>("/api/profile", fetcher);

  // Setup mutation
  const { trigger: triggerUpdate, isMutating } = useSWRMutation("/api/profile", updateProfile, {
    onSuccess: () => {
      toast.success("Profile updated successfully", {
        description: "Your information has been updated.",
      });

      // Navigate to profile page
      router.push(buildRoute.settingsProfile());
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    },
    // Automatically revalidate related endpoints
    populateCache: false,
    revalidate: true,
  });

  const handleSubmit = async (formData: ProfileFormValues) => {
    await triggerUpdate(formData);
  };

  const handleCancel = () => {
    router.push(buildRoute.settingsProfile());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link
          href={buildRoute.settingsProfile()}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {error ? "Failed to load profile" : "Profile not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { profile } = data;
  const defaultValues = profileToFormValues(profile);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={buildRoute.settingsProfile()}
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">Update your personal information</p>
      </div>

      {/* Form */}
      <ProfileForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isMutating}
        onCancel={handleCancel}
      />
    </div>
  );
}
