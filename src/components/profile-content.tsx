"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/hooks/useUser";
import { format } from "date-fns";

export function ProfileContent() {
  const { user, isLoading, isError } = useUser();

  if (isError) {
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
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Email:</span>
            <a
              href={`mailto:${user.email}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              {user.email}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">User ID:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
              {user.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Account Created:</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {format(new Date(user.created_at), "PPP")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
