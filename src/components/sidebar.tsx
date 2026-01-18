"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
  },
];

interface SidebarContentProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

function SidebarContent({ collapsed = false, onCollapse }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={cn(
        "flex items-center px-4 py-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
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
          const isActive = pathname === item.href;
          
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
        {/* Settings */}
        <Link
          href="/settings/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname?.startsWith("/settings")
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
        <form action="/auth/signout" method="post">
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
        "flex h-screen flex-col bg-white transition-all dark:bg-zinc-950",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
    </aside>
  );
}
