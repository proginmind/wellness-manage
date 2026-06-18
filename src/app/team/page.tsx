import type { Metadata } from "next";

import { TeamPageClient } from "@/components/pages/team-page-client";

export const metadata: Metadata = {
  title: "Staff",
};

export default function TeamPage() {
  return <TeamPageClient />;
}
