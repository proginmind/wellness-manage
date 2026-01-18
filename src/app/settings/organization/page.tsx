"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { useOrganizationPermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { Building2, Users, Calendar } from "lucide-react";
import { useState } from "react";

export default function OrganizationSettingsPage() {
  const { user, isLoading } = useUser();
  const { canUpdate } = useOrganizationPermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [orgName, setOrgName] = useState("");

  const organization = user?.organization;
  const profile = user?.profile;

  // Initialize org name when data loads
  if (organization && !orgName && !isEditing) {
    setOrgName(organization.name);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your organization settings
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your organization settings
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-zinc-500 dark:text-zinc-400">
              Organization not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    // TODO: Implement organization update API
    console.log("Save organization:", orgName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setOrgName(organization.name);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Organization</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your organization settings
        </p>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-zinc-500" />
                  <span className="text-lg font-medium">{organization.name}</span>
                </div>
                {canUpdate && (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="flex items-center justify-between py-3 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span>Created</span>
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {format(new Date(organization.createdAt), "PPP")}
            </span>
          </div>

          {/* Organization ID */}
          <div className="flex items-center justify-between py-3 border-t">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Organization ID
            </span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
              {organization.id.slice(0, 8)}...
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Organization Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Overview of your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-500" />
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Role
              </p>
              <p className="text-2xl font-bold capitalize">{profile?.role || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
