"use client";

import { PermissionGate } from "@/components/PermissionGate";
import { InvitationCard } from "@/components/invitation-card";
import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { Invitation } from "@/types/invitation";
import { Plus } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

export default function InvitationsPage() {
  const {
    data,
    error,
    isLoading,
  } = useSWR<{ invitations: Invitation[]; total: number }>(
    "/api/invitations",
    fetcher
  );

  const invitations = data?.invitations || [];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Invitations
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Manage staff invitations
            </p>
          </div>
        </div>
        <p className="text-center text-red-500 dark:text-red-400">
          Error fetching invitations: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Invite Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Invitations
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage staff invitations
          </p>
        </div>
        <PermissionGate resource="invitations" action="create">
          <Button asChild>
            <Link href="/settings/invitations/new">
              <Plus className="h-4 w-4 mr-2" />
              Invite Staff
            </Link>
          </Button>
        </PermissionGate>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Loader />
      )}

      {/* Empty State */}
      {!isLoading && invitations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            No invitations sent yet.
          </p>
          <PermissionGate resource="invitations" action="create">
            <Button asChild>
              <Link href="/settings/invitations/new">
                <Plus className="h-4 w-4 mr-2" />
                Send First Invitation
              </Link>
            </Button>
          </PermissionGate>
        </div>
      )}

      {/* Invitations List */}
      {!isLoading && invitations.length > 0 && (
        <div className="flex flex-col gap-4">
          {invitations.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} />
          ))}
        </div>
      )}
    </div>
  );
}
