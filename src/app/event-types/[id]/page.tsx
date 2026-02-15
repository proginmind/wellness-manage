import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  XCircle,
} from "lucide-react";

import { requireAuth } from "@/lib/auth";
import { buildRoute } from "@/lib/routes";
import { getCurrentUserProfile, getEventType } from "@/lib/supabase/queries";
import { AppLayout } from "@/components/app-layout";
import { PermissionGate } from "@/components/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EventTypeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventTypeDetailPage({ params }: EventTypeDetailPageProps) {
  const { id } = await params;
  // Get authenticated user
  const user = await requireAuth();

  // Get user's profile and organization
  const profile = await getCurrentUserProfile(user.id);

  // Fetch event type
  const eventType = await getEventType(id, profile.organizationId);

  if (!eventType) {
    notFound();
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={buildRoute.eventTypes()}
            className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event Types
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Color indicator */}
              <div
                className="w-2 h-16 rounded-full shrink-0"
                style={{ backgroundColor: eventType.color }}
              />

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {eventType.name}
                </h1>
                {eventType.category && (
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: eventType.category.color }}
                    />
                    <p className="text-gray-600 dark:text-gray-400">{eventType.category.name}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PermissionGate resource="event_types" action="update">
                <Button asChild variant="outline">
                  <Link href={buildRoute.eventTypeEdit(eventType.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </PermissionGate>

              <PermissionGate resource="event_types" action="update">
                {eventType.isActive ? (
                  <Button asChild variant="outline" className="text-red-600 hover:text-red-700">
                    <Link href={buildRoute.eventTypeArchive(eventType.id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="text-green-600 hover:text-green-700">
                    <Link href={buildRoute.eventTypeUnarchive(eventType.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unarchive
                    </Link>
                  </Button>
                )}
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Basic information about this service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {eventType.description && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {eventType.description}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Status Badges */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {eventType.isActive ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}

                    {eventType.isBookable && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Online Booking Available
                      </Badge>
                    )}

                    {eventType.requiresApproval && (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Requires Approval
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Duration & Buffers */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Time Configuration
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Prep Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium">{eventType.bufferBefore} min</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Duration</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium">{eventType.duration} min</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Cleanup Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium">{eventType.bufferAfter} min</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
                    Total time slot:{" "}
                    <span className="font-medium">
                      {eventType.bufferBefore + eventType.duration + eventType.bufferAfter} minutes
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Rules Card */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Rules</CardTitle>
                <CardDescription>Advance booking and scheduling requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Minimum Notice
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {eventType.minAdvanceBookingHours} hours before
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Maximum Advance Booking
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {eventType.maxAdvanceBookingDays
                        ? `${eventType.maxAdvanceBookingDays} days`
                        : "No limit"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <DollarSign className="h-5 w-5 text-zinc-400" />
                  <span className="text-3xl font-bold">{eventType.price.toFixed(2)}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-1">
                    {eventType.currency}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Created</p>
                  <p className="font-medium">
                    {new Date(eventType.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Last Updated</p>
                  <p className="font-medium">
                    {new Date(eventType.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-zinc-500 dark:text-zinc-400">Color Code</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <p className="font-mono text-xs">{eventType.color}</p>
                  </div>
                </div>
                {eventType.category && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-zinc-500 dark:text-zinc-400">Category</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700"
                          style={{ backgroundColor: eventType.category.color }}
                        />
                        <Link
                          href={buildRoute.eventCategory(eventType.category.id)}
                          className="font-medium hover:underline"
                        >
                          {eventType.category.name}
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
