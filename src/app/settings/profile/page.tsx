import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";

import { buildRoute } from "@/lib/routes";
import { ProfileContent } from "@/components/profile-content";
import { ChangePasswordCard } from "@/components/settings/change-password-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Profile",
};

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your personal account information
          </p>
        </div>
        <Link href={buildRoute.settingsProfileEdit()}>
          <Button>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <ProfileContent />
      <ChangePasswordCard />
    </div>
  );
}
