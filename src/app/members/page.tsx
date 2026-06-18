import type { Metadata } from "next";

import { MembersPageClient } from "@/components/pages/members-page-client";

export const metadata: Metadata = {
  title: "Clients",
};

export default function MembersPage() {
  return <MembersPageClient />;
}
