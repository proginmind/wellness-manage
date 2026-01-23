"use client";

import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Calendar, Link as LinkIcon, X, Loader2, Copy, Check } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { Invitation } from "@/types";

async function cancelInvitation(url: string) {
  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to cancel invitation");
  }

  return response.json();
}

export function PendingInvitationsList() {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<{ invitations: Invitation[] }>(
    "/api/invitations",
    fetcher
  );

  const { trigger: triggerCancel, isMutating: isCanceling } = useSWRMutation(
    cancelingId ? `/api/invitations/${cancelingId}` : null,
    cancelInvitation,
    {
      onSuccess: () => {
        toast.success("Invitation canceled");
        setCancelingId(null);
        mutate();
      },
      onError: (error) => {
        toast.error("Failed to cancel invitation", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
    }
  );

  const handleCopyLink = async (token: string, id: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedId(id);
      toast.success("Invitation link copied to clipboard");
      
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleCancelClick = (id: string) => {
    setCancelingId(id);
  };

  const handleCancelConfirm = async () => {
    if (cancelingId) {
      await triggerCancel();
    }
  };

  if (error) {
    return (
      <p className="text-center text-red-500 dark:text-red-400">
        Error fetching invitations: {error.message}
      </p>
    );
  }

  const invitations = data?.invitations || [];
  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return (
      <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
        No pending invitations.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {pendingInvitations.map((invitation) => {
          const isExpired = new Date(invitation.expiresAt) < new Date();
          const isCopied = copiedId === invitation.id;

          return (
            <Card key={invitation.id} className={isExpired ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Email */}
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                      <span className="font-medium text-zinc-900 dark:text-white truncate">
                        {invitation.email}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Invited {format(new Date(invitation.createdAt), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Expires {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isExpired && (
                      <Badge variant="secondary" className="mt-2">
                        Expired
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(invitation.token, invitation.id)}
                      disabled={isExpired}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelClick(invitation.id)}
                      disabled={isExpired}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelingId} onOpenChange={(open) => !open && setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} disabled={isCanceling}>
              {isCanceling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
