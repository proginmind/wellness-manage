import { Folder } from "lucide-react";

import { EventCategory } from "@/types/event-category";
import { EventCategoryCard } from "@/components/event-category-card";

interface EventCategoryListProps {
  categories: EventCategory[];
}

export function EventCategoryList({ categories }: EventCategoryListProps) {
  // Display categories list or empty state
  if (categories.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <EventCategoryCard key={category.id} category={category} />
        ))}
      </div>
    );
  }

  // Empty state
  return (
    <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
      <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="text-lg font-medium mb-2">No categories yet</p>
      <p className="text-sm">Get started by creating your first service category</p>
    </div>
  );
}
