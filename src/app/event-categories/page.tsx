import type { Metadata } from "next";

import { EventCategoriesPageClient } from "@/components/pages/event-categories-page-client";

export const metadata: Metadata = {
  title: "Categories",
};

export default function EventCategoriesPage() {
  return <EventCategoriesPageClient />;
}
