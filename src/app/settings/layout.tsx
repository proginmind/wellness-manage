"use client";

import { AppLayout } from "@/components/app-layout";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your account and organization settings
          </p>
        </div>

        {/* Tabs + Content */}
        <div className="flex flex-col gap-8">
          <SettingsNav />
          <main>{children}</main>
        </div>
      </div>
    </AppLayout>
  );
}
