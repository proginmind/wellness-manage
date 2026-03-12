"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Folder,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";

import { buildApiRoute, buildRoute, isRouteActive } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";

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

interface SidebarContentProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

function SidebarContent({ collapsed = false, onCollapse }: SidebarContentProps) {
  const pathname = usePathname();
  const { trial } = useUser();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className={cn(
          "flex items-center px-4 py-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href={buildRoute.dashboard()} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <span className="text-lg font-bold">W</span>
            </div>
            <span className="text-lg font-semibold">Wellness</span>
          </Link>
        )}
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className={cn("h-8 w-8", collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 pt-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = !trial?.isExpired && pathname === item.href;

          if (trial?.isExpired) {
            return (
              <span
                key={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-not-allowed select-none",
                  "text-zinc-300 dark:text-zinc-600",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.title}</span>}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom menu */}
      <div className="p-2">
        {/* Trial badge */}
        {trial && (trial.isOnTrial || trial.isExpired) && (
          <Link
            href={buildRoute.settingsPlans()}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 mb-1 text-xs font-medium transition-colors",
              trial.isExpired
                ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                : trial.daysLeft <= 3
                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900",
              collapsed && "justify-center px-2"
            )}
            title={
              collapsed
                ? trial.isExpired
                  ? "Trial ended"
                  : `Trial: ${trial.daysLeft}d left`
                : undefined
            }
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
            {!collapsed && (
              <span>
                {trial.isExpired
                  ? "Trial ended"
                  : trial.daysLeft === 1
                    ? "Trial · 1 day left"
                    : `Trial · ${trial.daysLeft} days left`}
              </span>
            )}
          </Link>
        )}

        {/* Settings */}
        <Link
          href={buildRoute.settingsProfile()}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname && isRouteActive("/settings", pathname)
              ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="h-5 w-5" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* Sign out */}
        <form action={buildApiRoute.authSignout()} method="post">
          <Button
            type="submit"
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col bg-white transition-all dark:bg-zinc-950 border-r",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
    </aside>
  );
}
