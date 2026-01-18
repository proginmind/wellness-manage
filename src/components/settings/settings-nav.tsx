"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsOwner } from "@/hooks/usePermissions";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
}

const navigationItems: NavItem[] = [
  {
    href: "/settings/profile",
    label: "My Profile",
    icon: UserCircle,
  },
  {
    href: "/settings/organization",
    label: "Organization",
    icon: Building2,
  },
  {
    href: "/settings/team",
    label: "Team",
    icon: Users,
    ownerOnly: true,
  },
];

export function SettingsNav() {
  const pathname = usePathname();
  const isOwner = useIsOwner();

  // Filter items based on permissions
  const visibleItems = navigationItems.filter(
    (item) => !item.ownerOnly || isOwner
  );

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
