import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Member Details",
};

export default function TeamMemberDetailsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
