"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { differenceInYears, format } from "date-fns";
import { Archive, ArrowLeft, Calendar, Edit, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Member } from "@/types/member";
import { fetcher } from "@/lib/fetcher";
import { buildRoute } from "@/lib/routes";
import { useTrialGuard } from "@/hooks/useTrialGuard";
import { AppLayout } from "@/components/app-layout";
import { MemberStatusBadge } from "@/components/member-status-badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { VisitHistoryCard } from "@/components/visit-history-card";

async function archiveMember(url: string) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "archived" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to archive member");
  }

  return response.json();
}

export default function MemberDetailPage() {
  const params = useParams();
  const memberId = params.id as string;
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const { data, error, isLoading } = useSWR<{ member: Member }>(
    `/api/members/${memberId}`,
    fetcher
  );
  useTrialGuard(error);

  const { trigger: triggerArchive, isMutating: isArchiving } = useSWRMutation(
    `/api/members/${memberId}`,
    archiveMember,
    {
      onSuccess: () => {
        toast.success("Member archived successfully", {
          description: `${data?.member.firstName} ${data?.member.lastName} has been archived.`,
        });
      },
      onError: (error) => {
        console.error("Error archiving member:", error);
        toast.error("Failed to archive member", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
      populateCache: false,
      revalidate: true,
    }
  );

  const handleArchive = async () => {
    try {
      await triggerArchive();
    } catch {
      // Error already handled by onError callback
    } finally {
      setIsArchiveDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Link
            href={buildRoute.members()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Clients
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                {error ? "Failed to load client" : "Client not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { member } = data;
  const age = differenceInYears(new Date(), new Date(member.dateOfBirth));
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={buildRoute.members()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Clients
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar className="h-16 w-16">
                {member.image && (
                  <AvatarImage src={member.image} alt={`${member.firstName} ${member.lastName}`} />
                )}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {member.firstName} {member.lastName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <MemberStatusBadge status={member.status} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={buildRoute.memberEdit(member.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>

              {member.status === "active" && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setIsArchiveDialogOpen(true)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Client profile and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">First Name</p>
                    <p className="font-medium">{member.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Last Name</p>
                    <p className="font-medium">{member.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Email</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                    >
                      {member.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Phone</p>
                    {member.phoneNumber ? (
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                      >
                        {member.phoneNumber}
                      </a>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Date of Birth</p>
                    <p className="font-medium">
                      {format(new Date(member.dateOfBirth), "MMMM d, yyyy")}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Age: {age} years
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <VisitHistoryCard memberId={member.id} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Joined</p>
                  <p className="font-medium">
                    {new Date(member.dateJoined).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Client ID</p>
                  <p className="font-mono text-xs">{member.id}</p>
                </div>
                {member.archivedAt && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">Archived</p>
                      <p className="font-medium">
                        {new Date(member.archivedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {data?.member.firstName} {data?.member.lastName}?
              This will remove them from the active clients list. You can restore them later if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
