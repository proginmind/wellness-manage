"use client";

import { format } from "date-fns";
import { User } from "lucide-react";
import useSWR from "swr";

import { Profile } from "@/types/profile";
import { fetcher } from "@/lib/fetcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileContent() {
  const { data, isLoading, error } = useSWR<{ profile: Profile }>("/api/profile", fetcher);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500 dark:text-red-400">
            Failed to load profile information
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 w-32 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded-full mx-auto ring-4 ring-zinc-100 dark:ring-zinc-800" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.profile) {
    return null;
  }

  const profile = data.profile;
  const fullName =
    profile.firstName && profile.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.firstName || profile.lastName || "Not set";

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your personal details and bio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Avatar - Always show */}
            <div className="flex justify-center">
              <Avatar className="h-32 w-32 ring-4 ring-zinc-100 dark:ring-zinc-800">
                {profile.avatarImage && <AvatarImage src={profile.avatarImage} alt={fullName} />}
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800">
                  <User className="h-16 w-16 text-zinc-400" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-3">
              {/* Name */}
              {(profile.firstName || profile.lastName) && (
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{fullName}</span>
                </div>
              )}

              {/* Email */}
              <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-sm font-medium">Email:</span>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                >
                  {profile.email}
                </a>
              </div>

              {/* Phone Number */}
              {profile.phoneNumber && (
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-sm font-medium">Phone:</span>
                  <a
                    href={`tel:${profile.phoneNumber}`}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {profile.phoneNumber}
                  </a>
                </div>
              )}

              {/* Date of Birth */}
              {profile.dateOfBirth && (
                <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-sm font-medium">Date of Birth:</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {format(new Date(profile.dateOfBirth), "PPP")}
                  </span>
                </div>
              )}

              {/* Description */}
              {profile.description && (
                <div className="pt-2">
                  <span className="text-sm font-medium block mb-2">About:</span>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {profile.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-sm font-medium">User ID:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                {profile.userId.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-sm font-medium">Role:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">
                {profile.role}
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-sm font-medium">Account Created:</span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {format(new Date(profile.createdAt), "PPP")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
