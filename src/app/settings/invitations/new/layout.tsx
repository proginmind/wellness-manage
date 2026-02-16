import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invite Team Member",
};

export default function InviteTeamMemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
