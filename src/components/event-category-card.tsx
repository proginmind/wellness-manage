import Link from "next/link";

import { EventCategory } from "@/types/event-category";
import { buildRoute } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EventCategoryCardProps {
  category: EventCategory;
}

export function EventCategoryCard({ category }: EventCategoryCardProps) {
  return (
    <Link href={buildRoute.eventCategory(category.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            {/* Color Indicator */}
            <div
              className="w-12 h-12 rounded-lg shrink-0"
              style={{ backgroundColor: category.color }}
            />

            {/* Category Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {category.name}
                </h3>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {category.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
