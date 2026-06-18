import type { Metadata } from "next";

import { VisitDetailPageClient } from "@/components/pages/visit-detail-page-client";

export const metadata: Metadata = {
  title: "Appointment Details",
};

export default function VisitDetailPage() {
  return <VisitDetailPageClient />;
}
