"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { fetcher } from "@/lib/fetcher";
import { Member } from "@/types/member";
import { ArrowLeft, Edit, Archive, Mail, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { format, differenceInYears } from "date-fns";

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
      // Automatically revalidate related endpoints
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
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Members
            </Link>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Member Details
              </h1>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href={`/members/${memberId}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                {member.status === "active" && (
                  <Button
                    variant="destructive"
                    onClick={() => setIsArchiveDialogOpen(true)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Member Profile Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  {member.image && <AvatarImage src={member.image} alt={`${member.firstName} ${member.lastName}`} />}
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {member.firstName} {member.lastName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <MemberStatusBadge status={member.status} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Member ID: {member.id}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 shrink-0">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(member.dateOfBirth), "MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Age: {age} years
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Information */}
          <Card>
            <CardHeader>
              <CardTitle>Membership Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 shrink-0">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date Joined</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(member.dateJoined), "MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Member for {differenceInYears(new Date(), new Date(member.dateJoined))} years
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive {data?.member.firstName} {data?.member.lastName}?
              This will remove them from the active members list. You can restore them later if needed.
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
