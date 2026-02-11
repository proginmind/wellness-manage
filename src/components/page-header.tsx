import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: {
    href: string;
    label: string;
  };
  action?: ReactNode;
}

export function PageHeader({ title, description, backLink, action }: PageHeaderProps) {
  return (
    <div className="border-b bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLink.label}
          </Link>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                {description}
              </p>
            )}
          </div>

          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}
