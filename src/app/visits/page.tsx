import type { Metadata } from "next";

import { VisitsPageClient } from "@/components/pages/visits-page-client";

export const metadata: Metadata = {
  title: "Appointments",
};

export default function VisitsPage() {
  return <VisitsPageClient />;
}
