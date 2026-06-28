"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Folder,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";

import { buildApiRoute, buildRoute, isRouteActive } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const menuItems = [
  {
    title: "Dashboard",
    href: buildRoute.dashboard(),
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: buildRoute.members(),
    icon: UsersRound,
  },
  {
    title: "Staff",
    href: buildRoute.team(),
    icon: Users,
  },
  {
    title: "Appointments",
    href: buildRoute.visits(),
    icon: Calendar,
  },
  {
    title: "Services",
    href: buildRoute.eventTypes(),
    icon: Layers,
  },
  {
    title: "Categories",
    href: buildRoute.eventCategories(),
    icon: Folder,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { trial } = useUser();

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:hidden dark:bg-zinc-950">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link href={buildRoute.dashboard()} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
            <span className="text-lg font-bold">W</span>
          </div>
          <span className="text-lg font-semibold">Wellness</span>
        </Link>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="text-left">
              <Link
                href={buildRoute.dashboard()}
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
                  <span className="text-lg font-bold">W</span>
                </div>
                <span className="text-lg font-semibold">Wellness</span>
              </Link>
            </SheetTitle>
          </SheetHeader>

          <div className="flex h-[calc(100vh-5rem)] flex-col">
            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  !trial?.isExpired && !!pathname && isRouteActive(item.href, pathname);

                if (trial?.isExpired) {
                  return (
                    <span
                      key={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm cursor-not-allowed select-none",
                        "text-zinc-300 dark:text-zinc-600"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom menu */}
            <div className="border-t p-4 space-y-1">
              {/* Trial badge */}
              {trial && (trial.isOnTrial || trial.isExpired) && (
                <Link
                  href={buildRoute.settingsPlans()}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    trial.isExpired
                      ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                      : trial.daysLeft <= 3
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      trial.isExpired
                        ? "bg-red-500"
                        : trial.daysLeft <= 3
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    )}
                  />
                  <span>
                    {trial.isExpired
                      ? "Trial ended — Upgrade"
                      : trial.daysLeft === 1
                        ? "Trial · 1 day left"
                        : `Trial · ${trial.daysLeft} days left`}
                  </span>
                </Link>
              )}

              {/* Settings */}
              <Link
                href={buildRoute.settingsProfile()}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                  pathname && isRouteActive("/settings", pathname)
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>

              {/* Sign out */}
              <form action={buildApiRoute.authSignout()} method="post">
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-3 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm">Sign Out</span>
                </Button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
