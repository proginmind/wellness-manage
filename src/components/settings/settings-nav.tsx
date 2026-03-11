"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, Mail, Receipt, UserCircle } from "lucide-react";

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
    href: "/settings/invitations",
    label: "Invitations",
    icon: Mail,
    ownerOnly: true,
  },
  {
    href: "/settings/billing",
    label: "Billing",
    icon: Receipt,
    ownerOnly: true,
  },
  {
    href: "/settings/plans",
    label: "Plans",
    icon: CreditCard,
    ownerOnly: true,
  },
];

export function SettingsNav() {
  const pathname = usePathname();
  const isOwner = useIsOwner();

  const visibleItems = navigationItems.filter((item) => !item.ownerOnly || isOwner);

  return (
    <nav className="overflow-x-auto">
      <div className="flex min-w-max border-b border-zinc-200 dark:border-zinc-800">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:border-zinc-600"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
