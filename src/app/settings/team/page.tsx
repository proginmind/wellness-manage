"use client";

import { redirect } from "next/navigation";

import { useIsOwner } from "@/hooks/usePermissions";
import { useUser } from "@/hooks/useUser";
import { Loader } from "@/components/loader";
import { TeamList } from "@/components/settings/team-list";

export default function TeamSettingsPage() {
  const { isLoading } = useUser();
  const isOwner = useIsOwner();

  // Redirect staff to profile page
  if (!isLoading && !isOwner) {
    redirect("/settings/profile");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            View and manage your organization&apos;s staff members
          </p>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          View and manage your organization&apos;s staff members
        </p>
      </div>

      <TeamList />
    </div>
  );
}
