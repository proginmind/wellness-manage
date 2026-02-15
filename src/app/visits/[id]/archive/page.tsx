"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle, ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { Member } from "@/types/member";
import { Visit } from "@/types/visit";
import { fetcher } from "@/lib/fetcher";
import { buildApiRoute, buildRoute } from "@/lib/routes";
import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function archiveVisitMutation(url: string) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: "cancelled" }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to archive visit");
  }

  return response.json();
}

export default function ArchiveVisitPage() {
  const params = useParams();
  const router = useRouter();
  const visitId = params.id as string;

  const { data, error, isLoading } = useSWR<{ visit: Visit; member: Member }>(
    buildApiRoute.visit(visitId),
    fetcher
  );

  const { trigger: triggerArchive, isMutating: isArchiving } = useSWRMutation(
    buildApiRoute.visit(visitId),
    archiveVisitMutation,
    {
      onSuccess: () => {
        toast.success("Visit archived successfully", {
          description: "The visit has been cancelled.",
        });
        router.push(buildRoute.visit(visitId));
      },
      onError: (error) => {
        console.error("Error archiving visit:", error);
        toast.error("Failed to archive visit", {
          description: error instanceof Error ? error.message : "Please try again later",
        });
      },
    }
  );

  const handleArchive = async () => {
    await triggerArchive();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
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
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href={buildRoute.visits()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Visits
          </Link>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                {error ? "Failed to load visit" : "Visit not found"}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const { visit, member } = data;
  const memberInitials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  // If already cancelled, show message
  if (visit.status === "cancelled") {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            href={buildRoute.visit(visitId)}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Visit
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This visit is already cancelled.
                </p>
                <Button asChild variant="outline">
                  <Link href={buildRoute.visit(visitId)}>View Visit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href={buildRoute.visit(visitId)}
          className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Visit
        </Link>

        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Archive Visit</CardTitle>
                <CardDescription>This action will cancel the visit</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Visit Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              {/* Member Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  {member.image && (
                    <AvatarImage
                      src={member.image}
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                  )}
                  <AvatarFallback>{memberInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                </div>
              </div>

              {/* Visit Details */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(visit.date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{format(new Date(visit.time), "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{visit.eventTypeName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{visit.eventTypeDuration} min</span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                What happens when you archive this visit?
              </h4>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                <li>The visit will be marked as cancelled</li>
                <li>It will be removed from upcoming visits</li>
                <li>The time slot will become available again</li>
                <li>This action cannot be easily undone</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" asChild disabled={isArchiving}>
                <Link href={buildRoute.visit(visitId)}>Cancel</Link>
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleArchive}
                disabled={isArchiving}
              >
                {isArchiving ? "Archiving..." : "Archive Visit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
