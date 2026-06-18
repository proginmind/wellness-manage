import type { Metadata } from "next";

import { EventTypesPageClient } from "@/components/pages/event-types-page-client";

export const metadata: Metadata = {
  title: "Services",
};

export default function EventTypesPage() {
  return <EventTypesPageClient />;
}
